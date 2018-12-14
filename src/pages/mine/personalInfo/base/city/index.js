
const app = getApp()
const regeneratorRuntime = require('../../../../../libs/regenerator-runtime.js')
  
Page({
  data: {
    cities:null
  },

  onLoad: function (options) {
    let cities = app.globalData.cities
    if (cities){
      console.log(1)
      this.setData({
        cities: cities
      })
    }else{
      this.getCity()
    }
  },

  cacheCityData:function(e){
    app.globalData.cities=e.detail.data
  },

  select:function(e){
    let city = e.detail.city
    app.globalData.userInfo.userBaseInfo.city = city.zoneCode
    app.globalData.userInfo.userBaseInfo.cityCn = city.zoneName
    wx.navigateBack()
  },

  getCity:async function(){
    let res = await app.request.post('/dict/dictZone/getList', {})
    if (res.code !== 0) return
    this.setData({
      cities:res.data.data
    })
  }
})