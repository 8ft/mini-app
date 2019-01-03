const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer;

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    typeIndex:0,
    blogInfo:null,

    tagIndex:0,
    tags:[],

    blogs:{
      list:[],
      pageIndex: 1,
      nomore: false,
    },
    collection:{
      list:[],
      pageIndex: 1,
      nomore: false
    },
    loading:true,
  },

  onLoad:function (options) {
    const articleNum=this.props.stores.account.blogInfo.articleNum
    const favoriteNum=this.props.stores.account.blogInfo.favoriteNum

    this.setData({
      'tags[0]':{
        name:'全部标签',
        articleNum:articleNum,
        id:''
      },
      blogInfo:{
        articleNum:articleNum,
        favoriteNum:favoriteNum
      }
    })

    this.getBlogTags()
  },

  onShow:function(){
    if(this.data.blogInfo===null)return 
    let favoriteNum=this.data.blogInfo.favoriteNum
    const latest_favoriteNum=this.props.stores.account.blogInfo.favoriteNum
    if(favoriteNum!=latest_favoriteNum){
      this.setData({
        'blogInfo.favoriteNum':latest_favoriteNum,
        'collection.pageIndex': 1,
        'collection.nomore': false,
        'collection.list': []
      })
      this.getCollection()
    }
  },

  refresh:function(){
    if (this.data.typeIndex === 0) {
      let blogs = this.data.blogs
      this.setData({
        'blogs.pageIndex': 1,
        'blogs.nomore': false,
        'blogs.list': []
      })
      this.getBlogs()
    } else {
      let collection = this.data.collection
      this.setData({
        'collection.pageIndex': 1,
        'collection.nomore': false,
        'collection.list': []
      })
      this.getCollection()
    }
  },

  onPullDownRefresh:function(){
    this.refresh()
  },

  onReachBottom:function(){
    if (this.data.typeIndex === 0) {
      this.getBlogs()
    }else{
      this.getCollection()
    }
  },

  switchList: function(e){
    const index = e.detail.index
    if(index===1&&this.data.collection.list.length===0&&this.data.blogInfo.favoriteNum>0){
      this.getCollection()
    }
    this.setData({
      typeIndex: index
    })
  },

  switchTag:function(e){
    const index = e.currentTarget.dataset.index

    this.setData({
      tagIndex:index,
      blogs:{
        list:[],
        pageIndex: 1,
        nomore: false,
      }
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
    let nomore = this.data.blogs.nomore
    if (nomore)return
    this.setData({
      loading:true
    })

    let pIndex = this.data.blogs.pageIndex
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
        'blogs.list': this.data.blogs.list.concat(res.data.list.map(blog=>{
          if(blog.articleBrief.length>76){
            blog.articleBrief=blog.articleBrief.substring(0,76)+'...'
          }
          blog.createTime=app.util.formatTime(blog.createTime,'blogCard')
          return blog
        })),
        'blogs.pageIndex':pIndex,
        'blogs.nomore':nomore,
        loading:false
      })
    }
    wx.stopPullDownRefresh()
  },

  getCollection: async function (){
    let nomore = this.data.collection.nomore
    if (nomore)return
    this.setData({
      loading:true
    })

    let pIndex = this.data.collection.pageIndex
    let res = await app.request.post('/blog/article/getList',{
      queryType:2,
      articleType:1,
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
        'collection.list': this.data.collection.list.concat(res.data.list.map(blog=>{
          if(blog.articleBrief.length>76){
            blog.articleBrief=blog.articleBrief.substring(0,76)+'...'
          }
          blog.createTime=app.util.formatTime(blog.createTime,'blogCard')
          return blog
        })),
        'collection.pageIndex':pIndex,
        'collection.nomore':nomore,
        loading:false
      })
    }
    wx.stopPullDownRefresh()
  }
 
}))