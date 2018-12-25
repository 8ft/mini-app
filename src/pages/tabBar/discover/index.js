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
     selected:{},
     list:[]
   },
   jobTypes:{
     parent:'',
     selected:{},
     list:[]
   },
   exp:{
    selected:{},
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
    if(this.data.pageIndex===0){
      this.getBlogs()
    }else{
      this.getExperts()
    }
  },

  switchPage:function(e){
    const pageIndex=e.currentTarget.dataset.index
    this.setData({
      pageIndex:pageIndex
    })
    if(pageIndex===1&&!this.data.cities){
      this.getFilter()
      this.getExperts()
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
      this.setData({
        'experts.pageIndex': 1,
        'experts.list': [],
        'experts.nomore': false
      })
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
        types: res.data.splice(1)
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
    },true)

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
          blog.createTime=app.util.formatTime(blog.createTime,'blogCard')
          return blog
        })),
        'blogs.pageIndex':pIndex,
        'blogs.nomore':nomore
      })
    }
    wx.stopPullDownRefresh()
  },
  
  bannerJump:function(e){
   app.bannerJump(e)
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
          'sortWay.selected':data.item
        })
      break;
      case 'exp':
        this.setData({
          'exp.selected':data.item
        })
      break;
      case 'jobTypes':
        this.setData({
          'jobTypes.selected':data.item
        })
      break;
    }

    this.refresh()
    this.closePopup()
  },

  selectCity:function(e){
    this.setData({
      selectedCity:e.detail.city
    })
    this.refresh()
    this.closePopup()
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
       'sortWay.selected':res.data.sortFieldOptions[0],
       'jobTypes.list':jobTypes.data.data[0].dictList,
       'exp.list':this.data.exp.list.concat(res.data.workExperienceOptions),
       cities:cities.data.data
     })
    }
  },

  scrollToJobTypes:function(e){
    this.setData({
      'jobTypes.parent':'job'+e.currentTarget.dataset.code
    })
  },

  getExperts:async function(){
    const data=this.data
    let nomore = data.experts.nomore
    if (nomore)return

    let pIndex = data.experts.pageIndex
    let res = await app.request.post('/user/talent/searchTalents',{
      positionType:data.jobTypes.selected.dictValue||'',
      workExperience:data.exp.selected.value||'',
      city:data.selectedCity.zoneCode||'',
      sortField:data.sortWay.selected.value||'',
      pageIndex:pIndex
    })

    if (res.code === 0) {
      if (res.data.page > pIndex){
        pIndex++
      }else{
        nomore=true
      }
    
      this.setData({
        'experts.list': data.experts.list.concat(res.data.list),
        'experts.pageIndex':pIndex,
        'experts.nomore':nomore
      })
    }
    wx.stopPullDownRefresh()
  }

}))
