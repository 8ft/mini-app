const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime

const Towxml = require('../../../libs/towxml/main')
const towxml = new Towxml()
const nodataCon = {
  10: {
    img: 'wzz',
    text: "别急呀！问题正在审核中...\n通过后即可查看，请稍后再试"
  },
  20: {
    img: 'wfw',
    text: '问题涉嫌违规，发起者正在完善中…'
  },
  22: {
    img: 'wfw',
    text: '好遗憾，该问题可能已经被关闭或删除了'
  }
}


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    isMyself: false,

    detail: null,
    article: {},

    lists: {
      best: [],
      hots: [],
      answers: []
    },

    commentsPostion: 0,
    nomore: false,
    pageIndex: 1,

    cIndex: -1,
    boxSwitch: false,
    boxHeight: 0,
    scrollViewHeight: 0,
    loading: true,

    reportTargetId: '',
    reportDesc: '',
    selectedReportType: 0,
    reportTypes: [{
      val: 1,
      needDesc: false,
      name: '广告及垃圾信息',
      placeholder: '写下举报的详细描述(选填,100字内)'
    }, {
      val: 2,
      needDesc: true,
      name: '抄袭或未授权转载',
      placeholder: '只接受原文作者举报，请输入举报原因和原文链接(必填,100字以内)'
    }, {
      val: 9,
      needDesc: true,
      name: '其他',
      placeholder: '写下举报的详细情况(必填,100字内)'
    }]
  },

  onLoad(options) {
    const systemInfo = wx.getSystemInfoSync()
    const pixelRatio = systemInfo.windowWidth / 750
    const boxHeight = (systemInfo.windowHeight - 100 * pixelRatio - systemInfo.statusBarHeight) * .98
    this.setData({
      boxHeight: boxHeight,
      scrollViewHeight: boxHeight - 180 * pixelRatio,
      uid: options.uid || '',
      id: options.id
    })
  },

  onShow() {
    this.props.stores.toRefresh.refresh('qa_detail', (exist) => {
      if (!this.data.detail) {
        this.getDetail()
      } else if (exist) {
        this.getDetail()
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '接包发包专业平台',
      path: `packageQa/pages/detail/index?id=${this.data.id}&uid=${this.data.uid}`
    }
  },

  async openBox(e) {
    const belongs = e.currentTarget.dataset.belongs
    const index = e.currentTarget.dataset.index

    if (index !== this.data.cIndex || belongs !== this.data.belongs) {
      this.setData({
        belongs: belongs,
        cIndex: index
      })

      const answer = this.data.lists[belongs][index]
      if (answer.replyNum > 0 && !answer.replies) {
        await this.getComments(answer.id, belongs, index)
      }
    }

    this.setData({
      boxSwitch: true
    })
  },

  closeBox() {
    this.setData({
      boxSwitch: false
    })
  },

  spread(e) {
    const belongs = e.currentTarget.dataset.belongs
    const index = e.currentTarget.dataset.index

    if (this.data.boxSwitch) {
      let answer = this.data.lists[belongs][this.data.cIndex].replies[index]
      this.setData({
        [`lists.${belongs}[${this.data.cIndex}].replies[${index}].spread`]: !answer.spread
      })
    } else {
      let answer = this.data.lists[belongs][index]
      this.setData({
        [`lists.${belongs}[${index}].spread`]: !answer.spread
      })
    }

  },

  async take(e) {
    wx.showModal({
      title: '提示',
      confirmText: '提交',
      confirmColor: '#4C87F9',
      content: this.data.detail.rewardAmount > 0 ? '请确认是否已解决你的问题，答案一经采纳后即同意将悬赏金额答谢给回答者' : '请确认是否已解决你的问题，答案一经采纳后将无法撤销',
      success: async res => {
        if (res.confirm) {
          let res = await app.request.post('/qa/question/acceptQuestionAnswer', {
            questionId: this.data.detail.id,
            answerId: e.currentTarget.dataset.id
          })
          if (res.code === 0) {
            this.data.lists = {
              best: [],
              hots: [],
              answer: []
            },
              this.data.pageIndex = 1
            this.data.nomore = false
            this.getAnswers()
          }
        }
      }
    })
  },

  async like(e) {
    if (app.checkLogin()) {
      const res = await app.request.post('/qa/answer/praise', {
        answerId: e.currentTarget.dataset.id
      })
      if (res.code !== 0) return

      const index = e.currentTarget.dataset.index
      const belongs = e.currentTarget.dataset.belongs
      if (this.data.boxSwitch) {
        let answer = this.data.lists[belongs][this.data.cIndex].replies[index]
        this.setData({
          [`lists.${belongs}[${this.data.cIndex}].replies[${index}].praiseNum`]: answer.praiseNum + (answer.praiseFlag ? -1 : 1),
          [`lists.${belongs}[${this.data.cIndex}].replies[${index}].praiseFlag`]: !answer.praiseFlag
        })
      } else {
        let answer = this.data.lists[belongs][index]
        this.setData({
          [`lists.${belongs}[${index}].praiseNum`]: answer.praiseNum + (answer.praiseFlag ? -1 : 1),
          [`lists.${belongs}[${index}].praiseFlag`]: !answer.praiseFlag
        })
      }
    }
  },

  async follow() {
    if (app.checkLogin()) {
      const res = await app.request.post('/blog/attentionInfo/follow', {
        attentionUserId: this.data.detail.userId
      })
      if (res.code !== 0) return
      this.props.stores.account.follow(this.data.detail.followFlag === 0 ? 1 : -1)
      this.setData({
        'detail.followFlag': this.data.detail.followFlag === 0 ? 1 : 0
      })
    }
  },

  async collect() {
    if (app.checkLogin()) {
      const res = await app.request.post('/qa/question/collect', {
        questionId: this.data.detail.id,
        userId: this.props.stores.account.userInfo.userId,
        collect: this.data.detail.collectFlag === 0 ? 1 : 0
      })
      if (res.code !== 0) return
      this.setData({
        'detail.collectFlag': this.data.detail.collectFlag === 0 ? 1 : 0
      })
      this.props.stores.toRefresh.updateList('collect')
    }
  },

  async getDetail() {
    this.setData({ loading: true })

    let detail = await app.request.post('/qa/question/query/detail', {
      questionId: this.data.id
    })
    if (detail.code !== 0) return

    detail.data.createTime = app.util.formatTime(detail.data.createTime, 'blogDetail')
    detail.data.skillTag = [detail.data.subTypeName].concat(detail.data.skillTag.split('|'))
    detail.data.nodata = nodataCon[detail.data.questionState]

    let isMyself = false
    if (this.props.stores.account.logged_in) {
      isMyself = this.props.stores.account.userInfo.userId === this.data.uid
    }

    this.setData({
      active: detail.data.questionState === 11 || detail.data.questionState === 12,
      isMyself: isMyself,
      loading: false,
      detail: detail.data
    })

    //解析html
    let wxml = towxml.toJson(
      detail.data.content,
      'html'
    )

    this.setData({
      article: wxml
    })

    if (detail.data.answerNum > 0) {
      this.getAnswers()
    }
  },

  async getAnswers() {
    let nomore = this.data.nomore
    if (nomore) return

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/qa/answer/listMultiAnswers', {
      questionId: this.data.id,
      pageIndex: pIndex
    })
    if (res.code !== 0) return

    if (pIndex === 1) {
      this.setData({
        'lists.best': this.data.lists.best.concat(res.data.best ? res.data.best.map(item => {
          item.createTime = app.util.formatTime(item.createTime, 'blogComment')
          return item
        }) : []),
        'lists.hots': this.data.lists.hots.concat(res.data.hots ? res.data.hots.map(item => {
          item.createTime = app.util.formatTime(item.createTime, 'blogComment')
          return item
        }) : [])
      })
    }

    if (res.data.answers.page > pIndex) {
      pIndex++
    } else {
      nomore = true
    }

    this.setData({
      nomore: nomore,
      pageIndex: pIndex,
      'lists.answers': this.data.lists.answers.concat(res.data.answers.list.map(item => {
        item.createTime = app.util.formatTime(item.createTime, 'blogComment')
        return item
      }))
    })
  },

  async getComments(answerId, belongs, index) {
    let res = await app.request.post('/qa/answer/listAnswers', {
      questionId: this.data.id,
      answerId: answerId,
      pageIndex: 1,
      pageSize: 100
    })

    if (res.code !== 0) return

    this.setData({
      [`lists.${belongs}[${index}].replies`]: res.data.list.map(item => {
        item.createTime = app.util.formatTime(item.createTime, 'blogComment')
        return item
      })
    })
  },

  openReportBox(e) {
    if (!app.checkLogin()) return
    this.setData({
      reportTargetId: e.currentTarget.dataset.id
    })
  },

  radioChange(e) {
    this.setData({
      selectedReportType: e.detail.value
    })
  },

  cancel() {
    this.setData({
      selectedReportType: 0,
      reportTargetId: '',
      reportDesc: ''
    })
  },

  async confirm(e) {
    const reportType = this.data.reportTypes[this.data.selectedReportType]
    let desc = e.detail.value.desc.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")

    if (reportType.needDesc && !desc) {
      wx.showToast({
        title: '举报原因不能为空',
        image: '/assets/img/discover/xiajia.png'
      })
      return
    } else if (desc.length > 100) {
      wx.showToast({
        title: '举报原因最多100字',
        image: '/assets/img/discover/xiajia.png'
      })
      return
    }

    let res = await app.request.post('/qa/illegal/report', {
      objectId: this.data.reportTargetId,
      objectType: 4,
      illegalType: reportType.val,
      illegalRemark: desc
    })
    if (res.code !== 0) return

    this.cancel()
    wx.showToast({
      title: '举报成功',
      icon: 'none'
    })
  },

  auth() {
    wx.getSetting({
      success: res => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: res => {
              this.toDrawImg()
            },
            fail: err => {
              wx.showModal({
                title: '',
                content: '打开相册权限',
                success: res => {
                  if (res.confirm) {
                    wx.openSetting({
                      success: res => {
                        if (res.authSetting['scope.writePhotosAlbum']) {
                          this.toDrawImg()
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        } else {
          this.toDrawImg()
        }
      }
    })
  },

  toDrawImg() {
    let detail=this.data.detail
    const qaData={
      question: {
        state: detail.questionState,
        reward: detail.rewardAmount,
        userName: detail.nickName,
        userAvatar: detail.userAvatar?detail.userAvatar.replace('http:','https:'):'/assets/img/default/avatar.png',
        tip: '我遇到了一个小难题，谁可以帮我解答一下？',
        content: detail.questionName
      }
    }

    if(this.data.lists.best.length>0){
      const answer=this.data.lists.best[0]
      qaData.answer={
        userName: answer.nickName,
        userAvatar: answer.userAvatar?answer.userAvatar.replace('http:','https:'):'/assets/img/default/avatar.png',
        tip: '我刚帮助解答一个难题，你要不要也来巨牛汇试试？',
        content: answer.content
      }
    }
    
    wx.setStorageSync('qaData', qaData)
    wx.navigateTo({
      url: '/packageQa/pages/drawImg/index'
    })
  },

  download: app.download

}))
