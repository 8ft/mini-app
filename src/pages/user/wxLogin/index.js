const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    encryptedData:'',
    iv:''
  },

  onLoad: function () {
    if(this.props.stores.account.logged_in){
      this.props.stores.account.logout(app,true)
    }
  },

  bindGetUserInfo:function(e) {
    if (e.detail.encryptedData) {
      this.setData({
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      })
      this.preLogin()
    } else {
      wx.showToast({
        title: '需要授权才能继续哦',
        icon: 'none'
      })
    }
  },

  preLogin:async function(){
    let oid,uid
    wx.login({
      success: async res => {
        let data = await app.request.get('/weixin/mini/getOpenId', {
          code: res.code
        })

        oid = data.openid
        wx.setStorageSync('openid', oid)

        uid = data.unionid
        if (uid) {
          wx.setStorageSync('unionid', uid)
          this.props.stores.account.login(app, oid, uid)
        }else{
          //请求解密接口
          let decodeData = await app.request.get('/weixin/mini/getUnionId', {
            encryptedData: this.data.encryptedData,
            iv: this.data.iv,
            openId: oid
          })

          if (decodeData.status === 1) {
            uid = decodeData.userInfo.unionId
            wx.setStorageSync('unionid', uid)
            this.props.stores.account.login(app, oid, uid)
          } else {
            wx.showToast({
              title: decodeData.msg,
              icon: 'none'
            })
          }
        }
      }
    })
  }
}))