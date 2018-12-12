const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer;

Page(observer({
  props: {
    stores: app.stores
  },

  onShareAppMessage: function (res) {
    return {
      title: '接包发包专业平台'
    }
  },

  data: {
   banners:null,
   types: [],
   pageIndex: 1,
   blogs:[],
   nomore: false
  },

  onShow:function(){
    this.props.stores.toRefresh.refresh('discover',exist=>{
      if(this.data.banners===null){
        this.getBanner()
        this.getBlogTypes()
        this.getBlogs()
      }else if(exist){
        this.refresh()
      }
    })
  },

  onPullDownRefresh:function(){
    this.getBanner()
    this.refresh()
  },

  onReachBottom:function(){
    this.getBlogs()
  },

  refresh:function(){
    this.setData({
      pageIndex: 1,
      blogs: [],
      nomore: false
    })
    this.getBlogs()
  },

  getBanner:async function(){
    let res = await app.request.post('/blog/carouselConfig/getList')
    if(res.code===0){
      this.setData({
        banners: res.data.list
      })
    }
  },

  getBlogTypes:async function(){
    let res = await app.request.post('/blog/category/getAvailableList',{
      scope:1
    })
    if (res.code === 0) {
      this.setData({
        types: res.data
      })
    }
  },

  getBlogs: async function (){
    let nomore = this.data.nomore
    if (nomore)return

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/blog/article/getList',{
      queryType:1,
      articleType:1,
      categoryId:1,
      pageIndex:pIndex,
      pageSize:10
    })

    if (res.code === 0) {
      if (res.data.page > pIndex){
        pIndex++
      }else{
        nomore=true
      }
    
      this.setData({
        blogs: this.data.blogs.concat(res.data.list.map(blog=>{
          if(blog.articleBrief.length>76){
            blog.articleBrief=blog.articleBrief.substring(0,76)+'...'
          }
          return blog
        })),
        pageIndex:pIndex,
        nomore:nomore
      })
    }
    wx.stopPullDownRefresh()
  },
  
  bannerJump:function(e){
    let obj=e.currentTarget.dataset.obj
    switch (obj.menuType){
      case 'view':
        // wx.navigateTo({
        //   url: `/pages/common/webview/index?url=${encodeURIComponent(obj.menuUrl)}`
        // })
      break;
      case 'click':
      break;
    }
  }
}))
