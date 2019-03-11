const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({
  data: {
    id:''
  },

  onLoad:function(options){
    this.setData({
      id:options.id
    })
    this.getDetail()
  },

  getDetail: async function (){
    let res = await app.request.post('/store/productOrderInfo/detail', {
      productOrderId: this.data.id
    })
    if(res.code!==0)return
    this.setData({
      orderInfo:res.data
    })
  },

  pay:async function(){
    let res = await app.request.post('/order/payOrder/businessPrepay', {
        tradeChannel:34, 
        businessOrderType:26, 
        businessOrderId: this.data.orderInfo.id,
        openId:wx.getStorageSync('openid')
      })
      if(res.code!==0)return

      const data=res.data
      wx.requestPayment({
        timeStamp: data.timeStamp,
        nonceStr: data.nonceStr,
        package: data.package,
        signType:data.signType,
        paySign: data.paySign,
        success(res) {
          wx.setStorageSync('update_order',true)
          wx.navigateBack()
        },
        fail(res) { 
          
        }
      })
  }
})