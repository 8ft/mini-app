
const app = getApp()
const regeneratorRuntime = require('../../../../../libs/regenerator-runtime.js')
const observer = require('../../../../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },
  
  data: {
    userBaseInfo:null,
    dicts:[],
    joinIndex:0,
    sexIndex:0,
    expIndex:0,
    positionType:'',
    positionTypeCn:'',
    city:'',
    cityCn:''
  },

  onLoad:async function () {
    const data = this.props.stores.account.userInfo.userBaseInfo
    const dicts = await this.getDicts()

    app.globalData.editUserInfoCache.jobTypes={
      list:dicts[2].dictList,
      value:data.positionType,
      valueCn:data.positionTypeCn
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
      dicts: dicts,
      userBaseInfo: data,
      joinIndex:joinIndex,
      sexIndex: sexIndex,
      expIndex: expIndex
    })
  },

  onShow:function(){
    const data=app.globalData.editUserInfoCache
    const userBaseInfo=this.props.stores.account.userInfo.userBaseInfo
    this.setData({
      city:data.city.zoneCode||userBaseInfo.city,
      cityCn:data.city.zoneName||userBaseInfo.cityCn,
      positionType:data.jobTypes.value||userBaseInfo.positionType,
      positionTypeCn:data.jobTypes.valueCn||userBaseInfo.positionTypeCn
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
    this.setData({
      [`userBaseInfo.${inputType}`]:val
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
      positionType:this.data.positionType,
      workExperience: data.workExperience || dicts[3].dictList[0].dictValue,
      daySalary:data.daySalary,
      city:this.data.city,
      sex: data.sex || dicts[0].dictList[0].dictValue,
      qq:data.qq,
      email:data.email,
      wechat:data.wechat
    })
    if(res.code===0){
      this.props.stores.account.updateUserInfo()
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

    return false
  }

}))