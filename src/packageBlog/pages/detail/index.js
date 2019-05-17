const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime

const Towxml = require('../../../libs/towxml/main')
const towxml=new Towxml()  

const nodataCon = {
  '-1':{
    img:'',
    text:'文章已删除'
  },
  0: {
    img:'blog_audit',
    text:"别急呀！文章正在审核中...\n通过后即可查看，请稍后再试"
  },
  2: {
    img:'blog_illegal',
    text:'内容审核不通过'
  },
  3:{
    img:'blog_xiajia',
    text:'文章已下架'
  }
}

Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    isMyself:false,

    id:'',
    uid:'',
    detail:null,
    article:{},

    comments:[],
    commentsPostion:0,

    replies:[],
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
      path: `packageBlog/pages/detail/index?id=${this.data.id}&uid=${this.data.uid}`
    }
  },

  async openBox(e){
    const index=e.currentTarget.dataset.index
    if(index!==this.data.cIndex){
      this.setData({
        cIndex:index
      })

      if(this.data.replies.length>0){
        this.setData({
          replies:[],
          pageIndex:1,
          nomore:false
        })
      }

      const comment=this.data.comments[index]
      if(comment.replyNum>0){
        await this.getReplies()
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
        attentionUserId:this.data.updateUserId
      })
      if(res.code!==0)return
      this.props.stores.account.follow(this.data.attentionState===0?1:-1)
      this.setData({
        'detail.attentionState':this.data.attentionState===0?1:0
      })
    }
  },

  async collect(){
    if(app.checkLogin()){
      const res = await app.request.post('/blog/favorite/save',{
        articleId:this.data.id
      })
      if(res.code!==0)return
      this.props.stores.account.collect(this.data.favoriteState===0?1:-1)
      this.setData({
        'detail.favoriteState':this.data.favoriteState===0?1:0
      })
      this.props.stores.toRefresh.updateList('collect')
    }
  },

  async getDetail () {
    this.setData({loading:true})

    let detail = await app.request.post('/blog/article/detail',{
      articleId:this.data.id,
      comments:2
    })
    if (detail.code !== 0) return

    detail.data.createTime=app.util.formatTime(detail.data.createTime,'blogDetail')
    detail.data.articleTags=[detail.data.categoryName].concat(detail.data.articleTags.split('|'))
    detail.data.nodata=nodataCon[detail.data.articleState]

    let isMyself=false
    if(this.props.stores.account.logged_in){
      isMyself=this.props.stores.account.userInfo.userId===this.data.uid
    }

    const {
      articleState,
      articleTitle,
      articleType,
      userAvatar,
      updateUserId,
      nickName,
      articleSourceTypeName,
      createTime,
      viewNum,
      attentionState,
      auditRemark,
      articleTags,
      favoriteState,
      comments:{count}
    }=detail.data

    this.setData({
      isMyself:isMyself,
      loading:false,
      
      articleState,
      articleTitle,
      articleType,
      userAvatar,
      updateUserId,
      nickName,
      articleSourceTypeName,
      createTime,
      viewNum,
      attentionState,
      auditRemark,
      articleTags,
      favoriteState,
      count,

      comments:detail.data.comments.list.map(item=>{
        item.createTime=app.util.formatTime(item.createTime,'blogComment')
        return item
      })
    })
    
    //解析html
    let wxml = towxml.toJson(
      detail.data.content,               
      'html'             
    )

    this.setData({
      article: wxml
    })
  
  },


  async getReplies () {
    let nomore = this.data.nomore
    if(nomore)return

    let pIndex=this.data.pageIndex
    let res = await app.request.post('/blog/comment/getList',{
      articleId:this.data.id,
      comments:2,
      replyId:this.data.comments[this.data.cIndex].id,
      pageIndex:pIndex
    })
    if (res.code !== 0) return

    if (res.data.page > pIndex){
      pIndex++
    }else{
      nomore=true
    }

    this.setData({
      nomore:nomore,
      pageIndex:pIndex,
      replies:this.data.replies.concat(res.data.list.map(item=>{
        item.createTime=app.util.formatTime(item.createTime,'blogComment')
        return item
      }))
    })
  },

  download:app.download

}))


