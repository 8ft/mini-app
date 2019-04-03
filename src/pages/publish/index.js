const app = getApp()

Page({
  go(e){
    if (!app.checkLogin()) return 
    wx.navigateTo({
        url: e.currentTarget.dataset.url
    })
  }
})
