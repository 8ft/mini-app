const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({
  data: {
    uid:'',
    list:[],
    pageIndex: 1,
    nomore: false,
    loading:true,
  },

  onLoad:function (options) {
    this.setData({
      uid:options.id
    })
    this.getCollection()
  },

  refresh:function(){
    this.setData({
      pageIndex: 1,
      nomore: false,
      list: []
    })
    this.getCollection()
  },

  onPullDownRefresh:function(){
    this.refresh()
  },

  onReachBottom:function(){
    this.getCollection()
  },

  getCollection: async function (){
    let nomore = this.data.nomore
    if (nomore)return
    this.setData({
      loading:true
    })

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/blog/article/getList',{
      queryType:2,
      ownerId:this.data.uid,
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
        list: this.data.list.concat(res.data.list.map(blog=>{
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
 
})