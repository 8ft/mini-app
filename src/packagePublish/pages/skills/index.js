const app = getApp()

Page({
  data: {
    skills:null,
    needSkills:[],
    needSkillsCn:[]
  },

  onLoad: function (options) {
    this.setData({
      skills: app.globalData.publishDataCache.skills,
      needSkills: app.globalData.publishDataCache.needSkills,
      needSkillsCn: app.globalData.publishDataCache.needSkillsCn
    })
  },

  onUnload:function(){
    app.globalData.publishDataCache.needSkills=this.data.needSkills
    app.globalData.publishDataCache.needSkillsCn = this.data.needSkillsCn
    app.globalData.publishDataCache.skills =this.data.skills
  },

  select:function(e){
    let code = e.currentTarget.dataset.code
    let name = e.currentTarget.dataset.name
    let needSkills = this.data.needSkills
    let needSkillsCn=this.data.needSkillsCn
    let index = needSkills.indexOf(code)

    if (index>-1){
      needSkills.splice(index,1)
      needSkillsCn.splice(index, 1)
      this.data.skills[e.currentTarget.dataset.index]['selected'] = false

      this.setData({
        skills: this.data.skills,
        needSkills: needSkills,
        needSkillsCn: needSkillsCn
      })
    }else{
      if(needSkills.length===10){
        wx.showToast({
          title: '最多勾选10个',
          icon:'none'
        })
        return 
      }
      needSkills.push(code)
      needSkillsCn.push(name)
      this.data.skills[e.currentTarget.dataset.index]['selected'] = true

      this.setData({
        skills: this.data.skills,
        needSkills: needSkills,
        needSkillsCn: needSkillsCn
      })
    }
  }
})