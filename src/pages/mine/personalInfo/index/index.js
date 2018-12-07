// pages/mine/personalInfo/index.js

//获取应用实例
const app = getApp()
//引入async await依赖库
const regeneratorRuntime = require('../../../../libs/regenerator-runtime.js')
const upload = require('../../../../api/upload.js')

Page({
  data: {
    user:null
  },

  onShow:function(){
    app.checkLogin()
    this.getInfo()
  },

  getInfo:async function(){
    let res = await app.request.post('/user/userAuth/getUserBaseInfo', {})
    if (res.code === 0) {
      app.globalData.userInfo = res.data
      this.setData({
        user:res.data
      })  
    }
  },

  preview: function (e) {
    let curUrl = e.currentTarget.dataset.url
    if(!curUrl)return
    wx.previewImage({
      urls: [curUrl]
    })
  },

  copyLink: function (e) {
    const link = e.currentTarget.dataset.link
    if (!link) return
    wx.setClipboardData({
      data: link
    })
  },  

  chooseImage:function(){
    if (this.data.user.userState === 1)return
    wx.chooseImage({
      count:1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async res => {
        let imgs = await upload(res.tempFiles, '1106')
        this.updateAvatar(imgs[0].batchNo)
      }
    })
  },

  updateAvatar:async function(no){
    let res = await app.request.post('/user/userAuth/submitNickname', {
      nickName: '八疯兔',
      userAvatar: no
    })
    if (res.code === 0) this.getInfo()
  },

  delWorks:function(e){
    wx.showModal({
      title: '提示',
      content: '确定要删除吗',
      success: async res=> {
        if (res.confirm) {
          let res = await app.request.post('/user/userAuth/deleteUserSample', {
            userSampleId: e.currentTarget.dataset.id
          })
          if (res.code === 0) {
            wx.showToast({
              title: '删除成功',
              icon: 'none'
            })
            this.getInfo()
          }
        }
      }
    })
  },

  submit:async function(){
    let user = this.data.user
    if (!(Object.keys(user.userBaseInfo).length > 0)) {
      wx.showToast({
        title: '请完善基本信息',
        icon: 'none'
      })
      return
    } else if (!user.userIntro) {
      wx.showToast({
        title: '请完善详细介绍',
        icon: 'none'
      })
      return
    } else if (user.userIntro.length<100){
      wx.showToast({
        title: '详细介绍至少100字',
        icon: 'none'
      })
    } else if (!(user.userSkills.length > 0)) {
      wx.showToast({
        title: '至少添加一个技能',
        icon: 'none'
      })
      return
    } else if (!(user.userSampleInfos.length > 0)) {
      wx.showToast({
        title: '至少添加一个作品案例',
        icon: 'none'
      })
      return
    }

    let res = await app.request.post('/user/userAuth/submitUserAuth', {})
    if (res.code === 0){
      this.getInfo()
      wx.navigateTo({
        url: '/pages/mine/personalInfo/success/index',
        icon:'none'
      })
    }
  }

})