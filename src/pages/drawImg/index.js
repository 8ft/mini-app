Page({
  onLoad() {
    const systemInfo = wx.getSystemInfoSync()

    this.pixelRatio = systemInfo.pixelRatio
    this.ratio_display = systemInfo.windowWidth / 750
    this.ratio_real = systemInfo.windowWidth / 750 * this.pixelRatio

    const ctx_real = wx.createCanvasContext('real')
    const ctx_display = wx.createCanvasContext('display')

    ctx_display.setFontSize(36 * this.ratio_display)
    ctx_real.setFontSize(36 * this.ratio_real)

    this.drawText('如果只是做一款小程序可以流程，那么这样是否可以能够改变一些原来没有的东西呢，如果可以的这样子的 ？', ctx_display, this.ratio_display)
    this.drawText('如果只是做一款小程序可以流程，那么这样是否可以能够改变一些原来没有的东西呢，如果可以的这样子的 ？', ctx_real, this.ratio_real)

    ctx_display.draw()
    ctx_real.draw()


    // wx.chooseImage({
    //   success:res=> {
    //     ctx.moveTo(0,0)
    //     ctx.drawImage(res.tempFilePaths[0], 30, 50, 220, 110)
    //   },
    //   complete(){
    //     ctx.draw()
    //   }
    // })
  },

  drawText(str, ctx, ratio) {
    let arr = []
    const rowWidth = 456 * ratio
    if (ctx.measureText(str).width > rowWidth) {
      let row = ''
      for (let i = 0; i < str.length; i++) {
        row += str[i]
        if (ctx.measureText(row).width > rowWidth) {
          arr.push(row.slice(0, -1))
          --i
          row = ''
        } else if (i === str.length - 1) {
          arr.push(row)
        }
      }
    } else {
      arr.push(str)
    }

    const canvasWidth = 590 * ratio
    const canvasHeight = (300 + 40 * arr.length) * ratio

    if (ratio === this.ratio_display) {
      this.setData({
        displayWidth: canvasWidth,
        displayHeight: canvasHeight
      })
    } else {
      this.setData({
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight
      })
    }

    ctx.setFillStyle('#fff')
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    ctx.setFillStyle('black')
    arr.forEach((row, index) => {
      ctx.fillText(row, 66 * ratio, 163 * ratio + 40 * ratio * index)
    })

  },

  save() {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.data.canvasWidth,
      height: this.data.canvasHeight,
      canvasId: 'real',
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          complete(result) {
            wx.showToast({
              icon:'none',
              title:result.errMsg
            })
          }
        })
      }
    })
  },

  auth() {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.save()
            }
          })
        } else {
          this.save()
        }
      }
    })
  }

})
