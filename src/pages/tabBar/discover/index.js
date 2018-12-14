const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer;

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
   pageIndex:0,

   banners:null,
   types: [],
   blogs:{
     list:[],
     pageIndex: 1,
     nomore: false
   },

   activeFilter:'',
   sortWay:{
     index:0,
     list:[]
   },
   jobTypes:{
     index:0,
     list:[]
   },
   exp:{
     index:0,
     list:[]
   },
   selectedCity:{},
   cities:null,

   experts:{
      list:[],
      pageIndex: 1,
      nomore: false
    }
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
    this.refresh()
  },

  onReachBottom:function(){
    this.getBlogs()
  },

  switchPage:function(e){
    const pageIndex=e.currentTarget.dataset.index
    this.setData({
      pageIndex:pageIndex
    })
    if(pageIndex===1&&!this.data.cities){
      this.getFilter()
      // this.getExperts()
    }
  },

  refresh:function(){
    if(this.data.pageIndex===0){
      this.setData({
        'blogs.pageIndex': 1,
        'blogs.list': [],
        'blogs.nomore': false
      })
      this.getBanner()
      this.getBlogs()
    }else{
      if(this.data.experts.list.length>0){
        this.setData({
          'experts.pageIndex': 1,
          'experts.list': [],
          'experts.nomore': false
        })
      }
      this.getExperts()
    }
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
    let nomore = this.data.blogs.nomore
    if (nomore)return

    let pIndex = this.data.blogs.pageIndex
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
        'blogs.list': this.data.blogs.list.concat(res.data.list.map(blog=>{
          if(blog.articleBrief.length>76){
            blog.articleBrief=blog.articleBrief.substring(0,76)+'...'
          }
          return blog
        })),
        'blogs.pageIndex':pIndex,
        'blogs.nomore':nomore
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
  },

  selectFilter: function (e) {
    if(this.data.activeFilter){
      this.setData({
        activeFilter:''
      })
    }else{
      this.setData({
        activeFilter: e.currentTarget.dataset.name
      })
    }
  },

  closePopup:function(){
    this.setData({
      activeFilter: ''
    })
  },

  filter:function(e){
    let data=e.currentTarget.dataset
    switch(data.type){
      case 'sortWay':
        this.setData({
          'sortWay.index':data.index
        })
      break;
    }

    this.refresh()
    this.close()
  },

  getFilter: async function () {
    let res = await app.request.post('/user/talent/searchCondition')
    let cities = await app.request.post('/dict/dictZone/talentAreaList')
    let jobTypes = await app.request.post('/dict/dictCommon/getDicts', {
      dictType: 'job_type',
      resultType: '1'
    })

    if(res.code===0&&cities.code===0&&jobTypes.code===0){
     this.setData({
       'sortWay.list':res.data.sortFieldOptions,
       'jobTypes.list':jobTypes.data.data[0].dataList,
       'exp.list':res.data.workExperienceOptions,
       cities:cities.data.data
     })
    }
  },

  selectCity:function(e){
    console.log(e.detail.city)
  }

}))
