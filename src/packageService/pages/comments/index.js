const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({
  data: {
    tab:'',
    pageIndex:1,
    nomore:false,
    loading: true
  },

  onLoad () {
    const data=wx.getStorageSync('serviceInfo')
    this.setData({
      serviceInfo:data.service
    })
    this.getComments()
  },

  onPullDownRefresh () {
    this.refresh()
  },

  onReachBottom () {
    this.getComments()
  },

  refresh () {
    this.data.pageIndex=1
    this.data.comments=[]
    this.data.nomore=false
    this.getComments()
  },

  tabChange(e){
    this.setData({
      tab:e.currentTarget.dataset.tab
    })
    this.refresh()
  },

  async getComments () {
    let nomore = this.data.nomore
    if (nomore) return
    this.setData({
      loading: true
    })

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/store/productAppraiseRecord/getList', {
      productId: this.data.serviceInfo.id,
      overallScore:this.data.tab,
      pageIndex: pIndex
    })
    if (res.code !== 0) return

    if (res.data.page > pIndex) {
      pIndex++
    } else {
      nomore = true
    }

    this.setData({
      good:res.data.favourableCommentNum,
      normal:res.data.inBetweenCommentNum,
      bad:res.data.negativeCommentNum,
      comments: res.data.list,
      pageIndex:pIndex,
      nomore:nomore
    })

    wx.stopPullDownRefresh()
  },

  async collect(){
    if(app.checkLogin()){
      const res = await app.request.post('/store/collectionInfo/collect',{
        businessId:this.data.serviceInfo.id,
        type:1
      })
      if(res.code!==0)return
      this.setData({
        'serviceInfo.collectFlag':this.data.serviceInfo.collectFlag==='0'?'1':'0'
      })
    }
  },

  buy(){
    if(app.checkLogin()){
      wx.navigateTo({
        url:`/packageService/pages/buy/index`
      })
    }
  },
  
  download:app.download
})