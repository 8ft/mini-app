const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    swiperHeight: 0,
    tabIndex: 0,

    pageSize: 10,
    loading: true,
    myPublish: {
      states: [
        {
          dictName: '全部',
          dictValue: ''
        },
        {
          dictName: '待审核',
          dictValue: '1'
        },
        {
          dictName: '审核未通过',
          dictValue: '3'
        },
        {
          dictName: '招募中',
          dictValue: '2|5|6|7'
        },
        {
          dictName: '执行中',
          dictValue: '8'
        },
        {
          dictName: '待验收',
          dictValue: '10|14'
        },
        {
          dictName: '已完成',
          dictValue: '11'
        },
        {
          dictName: '已关闭',
          dictValue: '12|23|33'
        },
        {
          dictName: '已下架',
          dictValue: '13'
        }
      ],
      currentState: 0,
      projects: [],
      pageIndex: 1,
      nomore: false
    },

    myApply: {
      states: [
        {
          dictName: '全部',
          dictValue: ''
        },
        {
          dictName: '申请中',
          dictValue: '4|5'
        },
        {
          dictName: '未通过',
          dictValue: '9|12|13'
        }
      ],
      currentState: 0,
      projects: [],
      pageIndex: 1,
      nomore: false
    }
  },

  onShow() {
    this.props.stores.toRefresh.refresh('work', (exist) => {
      if (this.data.swiperHeight === 0) {
        this.getMyPublish()
      } else if (exist) {
        this.refresh()
      }
    })
  },

  refresh() {
    if (this.data.tabIndex === 0) {
      this.data.myPublish.pageIndex = 1
      this.data.myPublish.nomore = false
      this.data.myPublish.projects = []
      this.getMyPublish()
    } else {
      this.data.myApply.pageIndex = 1
      this.data.myApply.nomore = false
      this.data.myApply.projects = []
      this.getMyApply()
    }
  },

  getNavHeight(e) {
    const systemInfo = wx.getSystemInfoSync()
    const ratio = systemInfo.windowWidth / 750
    const swiperHeight = systemInfo.windowHeight - e.detail.height
    this.setData({
      swiperHeight: swiperHeight,
      scrollViewHeight: swiperHeight - 80 * ratio
    })
  },

  tabChange(e) {
    this.switchPage(e.detail.index)
  },

  onSwiperChange(e) {
    this.switchPage(e.detail.current)
  },

  switchPage(index) {
    if (index === this.data.tabIndex) return
    this.setData({
      tabIndex: index
    })

    if (index === 0 && this.data.myPublish.projects.length === 0) {
      this.getMyPublish()
    } else if (index === 1 && this.data.myApply.projects.length === 0) {
      this.getMyApply()
    }
  },

  switchState(e) {
    const index = e.currentTarget.dataset.index
    if (this.data.tabIndex === 0) {
      this.setData({
        'myPublish.currentState': index,
      })
    } else {
      this.setData({
        'myApply.currentState': index
      })
    }
    this.refresh()
  },

  async getMyPublish() {
    let myPublish = this.data.myPublish
    if (myPublish.nomore || !this.props.stores.account.logged_in) return

    this.setData({
      loading: true
    })
    let res = await app.request.post('/project/projectInfo/myProjectList', {
      relationType: '1|3',
      projectState: myPublish.states[myPublish.currentState].dictValue,
      pageIndex: myPublish.pageIndex,
      pageSize: this.data.pageSize
    })
    if (res.code !== 0) return

    if (res.data.count > myPublish.pageIndex * this.data.pageSize) {
      myPublish.pageIndex++
    } else {
      myPublish.nomore = true
    }

    this.setData({
      'myPublish.pageIndex': myPublish.pageIndex,
      'myPublish.projects': myPublish.projects.concat(res.data.list.map(project => {
        project.createTime = project.createTime.split(' ')[0].replace(/-/g, '.')
        if (project.projectSkill) {
          project.projectSkill = project.projectSkill.split('|')
        }
        return project
      })),
      'myPublish.nomore': myPublish.nomore,
      loading: false
    })
  },

  async getMyApply() {
    let myApply = this.data.myApply
    if (myApply.nomore || !this.props.stores.account.logged_in) return
    this.setData({
      loading: true
    })
    let res = await app.request.post('/project/projectInfo/myProjectList', {
      relationType: 2,
      projectState: myApply.states[myApply.currentState].dictValue,
      pageIndex: myApply.pageIndex,
      pageSize: this.data.pageSize
    })
    if (res.code !== 0) {
      this.setData({ loading: true })
      return
    }

    if (res.data.count > myApply.pageIndex * this.data.pageSize) {
      myApply.pageIndex++
    } else {
      this.setData({
        'myApply.nomore': true
      })
    }

    this.setData({
      'myApply.pageIndex': myApply.pageIndex,
      'myApply.projects': myApply.projects.concat(res.data.list.map(project => {
        project.createTime = project.createTime.split(' ')[0].replace(/-/g, '.')
        if (project.projectSkill) {
          project.projectSkill = project.projectSkill.split('|')
        }
        return project
      })),
      loading: false
    })
  }

}))