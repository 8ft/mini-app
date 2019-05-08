const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    swiperHeight:0,
    tabIndex:0,

    pageSize:10,
    loading:true,
    myQuestions:{
      states: [
        {
          dictName: '全部',
          dictValue: ''
        },
        {
          dictName: '已解决',
          dictValue: '12'
        },
        {
          dictName: '未解决',
          dictValue: '11'
        },
        {
          dictName: '已关闭',
          dictValue: '0|22'
        },
        {
          dictName: '审核中',
          dictValue: '10'
        },
        {
          dictName: '未通过',
          dictValue: '20'
        },
        {
          dictName: '已下架',
          dictValue: '13|21'
        }
      ],
      currentState:0,
      list:[],
      pageIndex: 1,
      nomore: false
    },

    myAnswers: {
      states: [
        {
          dictName: '全部',
          dictValue: ''
        },
        {
          dictName: '已解决',
          dictValue: '12'
        },
        {
          dictName: '未解决',
          dictValue: '11'
        },
        {
          dictName: '已采纳',
          dictValue: '12'
        }
      ],
      currentState: 0,
      list: [],
      pageIndex: 1,
      nomore: false
    }
  },

  onShow(){
    if(!this.props.stores.account.logged_in)return 
    this.props.stores.toRefresh.refresh('qa',(exist)=>{
      if (this.data.swiperHeight===0){
        this.getMyQuestions()
      }else if(exist){
        this.refresh()
      }
    })
  },

  refresh(){
    if (this.data.tabIndex === 0) {
      this.data.myQuestions.pageIndex=1
      this.data.myQuestions.nomore=false
      this.data.myQuestions.list=[]
      this.getMyQuestions()
    } else {
      this.data.myAnswers.pageIndex=1
      this.data.myAnswers.nomore=false
      this.data.myAnswers.list=[]
      this.getMyAnswers()
    }
  },

  getNavHeight(e) {
    const systemInfo = wx.getSystemInfoSync()
    const ratio = systemInfo.windowWidth / 750
    const swiperHeight = systemInfo.windowHeight - e.detail.height
    this.setData({
      swiperHeight:swiperHeight,
      scrollViewHeight: swiperHeight- 80 * ratio
    })
  },

  tabChange(e) {
    this.switchPage(e.detail.index)
  },

  onSwiperChange(e) {
    this.switchPage(e.detail.current)
  },

  switchPage(index) {
    if (index === this.data.tabIndex) return
    this.setData({
      tabIndex: index
    })

    if (index === 0 && this.data.myQuestions.list.length===0) {
      this.getMyQuestions()
    } else if (index === 1 && this.data.myAnswers.list.length===0) {
      this.getMyAnswers()
    } 
  },

  switchState(e){
    const index = e.currentTarget.dataset.index
    if(this.data.tabIndex===0){
      this.setData({
        'myQuestions.currentState':index
      })
    }else{
      this.setData({
        'myAnswers.currentState': index
      })
    }
    this.refresh()
  },

  delete(e){
    const index=e.currentTarget.dataset.index
    this.data.myAnswers.list.splice(index,1)
    this.setData({
      'myAnswers.list':this.data.myAnswers.list
    })
    this.props.stores.account.deleteAnswer()
  },

  async getMyQuestions(){
    if(!this.props.stores.account.blogInfo.questionNum)return

    let myQuestions = this.data.myQuestions
    if (myQuestions.nomore) return 
    this.setData({
      loading:true
    })

    let res = await app.request.post('/qa/question/query/list', {
      queryType:'2',
      questionState: myQuestions.states[myQuestions.currentState].dictValue,
      pageIndex: myQuestions.pageIndex,
      pageSize:this.data.pageSize
    })
    if (res.code !== 0)return 

    if (res.data.count > myQuestions.pageIndex*this.data.pageSize){
      myQuestions.pageIndex++
    }else{
      this.setData({
        'myQuestions.nomore':true
      })
    }
    
    this.setData({
      'myQuestions.pageIndex': myQuestions.pageIndex,
      'myQuestions.list':myQuestions.list.concat(res.data.list.map(question => {
        if(question.skillTag){
          question.skillTag = question.skillTag.split('|')
        }
        return question
      })),
      loading:false
    })
  },

  async getMyAnswers(){
    if (!this.props.stores.account.blogInfo.answerNum) return 

    let myAnswers = this.data.myAnswers
    if (myAnswers.nomore) return 
    this.setData({
      loading: true
    })

    let res = await app.request.post('/qa/question/query/list', {
      queryType:'3',
      questionState: myAnswers.states[myAnswers.currentState].dictValue,
      pageIndex: myAnswers.pageIndex,
      pageSize:this.data.pageSize
    })
    if (res.code !== 0) return

    if (res.data.count > myAnswers.pageIndex * this.data.pageSize) {
      myAnswers.pageIndex++
    } else {
      this.setData({
        'myAnswers.nomore': true
      })
    }

    if(myAnswers.currentState===1){
      res.data.list=res.data.list.filter(answer=>{
        return !answer.isBest
      })
    }else if(myAnswers.currentState===3){
      res.data.list=res.data.list.filter(answer=>{
        return answer.isBest
      })
    }

    this.setData({
      'myAnswers.pageIndex': myAnswers.pageIndex,
      'myAnswers.list': myAnswers.list.concat(res.data.list.map(answer => {
        if(answer.skillTag){
          answer.skillTag = [answer.subTypeName].concat(answer.skillTag.split('|'))
        }
        return answer
      })),
      loading:false
    })
  }

}))