const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer;

Page(observer({
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

  onLoad:function(options){
    this.setData({
      typeId:options.id||'',
      typeIndex:parseInt(options.index)||0
    })
  },

  onShow:function(){
    this.props.stores.toRefresh.refresh('discover',exist=>{
      if(this.data.types.length===0){
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

  refresh:function(){
    this.setData({
      pageIndex: 1,
      blogs: [],
      nomore: false
    })
    this.getBlogs()
  },

  switchList:function(e){
    let index=e.detail.index
    this.setData({
      typeIndex:index,
      typeId:this.data.types[index].id
    })
    this.refresh()
  },

  getBlogTypes:async function(){
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

  getBlogs: async function (){
    let nomore = this.data.nomore
    if (nomore)return

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/blog/article/getList',{
      queryType:1,
      categoryId:this.data.typeId,
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
          return blog
        })),
        pageIndex:pIndex,
        nomore:nomore
      })
    }
    wx.stopPullDownRefresh()
  }
  
}))
