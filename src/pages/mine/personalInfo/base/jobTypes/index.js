// pages/project/publish/skills/index.js

//获取应用实例
const app = getApp()

Page({

  data: {
    jobTypes: null,
    selectJobTypes: [],
    selectJobTypesCn: []
  },

  onLoad: function (options) {
    let data = app.globalData.userInfo.userBaseInfo
    this.setData({
      jobTypes: app.globalData.editUserInfoCache.jobTypes,
      selectJobTypes: data.positionType?data.positionType.split('|'):[],
      selectJobTypesCn: data.positionTypeCn ? data.positionTypeCn.split('|'):[]
    })
  },

  onUnload: function () {
    app.globalData.editUserInfoCache.jobTypes = this.data.jobTypes
    app.globalData.userInfo.userBaseInfo.positionType = this.data.selectJobTypes.join('|')
    app.globalData.userInfo.userBaseInfo.positionTypeCn = this.data.selectJobTypesCn.join('|')
  },

  select: function (e) {
    let selectJobTypes = this.data.selectJobTypes,
      selectJobTypesCn = this.data.selectJobTypesCn

    let data = e.currentTarget.dataset,
      code = data.code,
      name = data.name,
      pIndex = data.pindex

    let index = selectJobTypes.indexOf(code)
    if (selectJobTypes.length === 5&&index<0) {
      wx.showToast({
        title: '最多只可选5个',
        icon: 'none'
      })
      return
    }

    if (index > -1) {
      selectJobTypes.splice(index, 1)
      selectJobTypesCn.splice(index, 1)
      this.data.jobTypes[pIndex].dictList[data.index]['selected'] = false
    } else {
      selectJobTypes.push(code)
      selectJobTypesCn.push(name)
      this.data.jobTypes[pIndex].dictList[data.index]['selected'] = true
    }

    this.setData({
      jobTypes: this.data.jobTypes,
      selectJobTypes: selectJobTypes,
      selectJobTypesCn: selectJobTypesCn
    })
  }
})