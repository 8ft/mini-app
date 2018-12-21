const request = require('../api/request.js')
const regeneratorRuntime = require('../libs/regenerator-runtime.js')
const extendObservable = require('../libs/mobx').extendObservable;

const account = function () {
  extendObservable(this, {
    account:wx.getStorageSync('account'),
    userInfo:null,
    
    get logged_in(){
      return this.account!==''
    },

    get stateCn(){
      if(this.userInfo===null)return
      let stateCn=''
      switch(this.userInfo.userState){
        case 0:
        stateCn='请完善'
          break;
        case 1:
        stateCn = '审核中'
          break;
        case 2:
        stateCn = '审核通过'
          break;
        case 3:
        stateCn = '审核未通过'
          break;
      }
      return state
    }
  });

  this.getUserInfo = async () => {
    let res = await app.request.post('/user/userAuth/getUserBaseInfo')
    if (res.code !== 0) return
    this.userInfo=res.data
  }

  this.login = async (app,oid,uid) => {
    let res = await app.request.post('/user/userThirdpartInfo/login', {
      thirdpartIdentifier: oid,
      uid: uid,
      type: 0
    })

    let code = res.code
    if (code === 0) {
      wx.setStorageSync('account', res.data)
      app.stores.toRefresh.updateList('login')
      this.account=res.data
      wx.navigateBack()
    } else if (code === 507) {
      wx.redirectTo({
        url: '/pages/user/bind/index'
      })
    }
  }

  this.logout =async (app,expire)=> {
    if (!expire){
      let res = await request.post('/user/userAuth/logout')
    }
    app.globalData = {
      userInfo: null,
      editUserInfoCache: {
        jobTypes: null,
        detail: {
          content: ''
        }
      },
      publishDataCache: {
        skills: null,
        needSkills: [],
        needSkillsCn: [],
        desc: {
          content: ''
        }
      }
    }
    app.stores.toRefresh.updateList('logout')
    wx.clearStorageSync()
    this.account=''
  }
}

module.exports = new account