const request = require('../api/request.js')
const regeneratorRuntime = require('../libs/regenerator-runtime.js')
const mobx = require('../libs/mobx');

const account = function () {
  mobx.extendObservable(this, {
    account:wx.getStorageSync('account'),
    userInfo:null,
    blogInfo:null,
    
    get logged_in(){
      return this.account!==''
    },

    get stateCn(){
      let stateCn=''
      if(this.userInfo===null)return stateCn
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
      return stateCn
    }
  });

  this.updateUserInfo = async () => {
    if(this.logged_in){
      let res = await request.post('/user/userAuth/getUserBaseInfo')
      if (res.code !== 0) return
      this.userInfo=res.data
    }else{
      this.userInfo=null
    }
  }

  this.follow=diff=>{
    this.blogInfo.attentionNum+=diff
  },

  this.collect=diff=>{
    this.blogInfo.favoriteNum+=diff
  }

  this.updateBlogInfo = async () => {
    if(this.logged_in){
      let res=await request.post('/blog/attentionInfo/queryBlogUserInfo',{
        userId:this.account.userId
      })
      if (res.code !== 0) return
      this.blogInfo=res.data
    }else{
      this.blogInfo=null
    }
  }

  this.login = async (app,oid,uid) => {
    let res = await request.post('/user/userThirdpartInfo/login', {
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
    this.updateUserInfo()
    this.updateBlogInfo()
  }

  mobx.autorun(() => {
    if(this.logged_in&&this.userInfo===null){
      this.updateUserInfo()
      this.updateBlogInfo()
    }
  })
}

module.exports = new account