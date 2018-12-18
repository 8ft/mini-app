const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({
  data: {
    experts:[],
    pageIndex: 1,
    nomore: false,
    loading:true
   },
 
   onLoad:function(options){
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
      experts: [],
      nomore: false
    })
    this.getExperts()
  },

  getExperts: async function (){
    let nomore = this.data.nomore
    if (nomore)return
    this.setData({
      loading:true
    })

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/user/talent/myTalents',{
      pageIndex:pIndex,
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
