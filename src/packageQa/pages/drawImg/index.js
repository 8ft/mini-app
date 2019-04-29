Page({
  onLoad() {
    wx.showLoading({
      title: '长图生成中..',
      mask: true
    })

    const systemInfo = wx.getSystemInfoSync()
    this.ratio_display = 562 / 750 * systemInfo.windowWidth / 750//展示绘制比率
    this.ratio_real = 1125 / 750//真实绘制比率

    const ctx_real = wx.createCanvasContext('real')
    const ctx_display = wx.createCanvasContext('display')

    const qa = wx.getStorageSync('qaData')
    if (qa.question.reward > 0) {
      qa.question.content = `【悬赏${qa.question.reward}】${qa.question.content}`
    }

    const avatarUrl = qa.answer ? qa.answer.userAvatar : qa.question.userAvatar
    if (avatarUrl !== '/assets/img/default/avatar.png') {
      wx.downloadFile({
        url: avatarUrl,
        success: res => {
          qa.avatar = res.tempFilePath
          this.draw(qa, ctx_display, this.ratio_display)
          this.draw(qa, ctx_real, this.ratio_real)
        }
      })
    } else {
      qa.avatar = avatarUrl
      this.draw(qa, ctx_display, this.ratio_display)
      this.draw(qa, ctx_real, this.ratio_real)
    }
  },

  onUnload() {
    wx.removeStorageSync('qaData')
  },


  draw(qa, ctx, ratio) {
    ctx.setTextBaseline('top')
    const questionLineHeight = 52
    const answerLineHeight = 46
    const hasReward = qa.question.reward > 0

    //拆分内容成若干行,并设置canvas尺寸
    const canvasWidth = 750 * ratio
    let canvasHeight = 0

    const questionWords = this.contentBreak(qa.question.content, 'question', ctx, ratio)
    const questionWordsLen = questionWords.length
    const questionWordsHeight = questionLineHeight * questionWordsLen

    let answerWords = null
    let answerWordsLen = 0
    let answerWordsHeight = 0

    if (qa.answer) {
      answerWords = this.contentBreak(qa.answer.content, 'answer', ctx, ratio)
      answerWordsLen = answerWords.length
      answerWordsHeight = answerLineHeight * answerWordsLen
      canvasHeight = (875 + questionWordsHeight + answerWordsHeight) * ratio
    } else {
      canvasHeight = (842 + questionWordsHeight) * ratio
    }

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
    ctx.fillStyle = '#FBFBFB'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    //绘制banner   
    ctx.drawImage('../../assets/img/bg.png', 0, 0, canvasWidth, 335 * ratio)

    if (hasReward && qa.question.state !== 12) {
      const reward = `${qa.question.reward}`.split('')
      const rewardLen = reward.length
      const harfRewardWidth = 28 * rewardLen
      const left_of_reward = 300 - harfRewardWidth
      ctx.drawImage('../../assets/img/w3.png', 212 * ratio, 147 * ratio, 310 * ratio, 71 * ratio)
      ctx.drawImage('../../assets/img/w1.png', (186 - harfRewardWidth) * ratio, 83 * ratio, 111 * ratio, 58 * ratio)
      ctx.drawImage('../../assets/img/w2.png', (300 + harfRewardWidth) * ratio, 83 * ratio, 273 * ratio, 58 * ratio)

      reward.forEach((number, index) => {
        ctx.drawImage(`../../assets/img/${number}.png`, (left_of_reward + 56 * index) * ratio, 64 * ratio, 56 * ratio, 75 * ratio)
      })
    } else if (qa.question.state !== 12) {
      ctx.drawImage('../../assets/img/t1.png', 98 * ratio, 73 * ratio, 578 * ratio, 147 * ratio)
    } else {
      ctx.drawImage('../../assets/img/t2.png', 117 * ratio, 72 * ratio, 541 * ratio, 156 * ratio)
    }

    //绘制问题区域
    const left = 29 * ratio
    const right = 721 * ratio
    const top = 253 * ratio
    let bottom = (253 + 262 + questionWordsHeight) * ratio
    const radius = 10 * ratio

    if (qa.answer) {
      bottom += (33 + answerWordsHeight) * ratio
    }

    ctx.moveTo(left, top + radius)
    ctx.quadraticCurveTo(left, top, left + radius, top)

    ctx.lineTo(right - radius, top)
    ctx.quadraticCurveTo(right, top, right, top + radius)

    ctx.lineTo(right, bottom - radius)
    ctx.quadraticCurveTo(right, bottom, right - radius, bottom)

    ctx.lineTo(left + radius, bottom)
    ctx.quadraticCurveTo(left, bottom, left, bottom - radius)

    ctx.lineTo(left, top + radius)

    ctx.fillStyle = '#fff'
    ctx.setShadow(0, 2, 2, '#F6F6F6')
    ctx.fill()


    //绘制头像
    const avatarX = 81 * ratio
    const avatarY = top + (qa.answer ? 137 + questionWordsHeight : 51) * ratio
    const avatarR = 35 * ratio
    ctx.save()
    ctx.beginPath()
    ctx.arc(avatarX + avatarR, avatarY + avatarR, avatarR, 0, 2 * Math.PI)
    ctx.clip()
    ctx.drawImage(qa.avatar, avatarX, avatarY, 70 * ratio, 70 * ratio)
    ctx.restore()


    //绘制昵称
    const userNameX = avatarX + 95 * ratio
    const userNameY = avatarY + 8 * ratio
    ctx.fillStyle = '#333333'
    ctx.setTextAlign('left')
    ctx.setFontSize(28 * ratio)
    ctx.fillText(qa.answer ? qa.answer.userName : qa.question.userName, userNameX, userNameY)

    ctx.setFontSize(18 * ratio)
    ctx.fillText(qa.answer ? qa.answer.tip : qa.question.tip, userNameX, userNameY + 40 * ratio)


    //绘制问题内容
    const questionY = qa.answer ? top + 51 * ratio : avatarY + 134 * ratio
    const iconWidth = (hasReward ? 26 : 29) * ratio
    const iconHeight = (hasReward ? 36 : 34) * ratio
    ctx.drawImage(`../../assets/img/${hasReward ? 'reward' : 'hot'}.png`, avatarX, questionY, iconWidth, iconWidth)

    ctx.setFontSize(30 * ratio)
    questionWords.forEach((row, index) => {
      if (index === 0) {
        ctx.fillText(row, avatarX + 34 * ratio, questionY + questionLineHeight * index * ratio)
      } else {
        ctx.fillText(row, avatarX, questionY + questionLineHeight * index * ratio)
      }
    })

    //绘制回答内容
    if (qa.answer) {
      const answerY = avatarY + 102 * ratio
      ctx.setFontSize(28 * ratio)
      answerWords.forEach((row, index) => {
        ctx.fillText(row, avatarX, answerY + answerLineHeight * index * ratio)
      })
    }


    //绘制底部文案级二维码
    ctx.setFontSize(22 * ratio)
    ctx.fillStyle = '#666666'
    ctx.setTextAlign('center')

    if (qa.answer) {
      ctx.drawImage('../../assets/img/qr.png', 304 * ratio, canvasHeight - 260 * ratio, 144 * ratio, 144 * ratio)
      ctx.fillText('长按小程序码 查看更多精彩回答', 375 * ratio, canvasHeight - 87 * ratio)
    } else if (hasReward) {
      ctx.drawImage('../../assets/img/qr.png', 304 * ratio, canvasHeight - 293 * ratio, 144 * ratio, 144 * ratio)
      ctx.fillText('快速解答这个问题，领取200元奖励', 375 * ratio, canvasHeight - 116 * ratio)
      ctx.fillText('长按小程序码  先到先得', 375 * ratio, canvasHeight - 77 * ratio)
    } else {
      ctx.drawImage('../../assets/img/qr.png', 304 * ratio, canvasHeight - 293 * ratio, 144 * ratio, 144 * ratio)
      ctx.fillText('只要能解答这个问题，我就承认你很牛~', 375 * ratio, canvasHeight - 116 * ratio)
      ctx.fillText('长按小程序码  参与讨论', 375 * ratio, canvasHeight - 77 * ratio)
    }

    ctx.draw(false, res => {
      if (ratio === this.ratio_real && res.errMsg === 'drawCanvas:ok') {
        //由于setData是异步的，在此给个延迟，防止setData还未完成就进行保存
        wx.hideLoading()
        // setTimeout(()=>{
        //   this.save()
        // },1000)
      }
    })
  },


  contentBreak(content, type, ctx, ratio) {
    const rowWidth = 587 * ratio
    const firstRowWidth = 553 * ratio

    ctx.setFontSize((type === 'question' ? 30 : 28) * ratio)

    let newContent = []
    if (ctx.measureText(content).width > (type === 'question' ? firstRowWidth : rowWidth)) {
      let words = ''
      for (let i = 0; i < content.length; i++) {
        if (/[\r\n]/.test(content[i])) {
          if (words) {
            newContent.push(words)
          }
          newContent.push('')
          words = ''
          continue
        }
        words += content[i]
        if (ctx.measureText(words).width > ((newContent.length === 0 && type === 'question') ? firstRowWidth : rowWidth)) {
          newContent.push(words.slice(0, -1))
          --i
          words = ''
        } else if (i === content.length - 1) {
          newContent.push(words)
        }
      }
    } else {
      newContent.push(content)
    }

    return newContent
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
          success() {
            wx.hideLoading()
            wx.showToast({
              title: '已保存到相册',
              duration: 3000
            })
          }
        })
      }
    })
  },

  navigateBack() {
    wx.navigateBack()
  }

})
