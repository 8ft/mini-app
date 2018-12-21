//app.js
const request = require('./api/request.js')
const util = require('./utils/util.js')
const stores= require('./stores/index')

App({
  onLaunch:function(){
    stores.account.account=wx.getStorageSync('account')
  },

  stores: stores,
  request: request,
  util: util,

  globalData: {
    userInfo:null,
    editUserInfoCache:{
      jobTypes:null,
      detail: {
        content: ''
      }
    },
    publishDataCache:{
      skills:null,
      needSkills:[],
      needSkillsCn:[],
      desc:{
        content:''
      }
    }
  },

  checkLogin: function(){
    if (!this.stores.account.logged_in) {
      wx.navigateTo({
        url: '/pages/user/wxLogin/index',
      })
    } else {
      return true
    }
  },

  download: function () {
    wx.showModal({
      title: '温馨提示',
      content: '请前往应用市场搜索下载"巨牛汇APP"进行后续操作',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})