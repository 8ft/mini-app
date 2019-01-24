Component({
  properties: {
    private:{
      type:Boolean,
      value:false
    },
    project:{
      type:Object,
      observer(newVal, oldVal, changedPath) {
        this.setData({
          skills:newVal.projectSkill.split('|')
        })
      }
    }
  },

  data: {
    uid:'',
    skills:[]
  },

  attached:function(){
    let user = wx.getStorageSync('account')
    if (user) {
      this.setData({
        uid: user.userId
      })
    }
  },

  methods:{
    _toApplicant:function(){
      wx.navigateTo({
        url:`/packageExpert/pages/applicant/index?id=${this.data.project.id}`
      })
    }
  }
})
