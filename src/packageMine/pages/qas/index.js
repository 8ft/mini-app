const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    swiperHeight:0,
    typeIndex:0,

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
          dictValue: '22'
        },
        {
          dictName: '审核中',
          dictValue: '10'
        },
        {
          dictName: '未通过',
          dictValue: '20'
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
    if (this.data.typeIndex === 0) {
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
    if(this.data.typeIndex===0){
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

  async getMyQuestions(){
    this.setData({
      loading:true
    })
    let myQuestions = this.data.myQuestions
    if (myQuestions.nomore) return 
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
        if(question.skillCode){
          question.skillCode = question.skillCode.split('|')
        }
        return question
      })),
      loading:false
    })
  },

  async getMyAnswers(){
    this.setData({
      loading: true
    })
    let myAnswers = this.data.myAnswers
    if (myAnswers.nomore) return
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

    this.setData({
      'myAnswers.pageIndex': myAnswers.pageIndex,
      'myAnswers.list': myAnswers.list.concat(res.data.list.map(answer => {
        if(answer.skillCode){
          answer.skillCode = answer.skillCode.split('|')
        }
        return answer
      })),
      loading:false
    })
  }

}))