const app = getApp()
const regeneratorRuntime = require('../../../../libs/regenerator-runtime.js')

Page({

  data: {
    contactPhone:'',
    companyName:'',
    contactAddress:''
  },

  onLoad:async function (options) {
    let res = await app.request.post('/public/aboutUs/getInfo', {})
    if (res.code === 0) {
      this.setData({
        contactPhone: res.data.contactPhone,
        companyName: res.data.companyName,
        contactAddress: res.data.contactAddress
      })
    }
  }
})