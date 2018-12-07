const request = require('../api/request.js')
const regeneratorRuntime = require('../libs/regenerator-runtime.js')
const extendObservable = require('../libs/mobx').extendObservable;

const account = function () {
  extendObservable(this, {
    logged_in:false
  });

  this.login = app => {
    app.stores.toRefresh.updateList('login')
    this.logged_in=true
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
    this.logged_in = false
  }
}

module.exports = new account