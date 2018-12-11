const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer;

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    id:'',
    detail:null,

    comments:[],
    commentsPostion:0,

    cIndex:-1,
    boxSwitch:false,
    scrollViewHeight:0,
    loading:true
  },

  onLoad:function(options){
    wx.getSystemInfo({
      success: data => {
        let fixedHeight=wx.getStorageSync('isIPX')?34:0
        this.setData({
          scrollViewHeight: data.windowHeight*.98-fixedHeight - (180+fixedHeight)/data.pixelRatio
        })
      }
    })

    this.setData({
      id:options.id
    })
  },

  onShow:function(){
   this.getDetail()
  },

  onShareAppMessage: function () {
    return {
      title: '接包发包专业平台',
      path: `pages/blog/detail/index?id=${this.data.id}`
    }
  },

  openBox:function(e){
    this.setData({
      cIndex:e.currentTarget.dataset.index,
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
      this.setData({
        'detail.favoriteState':this.data.detail.favoriteState===0?1:0
      })
    }
  },

  getDetail: async function () {
    this.setData({loading:true})

    let detail = await app.request.post('/blog/article/detail',{
      articleId:this.data.id,
      comments:1
    })
    if (detail.code !== 0) return

    detail.data.createTime=detail.data.createTime.split(' ')[0]
    detail.data.articleTags=detail.data.articleTags.split('|')
    this.setData({
      loading:false,
      detail:detail.data,
      comments:detail.data.comments.list
    })
  }

}))
