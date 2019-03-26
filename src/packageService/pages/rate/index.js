const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({
  data: {
    id: '',
    overallScore:3
    // desc: '',
    // conLen: 0,
    // inputLen: -1
  },

  onLoad (options) {
    this.setData({
      id: options.id
    })
  },

  // input (e) {
  //   let input = e.detail.value
  //   let validInput = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
  //   let conLen = validInput.length

  //   if (conLen > 200) {
  //     input = input.slice(0, 200)
  //     validInput = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
  //     conLen = validInput.length
  //   }

  //   let inputLen
  //   if (conLen === 200) {
  //     inputLen = 200
  //   } else if (conLen < 200) {
  //     inputLen = -1
  //   }
    
  //   this.setData({
  //     desc: input,
  //     conLen: conLen,
  //     inputLen: inputLen
  //   })
  // },

  rated(e) {
    const name = e.detail.name
    const point = e.detail.point
    switch (name) {
      case '服务速度':
        this.setData({
          speedScore: point
        })
        break;
      case '服务质量':
        this.setData({
          qualityScore: point
        })
        break;
      case '服务态度':
        this.setData({
          attitudeScore: point
        })
        break;
    }
  },

  overallRating (e) {
    this.setData({
      overallScore: e.currentTarget.dataset.point
    })
  },

  async submit (e) {
    if (!this.data.speedScore) {
      wx.showToast({
        title: '请评价服务速度',
        icon: 'none'
      })
      return
    }
    if (!this.data.qualityScore) {
      wx.showToast({
        title: '请评价服务质量',
        icon: 'none'
      })
      return
    }
    if (!this.data.attitudeScore) {
      wx.showToast({
        title: '请评价服务态度',
        icon: 'none'
      })
      return
    }
    if (!e.detail.value.comment) {
      wx.showToast({
        title: '请输入评价内容',
        icon: 'none'
      })
      return
    }
    if (!this.data.overallScore) {
      wx.showToast({
        title: '请完成综合评价',
        icon: 'none'
      })
      return
    }
    let res = await app.request.post('/store/productOrderInfo/appraiseProductOrder', {
      productOrderId: this.data.id,
      overallScore: this.data.overallScore,
      speedScore: this.data.speedScore,
      qualityScore: this.data.qualityScore,
      attitudeScore: this.data.attitudeScore,
      content: e.detail.value.comment
    })
    if (res.code !== 0) return
    wx.setStorageSync('update_order', true)
    wx.navigateBack()
  }
})