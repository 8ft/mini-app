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
    rewards:[0,0.01,5,10,15,20,50,100,200],
    selectedTags:[]
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

    let selected=!this.data.tags[val][index].selected
    if(this.data.selectedTags.length===5&&selected){
      wx.showToast({
        icon:'none',
        title:'最多只能选择5个标签哦'
      })
      return 
    } 
    
    if(selected){
      this.data.selectedTags.push(this.data.tags[val][index].dictValue)
    }else{
      this.data.selectedTags.splice(this.data.selectedTags.indexOf(this.data.tags[val][index].dictValue),1)
    }
    
    this.setData({
      [`tags.${val}[${index}].selected`]:selected,
      selectedTags:this.data.selectedTags
    })
  },

  async publish() {
    let question = this.data.question||{}

    if(!question.title||!question.desc){
      wx.showToast({
        title: '请输入问题描述',
        icon: 'none'
      })
      return
    }

    let descArr=question.desc.split(/[\r\n]/)
    let html=''

    descArr.forEach(p=>{
      html+=`<p>${p}</p>`
    })

    if(question.imgs.length>0){
      question.imgs.forEach(img=>{
        html+=`<img width="100%" src="${img.url}"/>`
      })
    }

    let skills=''
    if(this.data.selectedTags.length>0){
      skills=this.data.selectedTags.join('|')
    }

    let res = await app.request.post('/qa/question/save', {
      questionName:question.title,
      questionType:this.data.objectMultiArray[0][this.data.multiIndex[0]].dictValue,
      subType:this.data.objectMultiArray[1][this.data.multiIndex[1]].dictValue,
      skillCode:skills,
      rewardAmountYuan:this.data.reward,
      content:html,
      contentBatchNo:question.batchNo
    })

    if (res.code !== 0) return

    this.props.stores.account.ask(1)

    if(this.data.reward>0){
      wx.setStorageSync('question',{
        id:res.data.id,
        uid:res.data.userId,
        title:question.title,
        reward:this.data.reward
      })
      wx.redirectTo({
        url: '/packageQa/pages/pay/index?from=publish'
      })
    }else{
      wx.redirectTo({
        url: `/packagePublish/pages/qa/success/index?id=${res.data.id}&uid=${res.data.userId}`
      })
    }
  },

  updateUserInfo() {
    this.props.stores.account.updateUserInfo()
  }

}))