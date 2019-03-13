
const app = getApp()

Page({
  data: {
    jobTypes: null,
    selectJobTypes: [],
    selectJobTypesCn: []
  },

  onLoad (options) {
    const data = app.globalData.editUserInfoCache.jobTypes
    let list=data.list
    let selectJobTypes=[]
    let selectJobTypesCn=[]

    if(data.value){
      selectJobTypes=data.value.split('|')
      selectJobTypesCn=data.valueCn.split('|')
      list=list.map(item=>{
        item.dictList=item.dictList.map(li => {
          if (selectJobTypes.includes(li.dictValue)) {
            li.selected = true
          }
          return li
        })
        return item
      })
    }

    this.setData({
      jobTypes:list,
      selectJobTypes: selectJobTypes,
      selectJobTypesCn: selectJobTypesCn
    })
  },

  onUnload () {
    let value=''
    let valueCn=''

    if(this.data.selectJobTypes.length>0){
      value=this.data.selectJobTypes.join('|')
      valueCn=this.data.selectJobTypesCn.join('|')
    }

    app.globalData.editUserInfoCache.jobTypes={
      list:this.data.jobTypes,
      value:value,
      valueCn:valueCn
    }
  },

  select (e) {
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
    }else if(selectJobTypes.length === 1&&index>=0){
      wx.showToast({
        title: '最少需要选一个',
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