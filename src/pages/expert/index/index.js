// pages/expert/index/index.js

//获取应用实例
const app = getApp()
//引入async await依赖库
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({

  data: {
    user:null
  },

  onLoad: function (options) {
    this.getUserInfo(options.id)
  },

  copyLink:function(e){
    const link = e.currentTarget.dataset.link
    if (!link) return
    wx.setClipboardData({
      data: link
    })
  },  

  viewImage: function (e) {
    const curUrl = e.currentTarget.dataset.url
    if (!curUrl) return
    wx.previewImage({
      urls: [curUrl]
    })
  },

  getUserInfo: async function (id) {
    let res = await app.request.post('/user/userAuth/viewUserBaseInfo', {
      userId: id
    })

    let data=res.data
    data.userBaseInfo.positionTypeCn = data.userBaseInfo.positionTypeCn.split('|')

    data.userSampleInfos = data.userSampleInfos.map(item=>{
      if (item.sampleDesc.length >= 30){
        item.sampleDesc=item.sampleDesc.substring(0,30)+'...'
      }
      return item
    })

    if (res.code === 0) {
      this.setData({
        user:data
      })
    }
  }

 
})