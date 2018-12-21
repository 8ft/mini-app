
const app = getApp()

Page({
  data: {
    jobTypes: null,
    selectJobTypes: [],
    selectJobTypesCn: []
  },

  onLoad: function (options) {
    const data = app.globalData.editUserInfoCache.jobTypes
    const valueArr=data.value.split('|')
    const list=data.list.map(item=>{
      item.dictList=item.dictList.map(li => {
        if (valueArr.indexOf(li.dictValue) > -1) {
          li.selected = true
        }
        return li
      })
      return item
    })

    this.setData({
      jobTypes:list,
      selectJobTypes: valueArr,
      selectJobTypesCn: data.valueCn.split('|')
    })
  },

  onUnload: function () {
    app.globalData.editUserInfoCache.jobTypes={
      list:this.data.jobTypes,
      value:this.data.selectJobTypes.join('|'),
      valueCn:this.data.selectJobTypesCn.join('|')
    }
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