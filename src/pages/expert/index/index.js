// pages/expert/index/index.js

//获取应用实例
const app = getApp()
//引入async await依赖库
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({

  data: {
    user:null,
    blogInfo:null
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
    if (res.code !== 0) return

    let data=res.data
    if(data.userState!==0){
      data.userBaseInfo.positionTypeCn = data.userBaseInfo.positionTypeCn.split('|')
      data.userSampleInfos = data.userSampleInfos.map(item=>{
        if (item.sampleDesc.length >= 30){
          item.sampleDesc=item.sampleDesc.substring(0,30)+'...'
        }
        return item
      })
    }

    let blogInfo=await app.request.post('/blog/attentionInfo/queryBlogUserInfo',{
      userId:data.userId
    })
    if (blogInfo.code !== 0) return
    
    this.setData({
      user:data,
      blogInfo:blogInfo.data
    })
    
  }

 
})