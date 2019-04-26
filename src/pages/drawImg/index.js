Page({
  onLoad() {
    const systemInfo = wx.getSystemInfoSync()
    this.ratio_display = 562 / 750 * systemInfo.windowWidth / 750//展示绘制比率
    this.ratio_real = 1125 / 750//真实绘制比率

    const ctx_real = wx.createCanvasContext('real')
    const ctx_display = wx.createCanvasContext('display')
    const question = '如果只是做一款小程序可以流程，那么这样是否可以能够改变一些原来没有的东西呢，如果可以的这样子的 ？'

    this.draw(question, ctx_display, this.ratio_display)
    this.draw(question, ctx_real, this.ratio_real)
  },

  draw(str, ctx, ratio) {
    let arr = []
    const rowWidth = 587 * ratio
    ctx.setFontSize(30 * ratio)
    ctx.setTextBaseline('top')

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

    //设置画布尺寸
    const canvasWidth = 750 * ratio
    const canvasHeight = (842 + 53 * arr.length) * ratio

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

    //绘制海报区域
    ctx.setFillStyle('#FBFBFB')
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    //绘制banner   
    const reward = '500'.split('')
    const rewardLen = reward.length
    const harfRewardWidth = 28 * rewardLen
    const left_of_reward = 300 - harfRewardWidth

    ctx.drawImage('/assets/img/drawImg/bg.png', 0, 0, canvasWidth, 335 * ratio)
    ctx.drawImage('/assets/img/drawImg/w3.png', 212 * ratio, 147 * ratio, 310 * ratio, 71 * ratio)
    ctx.drawImage('/assets/img/drawImg/w1.png', (186 - harfRewardWidth) * ratio, 83 * ratio, 111 * ratio, 58 * ratio)
    ctx.drawImage('/assets/img/drawImg/w2.png', (300 + harfRewardWidth) * ratio, 83 * ratio, 273 * ratio, 58 * ratio)

    reward.forEach((number, index) => {
      ctx.drawImage(`/assets/img/drawImg/${number}.png`, (left_of_reward + 56 * index) * ratio, 64 * ratio, 56 * ratio, 75 * ratio)
    })


    //绘制问题区域
    const left = 29 * ratio
    const right = 721 * ratio
    const top = 253 * ratio
    const bottom = (253 + 262 + 53 * arr.length) * ratio
    const radius = 10 * ratio

    ctx.moveTo(left, top + radius)
    ctx.quadraticCurveTo(left, top, left + radius, top)

    ctx.lineTo(right - radius, top)
    ctx.quadraticCurveTo(right, top, right, top + radius)

    ctx.lineTo(right, bottom - radius)
    ctx.quadraticCurveTo(right, bottom, right - radius, bottom)

    ctx.lineTo(left + radius, bottom)
    ctx.quadraticCurveTo(left, bottom, left, bottom - radius)

    ctx.lineTo(left, top + radius)

    ctx.setFillStyle('#fff')
    ctx.setShadow(0, 2, 2, '#F6F6F6')
    ctx.fill()

    //绘制头像
    ctx.save()
    ctx.beginPath()
    ctx.arc(116 * ratio, 339 * ratio, 35 * ratio, 0, 2 * Math.PI)
    ctx.clip()
    ctx.drawImage('/assets/img/wxzf@3x.png', 81 * ratio, 304 * ratio, 70 * ratio, 70 * ratio)
    ctx.restore()

    //绘制昵称
    ctx.setFillStyle('#333333')
    ctx.setTextAlign('left')
    ctx.setFontSize(28 * ratio)
    ctx.fillText('八疯兔', 177 * ratio, 312 * ratio)

    ctx.setFontSize(18 * ratio)
    ctx.fillText('我遇到了一个小难题，谁可以帮我解答一下？', 177 * ratio, 353 * ratio)

    //绘制问题内容
    ctx.setFontSize(30 * ratio)
    arr.forEach((row, index) => {
      ctx.fillText(row, 88 * ratio, (439 + 53 * index) * ratio)
    })

    //绘制底部文案
    ctx.setFontSize(22 * ratio)
    ctx.setFillStyle('#666666')
    ctx.setTextAlign('center')
    ctx.fillText('快速解答这个问题，领取200元奖励', 375 * ratio, 914 * ratio)
    ctx.fillText('长按小程序码  先到先得', 375 * ratio, 953 * ratio)

    ctx.draw()
  },

  save() {
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.data.canvasWidth,
      height: this.data.canvasHeight,
      destWidth: this.data.canvasWidth,
      destHeight: this.data.canvasHeight,
      canvasId: 'real',
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          complete(result) {
            wx.showToast({
              icon: 'none',
              title: result.errMsg
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
