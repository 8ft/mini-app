const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime

Page({
  onLoad(option){
    this.setData({
      from:option.from||'',
      question:wx.getStorageSync('question')
    })
  },

  onUnload(){
    wx.removeStorageSync('question')
  },

  async pay(){
    let res = await app.request.post('/order/payOrder/businessPrepay', {
        tradeChannel:34, 
        businessOrderType:28, 
        businessOrderId: this.data.question.id,
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
        success:res=> {
          if(this.data.from==='publish'){
            wx.redirectTo({
              url: `/packagePublish/pages/qa/success/index?id=${this.data.question.id}&uid=${this.data.question.uid}&reward=${this.data.question.reward}`
            })
          }else{
            wx.setStorageSync('update_order',true)
            wx.navigateBack()
          }
        },
        fail(res) { 
          
        }
      })
  }
})