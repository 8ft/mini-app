Component({
  properties: {
    project:Object
  },

  data: {
    uid:''
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
