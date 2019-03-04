const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

const actionApis={
  delete:'/store/productOrderInfo/delete',
  close:'/store/productOrderInfo/cancelProductOrder',
  comfirm:'/store/productOrderInfo/acceptProductOrder'
}

const progress={
  0:0,
  1:33,
  2:66,
  3:100
}

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    id:'',
    character:'',
    detail:null,
    progress:0,

    activeActions: {
      0: { close: true },
      1: { close: true, pay: true },
      2: { payBack: true },
      3: { payBack: true, comfirm: true },
      4: { delete: true },
      5: { delete: true }
    }
  },

  onLoad:function(options){
    this.setData({
      id:options.id
    })
    this.getDetail()
  },

  update: async function (e,act) {
    const action=act||e.currentTarget.dataset.action
    const res = await app.request.post(actionApis[action], {
      productOrderId: this.data.detail.id
    })
    if (res.code !== 0) return
    this.getDetail()
    wx.setStorageSync('update_order',true)
  },

  comfirm: function () {
    wx.showModal({
      title: '确认验收',
      content: '请仔细验收卖家提供的服务，确认验收后平台将本次服务金额支付给卖家！',
      success: res=> {
        if (res.confirm) {
          this.update('comfirm')
        }
      }
    })
  },

  getDetail: async function (){
    let res = await app.request.post('/store/productOrderInfo/detail', {
      productOrderId: this.data.id
    })
    if(res.code!==0)return
    if (res.data.productName.length > 30) {
      res.data.productName = res.data.productName.substring(0,30) + '...'
    }
    this.setData({
      detail:res.data,
      progress:progress[res.data.businessState]>=0?progress[res.data.businessState]:-1
    })
  },
 
  download: app.download

}))