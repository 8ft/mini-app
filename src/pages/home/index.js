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
   hideNav:true,
   banners:[],
   broadcastData:[],
   autoplay:true,
   blogs:[],
   qas:[],
   tabIndex:0,
   types: ['全部','开发','设计','市场/运营','产品'],
   projects:[
    {
      code:'',
      list: [],
      pageIndex: 1,
      nomore: false
    },{
      code:'01',
      list: [],
      pageIndex: 1,
      nomore: false
    },{
      code:'02',
      list: [],
      pageIndex: 1,
      nomore: false
    },{
      code:'03',
      list: [],
      pageIndex: 1,
      nomore: false
    },{
      code:'04',
      list: [],
      pageIndex: 1,
      nomore: false
    }
   ],
   loading:true
  },

  onPageScroll(e) {
    const sTop=e.scrollTop
    if (sTop > 100 && this.data.hideNav === true) {
      this.setData({
        hideNav: false
      })
    } else if (sTop <= 100 && this.data.hideNav === false) {
      this.setData({
        hideNav: true
      })
    }

    const pTop=this.data.pTop
    if(!pTop)return
   
    if(sTop>=pTop&&!this.data.unlockScroll){
      this.data.unlockScroll=true
      this.setData({
        unlockScroll: true
      })

      wx.pageScrollTo({
        scrollTop: pTop,
        duration:0
      })

    }else if(sTop+10<pTop&&this.data.unlockScroll){
      this.data.unlockScroll=false
      this.setData({
        unlockScroll: false
      })
    }
  },

  async onShow(){
    this.props.stores.toRefresh.refresh('index',async(exist)=>{
      if(this.data.broadcastData.length===0){
        await this.getBanner()
        await this.getBroadcast()
        await this.getBlogs()
        await this.getQa()
        await this.getProjects()
      }else if(exist){
        this.refresh()
      }
    })
  },

  onHide(){
   this.setData({
    autoplay:false
   })
  },

  onPullDownRefresh(){
    this.getBanner()
    this.getBlogs()
    this.getQa()
    this.refresh()
  },

  refresh(){
    this.data.project={
      list: [],
      pageIndex: 1,
      nomore: false
     }
    this.getProjects()
  },

  onSwiperChange(e) {
    const index=e.detail.current===undefined?e.detail.index:e.detail.current
    if (index === this.data.tabIndex) return

    this.setData({
      tabIndex:index
    })

    if(this.data.projects[index].list.length===0){
      this.getProjects()
    }
  },

  getNavHeight(e) {
    const systemInfo = wx.getSystemInfoSync()
    const ratio = systemInfo.windowWidth / 750
    const swiperHeight = systemInfo.windowHeight - e.detail.height-54*ratio
    this.setData({
      navHeight:e.detail.height,
      swiperHeight:swiperHeight
    })
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

  async getBroadcast(){
    let res = await app.request.post('/public/homeRotationInfo/getHomeRotationList',{},false,true)
    if(res.code===0){
      if(this.data.broadcastData.length===0){
        this.setData({
          broadcastData:res.data
        })
      }else{
        this.data.broadcastData=res.data
      }

      if(!this.data.autoplay){
        this.setData({
          autoplay:true
         })
      }
    }
  },

  onBroadcastChange(e){
    const current=e.detail.current
    const len=this.data.broadcastData.length
    if(current>len-2){
      this.getBroadcast()
      this.timeout=setTimeout(()=>{
        this.setData({
          currentSwiperItem:0,
          broadcastData:this.data.broadcastData
        })
      },3000)
    }
  },

  async getBlogs(){
    let res = await app.request.post('/blog/carouselConfig/getList')
    if(res.code===0){
      this.setData({
        blogs: res.data.list
      })
    }
  },

  async getQa() {
    this.setData({
      loading:true
    })

    let res = await app.request.post('/qa/question/query/list', {
      queryType:5,
      questionState:'11|12',
      pageIndex: 1,
      pageSize:2
    })

    if (res.code === 0) {
      this.setData({
        qas:res.data.list.map((qa) => {
            if(qa.skillTag){
              qa.skillTag = qa.skillTag.split('|')
            }
            return qa
          }),
        loading:false
      })
    }
  },

  async getProjects (){
    let data=this.data.projects[this.data.tabIndex]
    let nomore = data.nomore
    if (nomore)return

    this.setData({
      loading:true
    })

    let pIndex = data.pageIndex
    let res = await app.request.post('/project/projectInfo/getList',{
      projectType:data.code,
      pageIndex:pIndex,
      pageSize:10
    })

    if (res.code !== 0) return
    if (res.data.page > pIndex){
      pIndex++
    }else{
      nomore=true
    }

    data.list=data.list.concat(res.data.list.map((project) => {
      if(project.projectSkill){
        project.projectSkill = project.projectSkill.split('|')
      }
      return project
    }))

    data.pageIndex=pIndex
    data.nomore=nomore
  
    this.setData({
      [`projects[${this.data.tabIndex}]`]:data,
      loading:false
    })

    if(!this.data.pTop){
      const query=this.createSelectorQuery()
      query.select('#projectTags').boundingClientRect()
      query.exec(res => {
        this.setData({
          pTop:res[0].top-this.data.navHeight
        })
      })
    }
    wx.stopPullDownRefresh()
  },

  bannerJump(e){
    app.bannerJump(e)
  }

}))
