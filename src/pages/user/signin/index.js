// pages/user/signin/index.js

//获取应用实例
const app = getApp()
//引入async await依赖库
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')


Page({
  data: {
    phone:'',
    code:'',
    pwd:'',
    getCodeTxt:'获取验证码',
    countDown:60,
    disagree:false
  },

  input(e){
    let inputName=e.currentTarget.dataset.name
    let val=e.detail.value
    switch (inputName){
      case 'phone':
        this.setData({
          phone:val
        })
      break;
      case 'code':
        this.setData({
          code: val
        })
        break;
      case 'pwd':
        this.setData({
          pwd: val
        })
        break;
    }
  },

  async getCode(){
    let phone = this.data.phone
    if(!app.util.validatePhone(phone))return 
    let res = await app.request.post('/public/validateCode/sendValidateCode', {
      userMobile: phone,
      type: '0'
    })
    if (res.code === 0) this.countDown()
  },

  countDown(){
    let tid=setTimeout(()=>{
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
    },1000)
  },

  async signin(){
    let phone = this.data.phone
    if(!app.util.validatePhone(phone))return
    
    let code=this.data.code
    if(!this.data.code){
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
      return
    }

    let pwd=this.data.pwd
    if(!app.util.validatePwd(this.data.pwd))return

    let validateCode=await app.request.post('/public/validateCode/verifyValidateCode', {
      userMobile: phone,
      validateCode:code,
      type: '0'
    })
    if (validateCode.code===0){
      let register= await app.request.post('/user/userAuth/register', {
        userMobile: phone,
        userPassword:pwd,
        validateCode:code,
        openId:wx.getStorageSync('openid')
      })
      if (register.code === 0)
      wx.navigateBack()
    }else{
      wx.showToast({
        title: '验证码不正确，请检查',
        icon: 'none'
      })
    }
  },

  setAgree(e){
    this.setData({
      disagree: !this.data.disagree
    })
  }
})