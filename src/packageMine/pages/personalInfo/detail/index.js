
const app = getApp()
const regeneratorRuntime = require('../../../../libs/regenerator-runtime.js')
const observer = require('../../../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    height:'',
    content: '',
    inputLen: -1,
    conLen: 0,
    demoShow: false
  },

  onLoad: function (options) {
    const systemInfo=wx.getSystemInfoSync()

    let input = this.props.stores.account.userInfo.userIntro
    let conLen = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "").length
    
    let inputLen
    if (conLen === 1000) {
      inputLen=input.length
    } else if (conLen < 1000) {
      inputLen = -1
    }

    this.setData({
      height: systemInfo.windowHeight * 750 / systemInfo.windowWidth - 250,
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
      this.props.stores.account.updateUserInfo()
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

}))