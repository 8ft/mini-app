// pages/mine/personalInfo/detail/index.js

//获取应用实例
const app = getApp()
//引入async await依赖库
const regeneratorRuntime = require('../../../../libs/regenerator-runtime.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    height:'',
    content: '',
    inputLen: -1,
    conLen: 0,
    demoShow: false
  },

  onLoad: function (options) {
    wx.getSystemInfo({
      success: res => {
        let ww = res.windowWidth,
          wh = res.windowHeight,
          height = wh * 750 / ww - 250

        this.setData({
          height: height
        })
      }
    })

    let input = app.globalData.userInfo.userIntro
    let conLen = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "").length
    
    let inputLen
    if (conLen === 1000) {
      inputLen=input.length
    } else if (conLen < 1000) {
      inputLen = -1
    }

    this.setData({
      content: input,
      inputLen: inputLen,
      conLen: conLen,
    })
  },

  save:async function(){
    if (this.data.conLen<100){
      wx.showToast({
        title: '详细介绍至少100字哦',
        icon:'none'
      })
      return
    }
    let res = await app.request.post('/user/userAuth/completeUserIntro', {
      introduction: this.data.content.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
    })
    if (res.code === 0) {
      wx.navigateBack()
    }
  },

  input: function (e) {
    let input = e.detail.value
    let validInput = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
    let conLen = validInput.length

    if (conLen > 1000) {
      input = input.slice(0, 1000)
      validInput = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
      conLen = validInput.length
    }

    let inputLen
    if (conLen === 1000) {
      inputLen = 1000
    } else if (conLen < 1000) {
      inputLen = -1
    }
    
    this.setData({
      content: input,
      conLen: conLen,
      inputLen: inputLen
    })
  },

  hideDemo: function () {
    this.setData({
      demoShow: false
    })
  },

  showDemo: function () {
    this.setData({
      demoShow: true
    })
  }

})