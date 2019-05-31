const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime

const actions = {
  delete: {
    msg: '确定要删除订单吗',
    api: '/store/productOrderInfo/delete'
  },
  close: {
    msg: '确定要关闭订单吗',
    api: '/store/productOrderInfo/cancelProductOrder'
  },
  comfirm: {
    title: '确认验收',
    msg: '请仔细验收卖家提供的服务，确认验收后平台将本次服务金额支付给卖家！',
    api: '/store/productOrderInfo/acceptProductOrder'
  }
}

const progress = {
  0: 0,
  1: 33,
  2: 66,
  3: 100
}

Page({

  data: {
    id: '',
    detail: null,
    progress: 0,

    activeActions: {
      0: { close: true },//待确认
      1: { close: true, pay: true },//待支付
      2: { refund: true },//服务中
      3: { refund: true, comfirm: true },//待验收
      4: { delete: true, rate: true },//已完成
      5: { delete: true },//已关闭
      11: { delete: true }//已退款
    }
  },

  onLoad(options) {
    this.setData({
      id: options.id
    })
    this.getDetail()
  },

  onShow() {
    if (wx.getStorageSync('update_order')) {
      this.getDetail()
    }
  },

  update(e) {
    const action = e.currentTarget.dataset.action
    wx.showModal({
      title: actions[action].title || '提示',
      content: actions[action].msg,
      success: async res => {
        if (res.confirm) {
          const result = await app.request.post(actions[action].api, {
            productOrderId: this.data.detail.id
          })
          if (result.code !== 0) return
          this.getDetail()
          wx.setStorageSync('update_order', true)
        }
      }
    })
  },

  async getDetail() {
    let res = await app.request.post('/store/productOrderInfo/detail', {
      productOrderId: this.data.id
    })
    if (res.code !== 0) return
    if (res.data.productName.length > 30) {
      res.data.productName = res.data.productName.substring(0, 30) + '...'
    }

    res.data.refundRejectTime = res.data.refundRejectTime.slice(0, -3).replace(/-/g, '.')
    res.data.refundApplyTime = res.data.refundApplyTime.slice(0, -3).replace(/-/g, '.')
    res.data.refundTime = res.data.refundTime.slice(0, -3).replace(/-/g, '.')
    res.data.createTime = res.data.createTime.slice(0, -3).replace(/-/g, '.')
    res.data.cancelTime = res.data.cancelTime.slice(0, -3).replace(/-/g, '.')
    res.data.paymentTime = res.data.paymentTime.slice(0, -3).replace(/-/g, '.')
    res.data.deliveryTime = res.data.deliveryTime.slice(0, -3).replace(/-/g, '.')
    res.data.acceptanceTime = res.data.acceptanceTime.slice(0, -3).replace(/-/g, '.')
    res.data.acceptancePayTime = res.data.acceptancePayTime.slice(0, -3).replace(/-/g, '.')

    this.setData({
      detail: res.data,
      progress: progress[res.data.businessState] >= 0 ? progress[res.data.businessState] : -1
    })
  },

  download: app.download

})