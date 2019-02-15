const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
   id:'',
   experts:[],
   pageIndex: 1,
   nomore: false,
   loading:true
  },

  onLoad:function(options){
    let myId=wx.getStorageSync('account').userId
    let curId=options.id

    this.setData({
      pageTitle:myId==curId?'我的关注':'TA的关注',
      id:options.id
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
      experts: [],
      nomore: false
    })
    this.getExperts()
  },

  follow:async function(e){
    const index=e.currentTarget.dataset.index
    const target=this.data.experts[index]
    const res = await app.request.post('/blog/attentionInfo/follow',{
      attentionUserId:target.userId
    })
    if(res.code!==0)return
    this.props.stores.account.follow(target.checked===0?1:-1)
    this.setData({
      [`experts[${index}].checked`]:target.checked===0?1:0
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
      type:0,
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
  
}))
