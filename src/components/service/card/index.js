const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime

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

Component({
  properties: {
    index: Number,
    data: Object,
    appearance: {
      type: String,
      value: 'normal'
    }
  },

  data: {
    activeActions: {
      0: { close: true },//待确认
      1: { close: true, pay: true },//待支付
      2: { refund: true },//服务中
      3: { refund: true, comfirm: true },//待验收
      4: { delete: true, rate: true },//已完成
      5: { delete: true },//已关闭
      11: { delete: true },//已退款

      12: { appeal: true },//拒绝退款
      20: { appealDetail: true },//退款申述中（售后退款状态）
      21: { delete: true, appealDetail: true },//已关闭/退款申述成功（售后退款状态）
      22: { appealDetail: true, appeal: true },//退款申述失败（售后退款状态）
    }
  },

  methods: {
    _toStore() {
      wx.navigateTo({
        url: `/packageService/pages/store/index?id=${this.properties.data.storeId}`
      })
    },

    _update(e) {
      const action = e.currentTarget.dataset.action
      wx.showModal({
        title: actions[action].title || '提示',
        content: actions[action].msg,
        success: async res => {
          if (res.confirm) {
            const result = await app.request.post(actions[action].api, {
              productOrderId: this.properties.data.id
            })
            if (result.code !== 0) return
            this.triggerEvent('update', { index: this.properties.index, action: action })
          }
        }
      })
    },

    _jump(e) {
      wx.navigateTo({
        url: e.currentTarget.dataset.url
      })
    },

    _download() {
      wx.showModal({
        title: '温馨提示',
        content: '请前往应用市场搜索下载"巨牛汇APP"进行后续操作',
        showCancel: false,
        confirmText: '知道了'
      })
    },

    async _collect() {
      const res = await app.request.post('/store/collectionInfo/collect', {
        businessId: this.properties.data.id,
        type: 1
      })
      if (res.code !== 0) return
      this.triggerEvent('collect', { index: this.properties.index, flag: this.properties.data.collectFlag == 0 ? 1 : 0 })
    }
  }
})
