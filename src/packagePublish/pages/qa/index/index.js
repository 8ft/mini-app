const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime

Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    multiIndex: [0, 0],
    popupRewardBox:false,

    reward:0,
    selectedReward:0,
    rewards:[5,10,15,20,50,100,200,0]
  },

  onLoad() {
    this.getDicts()
  },

  onShow() {
    const questionDesc = wx.getStorageSync('qaCache')
    if(!questionDesc)return 
    this.setData({
      questionDesc:questionDesc
    })
  },

  onUnload() {
    wx.removeStorageSync('qaCache')
  },

  async getDicts() {
    let res = await app.request.post('/dict/dictCommon/getDicts', {
      dictType: 'project_type',
      resultType: '1'
    })

    if (res.code !== 0) return
    const data = res.data.data[0].dictList
    let questionTypes = []
    let questionSubTypes = []
    let tags={}

    data.forEach(type => {
      questionTypes.push({
        dictName: type.dictName,
        dictValue: type.dictValue
      })
      questionSubTypes.push(type.dictList.map(subType => {
        tags[subType.dictValue]=subType.dictList
        return {
          dictName: subType.dictName,
          dictValue: subType.dictValue
        }
      }))
    })

    this.setData({
      objectMultiArray: [questionTypes,questionSubTypes[0]],
      questionSubTypes: questionSubTypes,
      tags:tags
    })
  },

  bindMultiPickerChange(e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },

  bindMultiPickerColumnChange(e) {
    if(e.detail.column===0){
      this.setData({
        'objectMultiArray[1]':this.data.questionSubTypes[e.detail.value],
        multiIndex: [e.detail.value,0]
      })
    }else{
      const val=this.data.objectMultiArray[1][this.data.multiIndex[1]].dictValue
      this.setData({
        [`tags.${val}`]:this.data.tags[val].map(tag=>{
          tag.selected=false
          return tag
        }),
        'multiIndex[1]': e.detail.value
      })
    }
  },

  openRewardBox(){
    this.setData({
      popupRewardBox:true
    })
  },

  closeRewardBox(){
    this.setData({
      selectedReward:this.data.reward,
      popupRewardBox:false
    })
  },

  selectReward(e){
    const val=e.currentTarget.dataset.val
    if(val===this.data.selectedReward)return
    this.setData({
      selectedReward:val
    })
  },

  setReward(){
    this.setData({
      reward:this.data.selectedReward,
      popupRewardBox:false
    })
  },

  selectTag(e){
    const index=e.currentTarget.dataset.index
    const val=this.data.objectMultiArray[1][this.data.multiIndex[1]].dictValue
    this.setData({
      [`tags.${val}[${index}].selected`]:this.data.tags[val][index].selected?false:true
    })
  },

  async publish() {
    let data = this.data
    if (!data.pName) {
      wx.showToast({
        title: '请输入项目名称',
        icon: 'none'
      })
      return
    }

    let desc = data.desc.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
    if (desc.length < 50) {
      wx.showToast({
        title: '项目描述最少50字',
        icon: 'none'
      })
      return
    }

    let dicts = data.dicts
    let res = await app.request.post('/project/projectInfo/save', {
      projectCycle: dicts[2].dictList[data.cycleIndex].dictValue,
      projectBudget: dicts[1].dictList[data.budgetIndex].dictValue,
      projectDesc: desc,
      projectSkill: app.globalData.publishDataCache.needSkills.join('|'),
      projectType: dicts[0].dictList[data.typeIndex].dictValue,
      projectSubtype: dicts[0].dictList[data.typeIndex].dictList[data.subTypeIndex].dictValue,
      cooperater: dicts[3].dictList[data.cooperaterIndex].dictValue,
      companyName: data.cName,
      projectName: data.pName,
      fileBatchNo: app.globalData.publishDataCache.desc.batchNo || ''
    })

    if (res.code === 0) {
      this.refresh()

      let userBaseInfo = this.props.stores.account.userInfo.userBaseInfo
      if (!(userBaseInfo.qq || userBaseInfo.wechat)) {
        this.setData({
          showCollector: true
        })
      } else {
        wx.navigateTo({
          url: `/packagePublish/pages/qa/success/index?no=${res.data.projectNo}`,
        })
      }
    }
  },

  refresh() {
    this.setData({
      typeIndex: 0,
      subTypeIndex: 0,
      budgetIndex: 0,
      cycleIndex: 0,
      cooperaterIndex: 0,
      pName: '',
      cName: '',
      needsSkillsCn: '',
      desc: ''
    })

    app.globalData.publishDataCache = {
      skills: this.data.dicts[0].dictList[0].dictList[0].dictList.map(item => {
        item.selected = false
        return item
      }),
      needSkills: [],
      needSkillsCn: [],
      desc: {
        content: ''
      }
    }
  },

  updateUserInfo() {
    this.props.stores.account.updateUserInfo()
  },

  hideCollector() {
    this.setData({
      showCollector: false
    })
  }

}))