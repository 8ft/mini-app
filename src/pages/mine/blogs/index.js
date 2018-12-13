const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer;

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    uid:'',

    typeIndex:0,
    blogInfo:null,

    tags:[],
    tagIndex:0,
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
    const blogs=parseInt(options.blogNum)
    const collection=parseInt(options.collectNum)

    this.data.tags.push({
      name:'全部文章',
      articleNum:blogs,
      id:''
    })

    this.setData({
      tags:this.data.tags,
      uid:options.id,
      blogInfo:{
        articleNum:blogs,
        favoriteNum:collection
      }
    })
  },

  onShow:function(){
    this.props.stores.toRefresh.refresh('blogs',exist=>{
      if (this.data.tags.length<2){
        this.getBlogTags()
        if(this.data.blogInfo.articleNum!==0){
          this.getBlogs()
        }
      }else if(exist){
        this.refresh()
      }
    })
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
      userId: this.data.uid,
      pageIndex:1,
      pageSize:99
    })
    if (res.code !== 0)return
    this.setData({
      tags:this.data.tags.concat(res.data.list)
    }) 
  },

  getBlogs: async function (){
    let nomore = this.data.blogs.nomore
    if (nomore)return
    this.setData({
      loading:true
    })

    let pIndex = this.data.blogs.pageIndex
    let res = await app.request.post('/blog/article/myArticles',{
      queryType:1,
      catalogId:this.data.tags[this.data.tagIndex].id,
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
    let res = await app.request.post('/blog/article/myArticles',{
      queryType:2,
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