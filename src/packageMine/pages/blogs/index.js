const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

Page(observer({
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

  onLoad:function (options) {
    this.setData({
      'tags[0]':{
        name:'全部标签',
        articleNum:this.props.stores.account.blogInfo.articleNum,
        id:''
      }
    })
    this.getBlogTags()
  },

  refresh:function(){
    let blogs = this.data.blogs
    this.setData({
      pageIndex: 1,
      nomore: false,
      blogs: []
    })
    this.getBlogs()
  },

  onPullDownRefresh:function(){
    this.refresh()
  },

  onReachBottom:function(){
    this.getBlogs()
  },

  switchTag:function(e){
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

  getBlogTags: async function (){
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

  getBlogs: async function (){
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
          if(blog.articleBrief.length>76){
            blog.articleBrief=blog.articleBrief.substring(0,76)+'...'
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