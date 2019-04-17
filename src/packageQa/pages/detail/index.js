const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime

const Towxml = require('../../../libs/towxml/main')
const towxml=new Towxml()  
const nodataCon = {
  10: {
    img:'blog_audit',
    text:"别急呀！问题正在审核中...\n通过后即可查看，请稍后再试"
  },
  20: {
    img:'blog_illegal',
    text:'问题涉嫌违规，发起者正在完善中…'
  },
  22:{
    img:'blog_xiajia',
    text:'好遗憾，该问题可能已经被关闭或删除了'
  }
}

Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    isMyself:false,

    detail:null,
    article:{},

    lists:{
      best:[],
      hots:[],
      answers:[]
    },
   
    commentsPostion:0,
    nomore:false,
    pageIndex:1,

    cIndex:-1,
    boxSwitch:false,
    boxHeight:0,
    scrollViewHeight:0,
    loading:true
  },

  onLoad(options){
    const systemInfo=wx.getSystemInfoSync()
    const pixelRatio=systemInfo.windowWidth/750
    const boxHeight=(systemInfo.windowHeight-100*pixelRatio-systemInfo.statusBarHeight)*.98
    this.setData({
      boxHeight:boxHeight,
      scrollViewHeight: boxHeight- 180*pixelRatio,
      uid:options.uid||'',
      id:options.id
    })
  },

  onShow(){
    this.getDetail()
  },

  onShareAppMessage () {
    return {
      title: '接包发包专业平台',
      path: `packagePublish/pages/qa/detail/index?id=${this.data.id}&uid=${this.data.uid}`
    }
  },

  async openBox(e){
    const belongs=e.currentTarget.dataset.belongs
    const index=e.currentTarget.dataset.index

    if(index!==this.data.cIndex||belongs!==this.data.belongs){
      this.setData({
        belongs:belongs,
        cIndex:index
      })

      const answer=this.data.lists[belongs][index]
      if(answer.replyNum>0&&!answer.replies){
        await this.getComments(answer.id,belongs,index)
      }
    }

    this.setData({
      boxSwitch:true
    })
  },

  closeBox(){
    this.setData({
      boxSwitch:false
    })
  },

  scrollToComments(){
    if(this.data.commentsPostion===0){
      const query = wx.createSelectorQuery()
      query.select('#answers').fields({
        rect: true
      }, res => {
        wx.pageScrollTo({
          scrollTop: res.top,
          duration: 300
        })
        this.setData({
          commentsPostion:res.top
        })
      }).exec()
    }else{
      wx.pageScrollTo({
        scrollTop: this.data.commentsPostion,
        duration: 0
      })
    }
  },

  async take(e){
    wx.showModal({
      title: '提示',
      confirmText:'提交',
      confirmColor:'#4C87F9',
      content: this.data.detail.rewardAmount>0?'请确认是否已解决你的问题，答案一经采纳后即同意将悬赏金额答谢给回答者':'请确认是否已解决你的问题，答案一经采纳后将无法撤销',
      success: async res=> {
        if (res.confirm) {
          let res = await app.request.post('/qa/question/acceptQuestionAnswer', {
            questionId:this.data.detail.id,
            answerId:e.currentTarget.dataset.id
          })
          if (res.code === 0) {
            this.data.lists={
              best:[],
              hots:[],
              answer:[]
            },
            this.data.pageIndex=1
            this.data.nomore=false
            this.getAnswers()
          }
        }
      }
    })
  },

  async like(e){
    if(app.checkLogin()){
      const res = await app.request.post('/qa/answer/praise',{
        answerId:e.currentTarget.dataset.id
      })
      if(res.code!==0)return

      const index=e.currentTarget.dataset.index
      const belongs=e.currentTarget.dataset.belongs
      if(this.data.boxSwitch){
        let answer=this.data.lists[belongs][cIndex].replies[index]
        this.setData({
          [`lists.${belongs}[${this.data.cIndex}].replies[${index}].praiseNum`]:answer.praiseNum+(answer.praiseFlag?-1:1),
          [`lists.${belongs}[${this.data.cIndex}].replies[${index}].praiseFlag`]:!answer.praiseFlag
        })
      }else{
        let answer=this.data.lists[belongs][index]
        this.setData({
          [`lists.${belongs}[${index}].praiseNum`]:answer.praiseNum+(answer.praiseFlag?-1:1),
          [`lists.${belongs}[${index}].praiseFlag`]:!answer.praiseFlag
        })
      }
    }
  },

  async follow(){
    if(app.checkLogin()){
      const res = await app.request.post('/blog/attentionInfo/follow',{
        attentionUserId:this.data.detail.userId
      })
      if(res.code!==0)return
      this.props.stores.account.follow(this.data.detail.followFlag===0?1:-1)
      this.setData({
        'detail.followFlag':this.data.detail.followFlag===0?1:0
      })
    }
  },

  async collect(){
    if(app.checkLogin()){
      const res = await app.request.post('/qa/question/collect',{
        questionId:this.data.detail.id,
        userId:this.props.stores.account.userInfo.userId,
        collect:this.data.detail.collectFlag===0?1:0
      })
      if(res.code!==0)return
      this.setData({
        'detail.collectFlag':this.data.detail.collectFlag===0?1:0
      })
      this.props.stores.toRefresh.updateList('collect')
    }
  },

  async getDetail () {
    this.setData({loading:true})

    let detail = await app.request.post('/qa/question/query/detail',{
      questionId:this.data.id
    })
    if (detail.code !== 0) return

    detail.data.createTime=app.util.formatTime(detail.data.createTime,'blogDetail')
    detail.data.skillTag=[detail.data.subTypeName].concat(detail.data.skillTag.split('|'))
    detail.data.nodata=nodataCon[detail.data.questionState]

    let isMyself=false
    if(this.props.stores.account.logged_in){
      isMyself=this.props.stores.account.userInfo.userId===this.data.uid
    }

    this.setData({
      active:detail.data.questionState===11||detail.data.questionState===12,
      isMyself:isMyself,
      loading:false,
      detail:detail.data
    })

    //解析html
    let wxml = towxml.toJson(
      detail.data.content,               
      'html'             
    )

    this.setData({
      article: wxml
    })

    if(detail.data.answerNum>0){
      this.getAnswers()
    }
  },

  async getAnswers () {
    let nomore = this.data.nomore
    if(nomore)return

    let pIndex=this.data.pageIndex
    let res = await app.request.post('/qa/answer/listMultiAnswers',{
      questionId:this.data.id,
      pageIndex:pIndex
    })
    if (res.code !== 0) return

    if(pIndex===1){
      this.setData({
        'lists.best':this.data.lists.best.concat(res.data.best?res.data.best.map(item=>{
          item.createTime=app.util.formatTime(item.createTime,'blogComment')
          return item
        }):[]),
        'lists.hots':this.data.lists.hots.concat(res.data.hots?res.data.hots.map(item=>{
          item.createTime=app.util.formatTime(item.createTime,'blogComment')
          return item
        }):[])
      })
    }
   
    if (res.data.answers.page > pIndex){
      pIndex++
    }else{
      nomore=true
    }

    this.setData({
      nomore:nomore,
      pageIndex:pIndex,
      'lists.answers':this.data.lists.answers.concat(res.data.answers.list.map(item=>{
        item.createTime=app.util.formatTime(item.createTime,'blogComment')
        return item
      }))
    })
  },

  async getComments (answerId,belongs,index) {
    let res = await app.request.post('/qa/answer/listAnswers',{
      questionId:this.data.id,
      answerId:answerId,
      pageIndex:1,
      pageSize:100
    })

    if(res.code!==0)return
   
    this.setData({
      [`lists.${belongs}[${index}].replies`]: res.data.list.map(item=>{
        item.createTime=app.util.formatTime(item.createTime,'blogComment')
        return item
      })
    })
  },

  download:app.download

}))