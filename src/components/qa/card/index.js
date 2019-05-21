const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime

Component({
  externalClasses: ['custom-class'],
  properties: {
    data: {
      type: Object,
      observer(newVal, oldVal, changedPath) {
        let questionName = newVal.questionName
        if (!questionName) return

        if (questionName.length > 36) {
          questionName = questionName.substring(0, 30) + '...'
        }

        this.setData({
          'data.questionName': questionName,
          imgsWidth: newVal.answerUsers.length * 40 + 30
        })
      }
    },
    appearance: {
      type: String,
      value: 'normal'
    },
    index: Number
  },

  data: {
    activeUI_by_status: {
      0: { status: true },//草稿,未提交,待支付
      10: { status: true },//提交,待审核
      11: { viewer: true },//审核通过,已发布
      12: { viewer: true },//已解决
      13: { status: true },//已下架(已解决再下架)
      20: { status: true },//审核未通过
      21: { status: true },//已下架
      22: { status: true }//已关闭
    },

    activeUI_by_appearance: {
      'default':{viewer:true},
      'theQuestions': { viewer: true },
      'theAnswers': { viewer: true },
      'collection': {},
      'myQuestions': { status: true },
      'myAnswers': { delete: true }
    },

    showStatus: false
  },



  methods: {
    async _delete() {
      let res = await app.request.post('/qa/answer/hideAnswerQuestion', {
        questionId: this.properties.data.id
      })
      if (res.code !== 0) return
      wx.showToast({
        title: '删除成功',
        icon: 'none'
      })
      this.triggerEvent('delete')
    },

    async _collect() {
      const res = await app.request.post('/qa/question/collect', {
        questionId: this.properties.data.id,
        userId: wx.getStorageSync('account').userId,
        collect: this.properties.data.collectFlag === 0 ? 1 : 0
      })
      if (res.code !== 0) return
      this.triggerEvent('collect', { index: this.properties.index, flag: this.properties.data.collectFlag == 0 ? 1 : 0 })
    },

    _goDetail(e) {
      this.setData({
        'data.viewNum': this.properties.data.viewNum += 1
      })
      wx.navigateTo({
        url: e.currentTarget.dataset.url
      })
    }
  }
})
