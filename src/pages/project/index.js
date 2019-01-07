const app = getApp()
const regeneratorRuntime = require('../../libs/regenerator-runtime.js')
const observer = require('../../libs/observer').observer

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
   blogs:null,
   types: ['全部','开发','设计','市场运营','产品'],
   pageIndex: 1,
   projects:[],
   nomore: false
  },

  onShow:function(){
    this.props.stores.toRefresh.refresh('index',async(exist)=>{
      if(this.data.banners===null){
        this.getBanner()
        this.getBlogs()
        this.getProjects()
      }else if(exist){
        this.refresh()
      }
    })
  },

  onPullDownRefresh:function(){
    this.getBanner()
    this.getBlogs()
    this.refresh()
  },

  onReachBottom:function(){
    this.getProjects()
  },

  refresh:function(){
    this.setData({
      pageIndex: 1,
      projects: [],
      nomore: false
    })
    this.getProjects()
  },

  getBlogs:async function(){
    let res = await app.request.post('/blog/carouselConfig/getList')
    if(res.code===0){
      this.setData({
        blogs: res.data.list
      })
    }
  },

  getBanner:async function(){
    let res = await app.request.post('/public/appActivityMenu/getList', {
      menuClass: 'home_banner',
      clientVersion: '1.0.0'
    })
    if(res.code===0){
      this.setData({
        banners: res.data.filter(banner=>{
          return banner.menuType==='show'
        })
      })
    }
  },

  getProjects: async function (){
    let nomore = this.data.nomore
    if (nomore)return

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/project/projectInfo/getList',{
      pageIndex:pIndex,
      pageSize:10
    })

    if (res.code === 0) {
      let list = res.data.list.map((project) => {
        project.projectSkill = project.projectSkill.split('|')
        return project
      })
      if (res.data.page > pIndex){
        pIndex++
      }else{
        nomore=true
      }
    
      this.setData({
        projects: this.data.projects.concat(list),
        pageIndex:pIndex,
        nomore:nomore
      })
    }
    wx.stopPullDownRefresh()
  },

  bannerJump:function(e){
    app.bannerJump(e)
  }

}))
