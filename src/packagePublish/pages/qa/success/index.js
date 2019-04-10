Page({
  data: {
    no:''
  },

  onLoad (options) {
    this.setData({
      no:options.no
    })
  },

  call(){
    wx.makePhoneCall({
      phoneNumber: '0592-2226199' 
    })
  }
})