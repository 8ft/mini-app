const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    phone: '',
    code: '',
    getCodeTxt: '获取验证码',
    countDown: 60,
    userInfo:null
  },

  input (e) {
    let inputName = e.currentTarget.dataset.name
    let val = e.detail.value
    switch (inputName) {
      case 'phone':
        this.setData({
          phone: val
        })
        break;
      case 'code':
        this.setData({
          code: val
        })
        break;
    }
  },

  async getCode () {
    let phone = this.data.phone
    if (!app.util.validatePhone(phone)) return
    let res = await app.request.post('/public/validateCode/sendValidateCode', {
      userMobile: phone,
      type: '3'
    })
    if (res.code===0) this.countDown()
  },

  countDown () {
    let tid = setTimeout(() => {
      let countDown = this.data.countDown
      if (countDown > 1) {
        countDown--
        this.setData({
          getCodeTxt: countDown + 's后重新获取',
          countDown: countDown
        })
        this.countDown()
      } else {
        this.setData({
          getCodeTxt: '重新获取',
          countDown: 60
        })
        clearTimeout(tid)
      }
    }, 1000)
  },

  bindGetUserInfo(e) {
    let info = e.detail.userInfo
    if(info){
      this.setData({
        userInfo:info
      })
      this.bind()
    }else{
      wx.showToast({
        title: '需要授权才能继续哦',
        icon: 'none'
      })
    }
  },

  async bind(){
    let phone=this.data.phone
    if(!app.util.validatePhone(phone))return

    let code = this.data.code
    if (!code) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
      return
    }

    const uid=wx.getStorageSync('unionid')

    let res = await app.request.post('/user/userThirdpartInfo/bind', {
      thirdpartIdentifier: uid,
      type:0,
      telephone: phone,
      validateCode:code,
      nickName: this.data.userInfo.nickName,
      userAvatar: this.data.userInfo.avatarUrl
    })

    if (res.code===0){
      const oid=wx.getStorageSync('openid')
      this.props.stores.account.login(app,oid,uid)
    }
  }
}))