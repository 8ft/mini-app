// pages/mine/wallet/index.js

//获取应用实例
const app = getApp()
//引入async await依赖库
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    scrollViewHeight:0,
    wallet:null,
    records:[],
    pageIndex:1,
    nomore:false
  },

  onLoad: function (options) {
    const query = wx.createSelectorQuery()
    query.select('#baseInfo').fields({
      size: true
    }, res => {
      wx.getSystemInfo({
        success: data => {
          this.setData({
            scrollViewHeight: data.windowHeight - res.height
          })
        }
      })
    }).exec()
    this.getWallet()
    this.getRecords()
  },

  refresh:function(){
    this.setData({
      pageIndex:1,
      nomore:false,
      records:[]
    })
    this.getRecords()
  },

  getWallet:async function(){
    let res = await app.request.post('/user/payFund/myPayFund')
    if (res.code !== 0) return
    this.setData({
      wallet: res.data
    })
  },

  getRecords:async function(){
    if(this.data.nomore)return

    let pageIndex = this.data.pageIndex
    let res = await app.request.post('/order/payOrder/myOrders',{
      pageIndex:pageIndex,
      fundFlag:1
    })
    if (res.code !== 0) return

    let list = res.data.list.map(item => {
      item.createTime = item.createTime.slice(0, -3).replace(/-/g, '.')
      return item
    })

    list=list.filter(item=>{
      return item.orderType!==22
    })

    if (res.data.page === pageIndex){
      this.setData({
        nomore:true,
        records: this.data.records.concat(list)
      })
    }else{
      this.setData({
        pageIndex: pageIndex+1,
        records: this.data.records.concat(list)
      })
    }
  },

  download: app.download
})