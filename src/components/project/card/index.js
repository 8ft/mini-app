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
  }
})
