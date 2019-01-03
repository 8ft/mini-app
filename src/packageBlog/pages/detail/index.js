const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer
const Towxml = require('../../towxml/main')

const towxml=new Towxml()  

Page(observer({
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

  onLoad:function(options){
    wx.getSystemInfo({
      success: res => {
        let isIPX=false
        if(/iPhone X/.test(res.model)){
          isIPX=true
        }

        let fixedHeight=isIPX?34:0
        let boxHeight=res.windowHeight*.98
        this.setData({
          boxHeight:boxHeight,
          scrollViewHeight: boxHeight-fixedHeight - (180+fixedHeight)/res.pixelRatio
        })
      }
    })
    
    this.setData({
      uid:options.uid||'',
      id:options.id
    })
  },

  onShow:function(){
    this.getDetail()
  },

  onShareAppMessage: function () {
    return {
      title: '接包发包专业平台',
      path: `pages/blog/detail/index?id=${this.data.id}&uid=${this.data.uid}`
    }
  },

  openBox:async function(e){
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

  closeBox:function(){
    this.setData({
      boxSwitch:false
    })
  },

  scrollToComments:function(){
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

  follow:async function(){
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

  collect:async function(){
    if(app.checkLogin()){
      const res = await app.request.post('/blog/favorite/save',{
        articleId:this.data.id
      })
      if(res.code!==0)return
      this.props.stores.account.collect(this.data.detail.favoriteState===0?1:-1)
      this.setData({
        'detail.favoriteState':this.data.detail.favoriteState===0?1:0
      })
    }
  },

  getDetail: async function () {
    this.setData({loading:true})

    let detail = await app.request.post('/blog/article/detail',{
      articleId:this.data.id,
      comments:2
    })
    if (detail.code !== 0) return

    detail.data.createTime=app.util.formatTime(detail.data.createTime,'blogDetail')
    detail.data.articleTags=[detail.data.categoryName].concat(detail.data.articleTags.split('|'))

    let nodata
    switch(detail.data.articleState){
      case -1:
        nodata={
          img:'',
          text:'文章已删除'
        }
      break;
      case 0:
        nodata={
          img:'blog_audit',
          text:"别急呀！文章正在审核中...\n通过后即可查看，请稍后再试"
        }
      break;
      case 2:
        nodata={
          img:'blog_illegal',
          text:'内容审核不通过'
        }
      break;
      case 3:
        nodata={
          img:'blog_xiajia',
          text:'文章已下架'
        }
      break;
    }
    detail.data.nodata=nodata

    let isMyself=false
    if(this.props.stores.account.logged_in){
      isMyself=this.props.stores.account.userInfo.userId===this.data.uid
    }

    this.setData({
      isMyself:isMyself,
      loading:false,
      detail:detail.data,
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

  getReplies: async function () {
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
