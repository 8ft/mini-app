const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime

Page(app.observer({
  props: {
    stores: app.stores
  },

  onShareAppMessage (res) {
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

  onShow(){
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

  onPullDownRefresh(){
    this.getBanner()
    this.getBlogs()
    this.refresh()
  },

  onReachBottom(){
    this.getProjects()
  },

  refresh(){
    this.data.pageIndex=1
    this.data.projects=[]
    this.data.nomore=false
    this.getProjects()
  },

  async getBlogs(){
    let res = await app.request.post('/blog/carouselConfig/getList')
    if(res.code===0){
      this.setData({
        blogs: res.data.list
      })
    }
  },

  async getBanner(){
    let res = await app.request.post('/public/appActivityMenu/getList', {
      menuClass: 'home_banner',
      clientVersion: '1.0.0'
    })
    if(res.code===0){
      this.setData({
        banners: res.data.filter(banner=>{
          banner.iconImageUrl=banner.iconImageUrl.replace('http:','https:')
          return banner.menuType!=='view'
        })
      })
    }
  },

  async getProjects (){
    let nomore = this.data.nomore
    if (nomore)return

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/project/projectInfo/getList',{
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
        projects: this.data.projects.concat(res.data.list.map((project) => {
          if(project.projectSkill){
            project.projectSkill = project.projectSkill.split('|')
          }
          return project
        })),
        pageIndex:pIndex,
        nomore:nomore
      })
    }
    wx.stopPullDownRefresh()
  },

  bannerJump(e){
    app.bannerJump(e)
  }

}))
