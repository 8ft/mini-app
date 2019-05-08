

Page({
  onLoad() {
    const filePath = wx.getStorageSync('img_aboutQa')
    if (filePath) {
      this.setData({
        filePath: filePath
      })
    } else {
      wx.showLoading({
        title: '加载中',
        mask: true,
        icon: 'none'
      })
      wx.downloadFile({
        url: 'https://www.juniuhui.com/images/wechat/questionExplain.png',
        success: res => {
          wx.setStorageSync('img_aboutQa',res.tempFilePath)
          this.setData({
            filePath: res.tempFilePath
          })
          wx.hideLoading()
        }
      })
    }

  }
})