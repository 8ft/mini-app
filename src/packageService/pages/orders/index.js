const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({
  data: {
    tabIndex: 0,
    tabsCn: ['全部', '待付款', '服务中', '待验收', '已完成', '已关闭', '售后/退款'],

    loading: true,
    orders: [],
    pageIndex: 1,
    nomore: false
  },

  onLoad: function () {
    this.getOrders()
  },

  onShow: function () {

  },

  refresh: function () {
    this.data.orders = []
    this.data.pageIndex = 1
    this.data.nomore = false
    this.getOrders()
  },

  switchList: function (e) {
    let index = e.detail.index
    this.setData({
      tabIndex: index
    })
    this.refresh()
  },

  getOrders: async function () {
    let nomore = this.data.nomore
    if (nomore) return
    this.setData({
      loading: true
    })

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/store/productOrderInfo/myProductOrderList', {
      queryType: 2,
      queryTab: this.data.tabIndex,
      pageIndex: pIndex
    })
    if (res.code !== 0) return

    if (res.data.page > pIndex) {
      pIndex++
    } else {
      nomore = true
    }

    this.setData({
      orders: this.data.orders.concat(res.data.list.map(order => {
        if (order.productName.length > 30) {
          order.productName = order.productName.substring(0, 30) + '...'
        }
        return order
      })),
      pageIndex: pIndex,
      nomore: nomore,
      loading: false
    })
  }

})