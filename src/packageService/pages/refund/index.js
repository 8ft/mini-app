const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({
  data: {
    id:'',
    items: [
        {name: '与卖家协商一致退款', value: '与卖家协商一致退款'},
        {name: '不想做了', value: '不想做了'},
        {name: '买错了', value: '买错了'},
        {name: '其他', value: ''}
    ]
  },

  onLoad(options){
    this.setData({
      id:options.id
    })
    this.getDetail()
  },

  radioChange(e) {
    this.setData({
        reason:e.detail.value
    })
  },

  async getDetail (){
    let res = await app.request.post('/store/productOrderInfo/detail', {
      productOrderId: this.data.id
    })
    if(res.code!==0)return
    if (res.data.productName.length > 30) {
      res.data.productName = res.data.productName.substring(0,30) + '...'
    }

    this.setData({
      orderInfo:res.data
    })
  },

  async refund(e){
    if(this.data.reason===undefined){
      wx.showToast({
        title: '请选择退款理由',
        icon: 'none'
      })
      return
    }
    if(this.data.reason===''&&!e.detail.value.reason){
        wx.showToast({
            title: '请输入退款理由',
            icon: 'none'
          })
        return
    }
    let res = await app.request.post('/store/productOrderInfo/applyForRefund', {
        productOrderId: this.data.id,
        reason:this.data.reason||e.detail.value.reason
      })
      if(res.code!==0)return
      wx.setStorageSync('update_order',true)
      wx.navigateBack()
  }
})