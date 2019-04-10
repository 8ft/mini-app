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
    const question = wx.getStorageSync('questionCache')
    if(!question)return 
    this.setData({
      question:question
    })
  },

  onUnload() {
    wx.removeStorageSync('questionCache')
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
    // let question = this.data.question||{}
    // if (!question.title) {
    //   wx.showToast({
    //     title: '请输入问题标题',
    //     icon: 'none'
    //   })
    //   return
    // }

    // if(!question.desc){
    //   wx.showToast({
    //     title: '请输入问题描述',
    //     icon: 'none'
    //   })
    //   return
    // }


    // let descArr=question.desc.split(/[\r\n]/)
    // let html=''

    // descArr.forEach(p=>{
    //   html+=`<p>${p}</p>`
    // })

    // if(question.imgs.length>0){
    //   question.imgs.forEach(img=>{
    //     html+=`<image width="100%" src="${img.url}"/>`
    //   })
    // }
    // console.log(html)

    // let res = await app.request.post('/qa/question/save', {
    //   questionName:desc.title,
    //   questionType:this.data.objectMultiArray[0][this.data.multiIndex[0]].dictValue,
    //   subType:this.data.objectMultiArray[1][this.data.multiIndex[1]].dictValue,
    //   // skillCode:,
    //   rewardAmountYuan:this.data.reward,
    //   content:desc.desc,
    //   contentBatchNo:desc.batchNo
    // })

    // if (res.code === 0) {
    //   // this.refresh()
      wx.navigateTo({
        // url: `/packagePublish/pages/qa/success/index?no=${res.data.projectNo}`
        url: '/packagePublish/pages/qa/success/index'
      })
    // }
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
  }

}))