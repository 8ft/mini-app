// pages/mine/personalInfo/base/index.js

//获取应用实例
const app = getApp()
//引入async await依赖库
const regeneratorRuntime = require('../../../../../libs/regenerator-runtime.js')

Page({
  data: {
    userBaseInfo:null,
    dicts:[],
    joinIndex:0,
    sexIndex:0,
    expIndex:0
  },

  onShow:async function () {
    const data = app.globalData.userInfo.userBaseInfo
    let dicts = this.data.dicts
    if (dicts.length===0){
      dicts = await this.getDicts()
      this.setData({
        dicts: dicts
      })
      this.saveJobTypes()
    }

    let joinIndex
    dicts[1].dictList.forEach((item, index) => {
      if (item.dictName === data.settleTypeCn) {
        joinIndex=index
      }
    })

    let sexIndex
    dicts[0].dictList.forEach((item, index) => {
      if (item.dictName === data.sexCn) {
        sexIndex = index
      }
    })

    let expIndex
    dicts[3].dictList.forEach((item, index) => {
      if (item.dictName === data.workExperienceCn) {
        expIndex = index
      }
    })
    
    this.setData({
      userBaseInfo: data,
      joinIndex:joinIndex,
      sexIndex: sexIndex,
      expIndex: expIndex
    })
  },

  getDicts: async function () {
    let res = await app.request.post('/dict/dictCommon/getDicts', {
      dictType: 'sex_type|join_type|job_type|work_experience',
      resultType: '1'
    })

    if (res.code === 0) {
      return res.data.data
    }
  },

  saveJobTypes: function () {
    let types = this.data.dicts[2].dictList,
      curTypes = app.globalData.userInfo.userBaseInfo.positionType.split('|')
    
    for(let i=0;i<types.length;i++){
      types[i].dictList = types[i].dictList.map(item => {
        if (curTypes.indexOf(item.dictValue) > -1) {
          item.selected = true
        }
        return item
      })
    }
    app.globalData.editUserInfoCache.jobTypes=types    
  },

  select: function (e) {
    let index = e.detail.value
    let type = e.currentTarget.dataset.type
    let data = this.data.userBaseInfo

    switch (type) {
      case 'join':
        data.settleType = this.data.dicts[1].dictList[index].dictValue
        data.settleTypeCn = this.data.dicts[1].dictList[index].dictName
        this.setData({
          userBaseInfo:data,
          joinIndex:index
        })
        break;
      case 'sex':
        data.sex = this.data.dicts[0].dictList[index].dictValue
        data.sexCn = this.data.dicts[0].dictList[index].dictName
        this.setData({
          userBaseInfo: data,
          sexIndex: index
        })
        break;
      case 'exp':
        data.workExperience = this.data.dicts[3].dictList[index].dictValue
        data.workExperienceCn = this.data.dicts[3].dictList[index].dictName
        this.setData({
          userBaseInfo: data,
          expIndex: index
        })
        break;
    }
  },

  input: function (e) {
    let inputType = e.currentTarget.dataset.type
    let val = e.detail.value.replace(/[ ]/g, "").replace(/[\r\n]/g, "")
    switch (inputType) {
      case 'nickName':
        this.data.userBaseInfo.nickName=val
        break;
      case 'positionTitle':
        this.data.userBaseInfo.positionTitle = val
        break;
      case 'daySalary':
        this.data.userBaseInfo.daySalary = val
        break;
      case 'qq':
        this.data.userBaseInfo.qq = val
        break;
      case 'wechat':
        this.data.userBaseInfo.wechat = val
        break;
      case 'email':
        this.data.userBaseInfo.email = val
        break;
    }
    this.setData({
      userBaseInfo: this.data.userBaseInfo
    })
  },

  save:async function(){
    if(this.hasNull())return
    let data=this.data.userBaseInfo
    let dicts=this.data.dicts
    let res = await app.request.post('/user/userAuth/completeUserBaseInfo', {
      nickName: data.nickName,
      settleType: data.settleType||dicts[1].dictList[0].dictValue,
      positionTitle:data.positionTitle,
      positionType:data.positionType,
      workExperience: data.workExperience || dicts[3].dictList[0].dictValue,
      daySalary:data.daySalary,
      city:data.city,
      sex: data.sex || dicts[0].dictList[0].dictValue,
      qq:data.qq,
      email:data.email,
      wechat:data.wechat
    })
    if(res.code===0){
      wx.navigateBack()
    }
  },

  hasNull:function(){
    let data = this.data.userBaseInfo
    if(!data.nickName){
      wx.showToast({
        title: '请输入昵称',
        icon:'none'
      })
      return true
    }
    if (!data.city) {
      wx.showToast({
        title: '请选择城市',
        icon: 'none'
      })
      return true
    }
    if (!(data.wechat||data.qq||data.email)) {
      wx.showToast({
        title: '微信号、QQ、邮箱至少填写一个',
        icon: 'none'
      })
      return true
    }

    if (data.wechat && ! /[-_a-zA-Z0-9]{5,19}$/.test(data.wechat)){
      wx.showToast({
        title: '请输入正确的微信号',
        icon: 'none'
      })
      return true
    }

    if (data.qq && !/^[1-9]\d{4,19}$/.test(data.qq)){
      wx.showToast({
        title: '请输入正确的QQ号',
        icon: 'none'
      })
      return true
    }

    if (data.email && !/([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[/.][a-z]{2,3}([/.][a-z]{2})?$/.test(data.email)) {
      wx.showToast({
        title: '请输入正确的邮箱号',
        icon: 'none'
      })
      return true
    }
    
    
    if (!data.positionTitle) {
      wx.showToast({
        title: '请输入职位头衔',
        icon: 'none'
      })
      return true
    }
    if (!data.positionType) {
      wx.showToast({
        title: '请选择职位类型',
        icon: 'none'
      })
      return true
    }
    if (!data.daySalary) {
      wx.showToast({
        title: '请输入日薪',
        icon: 'none'
      })
      return true
    }
    return false
  }

})