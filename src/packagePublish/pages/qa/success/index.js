Page({
  onLoad (options) {
    this.setData({
      id:options.id,
      uid:options.uid,
      reward:options.reward||''
    })
  },

  call(){
    wx.makePhoneCall({
      phoneNumber: '0592-2226199' 
    })
  }
})