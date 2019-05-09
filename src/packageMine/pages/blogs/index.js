const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    tagIndex:0,
    tags:[],

    blogs:[],
    pageIndex: 1,
    nomore: false,

    loading:true,
  },

  onLoad (options) {
    this.setData({
      'tags[0]':{
        name:'全部标签',
        articleNum:this.props.stores.account.blogInfo.articleNum,
        id:''
      }
    })
    this.getBlogTags()
  },

  refresh(){
    if(this.data.loading)return
    this.data.pageIndex=1
    this.data.nomore=false
    this.data.blogs=[]
    this.getBlogs()
  },

  onPullDownRefresh(){
    this.refresh()
  },

  onReachBottom(){
    this.getBlogs()
  },

  switchTag(e){
    const index = e.currentTarget.dataset.index
    this.setData({
      tagIndex:index,
      blogs:[],
      pageIndex: 1,
      nomore: false,
    })
    if(this.data.tags[index].articleNum!==0){
      this.getBlogs()
    }
  },

  async getBlogTags (){
    let res = await app.request.post('/blog/catalog/getList',{
      userId: this.props.stores.account.userInfo.userId,
      pageIndex:1,
      pageSize:99
    })
    if (res.code !== 0)return
    this.setData({
      tags:this.data.tags.concat(res.data.list)
    }) 
    this.getBlogs()
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
      articleType:1,
      catalogId:this.data.tags[this.data.tagIndex].id,
      ownerId:this.props.stores.account.userInfo.userId,
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