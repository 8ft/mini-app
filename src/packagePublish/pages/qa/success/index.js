Page({
  onLoad (options) {
    this.setData({
      id:options.id,
      uid:options.uid
    })
  },

  call(){
    wx.makePhoneCall({
      phoneNumber: '0592-2226199' 
    })
  }
})