
const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    skills:[],
    newSkill:'',
    addedSkills:[]
  },

  onLoad (options) {
    let userSkills =app.util.deepCopy(this.props.stores.account.userInfo.userSkills)
    if (userSkills.length>0){
      userSkills=userSkills.map(item=>{
        return {
          skillCode: item.skillCode,
          skillName: item.skillName,
          skillValue: item.skillValue
        }
      })
      this.setData({
        addedSkills:userSkills
      })
    }
    this.getDicts()
  },

  async getDicts () {
    let res = await app.request.post('/dict/dictCommon/getDicts', {
      dictType: 'user_skill',
      resultType: '1'
    })

    if (res.code === 0) {
      this.setData({
          skills: res.data.data[0].dictList
      })
      this.resetActive()
    }
  },

  resetActive () {
    let skills = this.data.skills
    skills = skills.map(skillType => {
      skillType.dictList = skillType.dictList.map(skill => {
        skill.active = this.data.addedSkills.some(item => {
          return item.skillCode === skill.dictCode
        })
        return skill
      })
      return skillType
    })
    this.setData({
      skills: skills
    })
  },

  select (e) {
    let data = e.currentTarget.dataset
    let skill = this.data.skills[data.type].dictList[data.index]
    let addedSkills = this.data.addedSkills

    if (skill.active !==true&&addedSkills.length === 20) {
      wx.showToast({
        title: '擅长技能至多添加20个',
        icon: 'none'
      })
      return
    }

    if(skill.active===true){
      this.setData({
        [`skills[${data.type}].dictList[${data.index}].active`]:false
      })
      addedSkills = addedSkills.filter(item=>{
        return item.skillValue != data.skill.dictValue
      })
    }else{
      this.setData({
        [`skills[${data.type}].dictList[${data.index}].active`]:true
      })
      this.data.addedSkills.push({
        skillCode: data.skill.dictCode,
        skillValue: data.skill.dictValue,
        skillName: data.skill.dictName,
        typeIndex:data.type,
        skillIndex:data.index
      })
    }
    
    this.setData({
      addedSkills: addedSkills
    })
  },

  input (e) {
    let val = e.detail.value.replace(/[ ]/g, "").replace(/[\r\n]/g, "")
    if (/^[\u4e00-\u9fa5]+$/.test(val)&&val.length>8){
      wx.showToast({
        title: '最长8个汉字或16个字符',
        icon: 'none'
      })
      this.setData({
        newSkill: this.data.newSkill
      })
      return
    }
    this.setData({
      newSkill:val 
    })
  },

  add(){
    let name=this.data.newSkill
    if (!name){
      wx.showToast({
        title: '请输入技能',
        icon:'none'
      })
      return
    }
    let addedSkills = this.data.addedSkills
    if(addedSkills.length===20){
      wx.showToast({
        title: '擅长技能至多添加20个',
        icon: 'none'
      })
      return
    }
    addedSkills.push({
      skillCode: -1,
      skillValue: -1,
      skillName: name
    })
    this.setData({
      addedSkills: addedSkills,
      newSkill:''
    })
  },

  del(e){
    let index=e.currentTarget.dataset.index
    let addedSkills = this.data.addedSkills

    addedSkills.splice(index, 1)
    this.setData({
      addedSkills: addedSkills
    })

    this.resetActive()
  },

  async save(){
    let res = await app.request.post('/user/userAuth/completeUserSkill', {
      userSkillInfos: JSON.stringify(this.data.addedSkills)
    })
    if (res.code === 0) {
      this.props.stores.account.updateUserInfo()
      wx.navigateBack()
    }
  }

}))