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
    text:'问题审核不通过'
  },
  22:{
    img:'blog_xiajia',
    text:'问题已下架'
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

    comments:[],
    commentsPostion:0,

    comments:[],
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
    const index=e.currentTarget.dataset.index
    if(index!==this.data.cIndex){
      this.setData({
        cIndex:index
      })

      const comment=this.data.comments[index]
      if(comment.replyNum>0&&!comment.replies){
        await this.getComments(comment.id,index)
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
      query.select('#comments').fields({
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

  async follow(){
    if(app.checkLogin()){
      const res = await app.request.post('/blog/attentionInfo/follow',{
        attentionUserId:this.data.detail.updateUserId
      })
      if(res.code!==0)return
      this.props.stores.account.follow(this.data.detail.attentionState===0?1:-1)
      this.setData({
        'detail.attentionState':this.data.detail.attentionState===0?1:0
      })
    }
  },

  async collect(){
    if(app.checkLogin()){
      const res = await app.request.post('/blog/favorite/save',{
        articleId:this.data.id
      })
      if(res.code!==0)return
      this.props.stores.account.collect(this.data.detail.favoriteState===0?1:-1)
      this.setData({
        'detail.favoriteState':this.data.detail.favoriteState===0?1:0
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
      this.getComments()
    }
  },

  async getComments (answerId,index) {
    let nomore = this.data.nomore
    if(nomore&&!answerId)return

    let pIndex=!answerId?this.data.pageIndex:1
    const pageSize=!answerId?10:100
    let res = await app.request.post('/qa/answer/listAnswers',{
      questionId:this.data.id,
      answerId:answerId||'',
      pageIndex:pIndex,
      pageSize:pageSize
    })
    if (res.code !== 0) return

    if(!answerId){
      if (res.data.page > pIndex){
        pIndex++
      }else{
        nomore=true
      }
    }

    let obj
    if(answerId){
      obj={
        [`comments[${index}].replies`]:res.data.list.map(item=>{
          item.createTime=app.util.formatTime(item.createTime,'blogComment')
          return item
        })
      }
    }else{
      obj={
        nomore:nomore,
        pageIndex:pIndex,
        comments:this.data.comments.concat(res.data.list.map(item=>{
          item.createTime=app.util.formatTime(item.createTime,'blogComment')
          return item
        }))
      }
    }

    this.setData(obj)
  },

  download:app.download

}))
