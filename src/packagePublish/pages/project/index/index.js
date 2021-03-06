const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime

Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    dicts:[],
    typeIndex:0,
    subTypeIndex:0,
    budgetIndex:0,
    cycleIndex:0,
    cooperaterIndex:0,
    typeIconName:{
      '开发':'kaifa',
      '设计':'sheji',
      '市场/运营':'yunying',
      '产品':'chanpin'
    },
    pName:'',
    cName:'',
    needsSkillsCn:'',
    desc:'',
    showCollector:false
  },

  onLoad(){
    this.getDicts()
  },
   
  onShow(){
    this.setData({
      needsSkillsCn: app.globalData.publishDataCache.needSkillsCn.join('|'),
      desc: app.globalData.publishDataCache.desc.content
    })
  },

  onUnload(){
    app.globalData.publishDataCache =  {
      skills: null,
      needSkills: [],
      needSkillsCn: [],
      desc: {
        content: ''
      }
    }
  },

  async getDicts(){
    let res = await app.request.post('/dict/dictCommon/getDicts', {
      dictType: 'project_type|price_budget|project_cycle|cooperate_type',
      resultType: '1'
    })

    if(res.code===0){
      this.setData({
        dicts: this.data.dicts.concat(res.data.data)
      })
      this.saveSkillData()
    }
  },

  toSkills(){
    const skills = app.globalData.publishDataCache.skills
    if (!skills||skills.length===0){
      wx.showToast({
        title: '所选类型没有可选技能',
        icon: 'none'
      })
    }else{
      wx.navigateTo({
        url: '/packagePublish/pages/project/skills/index',
      })
    }
  },

  select(e){
    let index
    let data=e.currentTarget.dataset
    if(e.type==='change'){
      index=e.detail.value
    }else{
      index=data.index
    }

    switch(data.type){
      case 'type':
        this.setData({
          typeIndex:index,
          subTypeIndex:0
        })
        this.saveSkillData()
        break;
      case 'subType':
        this.setData({
          subTypeIndex: index
        })
        this.saveSkillData()
        break;
      case 'budget':
        this.setData({
          budgetIndex: index
        })
        break;
      case 'cycle':
        this.setData({
          cycleIndex: index
        })
        break;
      case 'cooperater':
        this.setData({
          cooperaterIndex: index
        })
        break;
    }
  },

  saveSkillData(){
    this.setData({
      needsSkillsCn:''
    })
    app.globalData.publishDataCache.needSkills=[]
    app.globalData.publishDataCache.needSkillsCn = []
    app.globalData.publishDataCache.skills = this.data.dicts[0].dictList[this.data.typeIndex].dictList[this.data.subTypeIndex].dictList.map(item=>{
      item.selected = false
      return item
    })
  },

  input (e) {
    let inputType = e.currentTarget.dataset.type
    let val = e.detail.value.replace(/[ ]/g, "").replace(/[\r\n]/g, "")
    switch (inputType) {
      case 'project':
        this.setData({
          pName: val
        })
        break;
      case 'company':
        this.setData({
          cName: val
        })
        break;
    }
  },

  async publish(){
    let data = this.data
    if (!data.pName) {
      wx.showToast({
        title: '请输入项目名称',
        icon: 'none'
      })
      return
    }

    let desc = data.desc.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
    if (desc.length<50){
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
      fileBatchNo: app.globalData.publishDataCache.desc.batchNo||''
    })

    if (res.code === 0) {
      this.refresh()

      let userBaseInfo=this.props.stores.account.userInfo.userBaseInfo
      if (!(userBaseInfo.qq||userBaseInfo.wechat)){
        this.setData({
          showCollector: true
        })
      }else{
        wx.navigateTo({
          url: `/packagePublish/pages/project/success/index?no=${res.data.projectNo}`,
        })
      }
    }
  },

  refresh(){
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
        content:''
      }
    }
  },

  updateUserInfo(){
    this.props.stores.account.updateUserInfo()
  },

  hideCollector(){
    this.setData({
      showCollector:false
    })
  }

}))