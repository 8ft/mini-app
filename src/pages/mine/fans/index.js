const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({
  data: {
    id:'',
    experts:[],
    pageIndex: 1,
    nomore: false,
    loading:true
   },
 
   onLoad:function(options){
    let myId=wx.getStorageSync('user').userId
    let curId=options.id

    wx.setNavigationBarTitle({
      title: myId==curId?'我的粉丝':'TA的粉丝'
    })
    
    this.setData({
      id:curId
    })
    this.getExperts();
   },

  onPullDownRefresh:function(){
    this.refresh()
  },

  onReachBottom:function(){
    this.getExperts()
  },

  refresh:function(){
    this.setData({
      pageIndex: 1,
      blogs: [],
      nomore: false
    })
    this.getBlogs()
  },

  follow:async function(e){
    const index=e.currentTarget.dataset.index
    const target=this.data.experts[index]
    const res = await app.request.post('/blog/attentionInfo/follow',{
      attentionUserId:target.userId
    })
    if(res.code!==0)return
    target.checked=target.checked===0?1:0
    this.setData({
      experts:this.data.experts
    })
    
  },

  getExperts: async function (){
    let nomore = this.data.nomore
    if (nomore)return
    this.setData({
      loading:true
    })

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/blog/attentionInfo/getPageList',{
      type:1,
      userId:this.data.id,
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
        experts:this.data.experts.concat(res.data.list),
        pageIndex:pIndex,
        nomore:nomore,
        loading:false
      })
    }
    wx.stopPullDownRefresh()
  }
  
})
