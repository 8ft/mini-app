const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
   typeId:'',
   typeIndex:0,
   types: [],
   typesCn:[],

   pageIndex: 1,
   blogs:[],
   nomore: false,
   loading:true
  },

  onLoad(options){
    const systemInfo=wx.getSystemInfoSync()
    this.setData({
      navHeight: `${100+systemInfo.statusBarHeight*750/systemInfo.windowWidth}rpx`,
      typeId:options.id||'',
      typeIndex:parseInt(options.index)||0
    })
  },

  onShow(){
    this.props.stores.toRefresh.refresh('blog_list',exist=>{
      if(this.data.types.length===0){
        this.getBlogTypes()
        this.getBlogs()
      }else if(exist){
        this.refresh()
      }
    })
  },

  onPullDownRefresh(){
    this.refresh()
  },

  onReachBottom(){
    this.getBlogs()
  },

  refresh(){
    this.data.pageIndex=1
    this.data.blogs=[]
    this.data.nomore=false
    this.getBlogs()
  },

  switchList(e){
    let index=e.detail.index
    this.setData({
      typeIndex:index,
      typeId:this.data.types[index].id
    })
    this.refresh()
  },

  async getBlogTypes(){
    let res = await app.request.post('/blog/category/getAvailableList',{
      scope:1
    })
    if (res.code === 0) {
      let data=res.data
      this.setData({
        types: data,
        typesCn:data.map(item=>{
          return item.name
        })
      })
    }
  },

  async getBlogs (){
    let nomore = this.data.nomore
    if (nomore)return

    this.setData({
      loading:true
    })

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/blog/article/getList',{
      queryType:1,
      categoryId:this.data.typeId,
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
        blogs: this.data.blogs.concat(res.data.list.map(blog=>{
          if(blog.articleBrief.length>50){
            blog.articleBrief=blog.articleBrief.substring(0,50)+'...'
          }
          blog.createTime=app.util.formatTime(blog.createTime,'blogCard')
          return blog
        })),
        pageIndex:pIndex,
        nomore:nomore,
        loading:false
      })
    }
    wx.stopPullDownRefresh()
  }
  
}))
