const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const actionApis={
  delete:'/store/productOrderInfo/delete',
  close:'/store/productOrderInfo/cancelProductOrder',
  comfirm:'/store/productOrderInfo/acceptProductOrder'
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
      0: { close: true },
      1: { close: true, pay: true },
      2: { refund: true },
      3: { refund: true, comfirm: true },
      4: { delete: true },
      5: { delete: true }
    }
  },

  methods: {
    _toStore: function () {
      wx.navigateTo({
        url: `/packageService/pages/store/index?id=${this.properties.data.storeId}`
      })
    },

    _update: async function (e,act) {
      const action=act||e.currentTarget.dataset.action
      const res = await app.request.post(actionApis[action], {
        productOrderId: this.properties.data.id
      })
      if (res.code !== 0) return
      this.triggerEvent('update', { index: this.properties.index, action: action })
    },

    _jump:function(e){
      wx.navigateTo({
        url: e.currentTarget.dataset.url
      })
    },

    _comfirm: function () {
      wx.showModal({
        title: '确认验收',
        content: '请仔细验收卖家提供的服务，确认验收后平台将本次服务金额支付给卖家！',
        success: res=> {
          if (res.confirm) {
            this._update('comfirm')
          }
        }
      })
    },

    _collect: async function () {
      const res = await app.request.post('/store/collectionInfo/collect', {
        businessId: this.properties.data.id,
        type: 1
      })
      if (res.code !== 0) return
      this.triggerEvent('collect', { index: this.properties.index, flag: this.properties.data.collectFlag == 0 ? 1 : 0 })
    }
  }
})
