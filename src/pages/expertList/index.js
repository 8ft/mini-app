const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime


Page({
  data: {
    activeFilter: '',

    experts: {
      list: [],
      pageIndex: 1,
      nomore: false
    },
    sortWay: {
      selected: {},
      list: []
    },
    job_types: {
      parent: '',
      selected: {},
      list: []
    },
    exp: {
      selected: {},
      list: []
    },
    selectedCity: {},
    cities: null,

    loading:true
  },

  onLoad(options) {
    this.getFilter()
    this.getExperts()
  },

  onPullDownRefresh () {
    this.refresh()
  },

  onReachBottom () {
    this.getExperts()
  },

  getNavHeight(e) {
    const systemInfo = wx.getSystemInfoSync()
    const ratio = systemInfo.windowWidth / 750
    this.setData({
      navHeight:e.detail.height,
      popupTop:`${e.detail.height+80*ratio}px`
    })
  },

  refresh() {
    this.data.experts = {
      list: [],
      pageIndex: 1,
      nomore: false
    }
    this.getExperts()
  },

  async getExperts() {
    const data = this.data
    let nomore = data.experts.nomore
    if (nomore) return

    let pIndex = data.experts.pageIndex
    let res = await app.request.post('/user/talent/searchTalents', {
      positionType: data.job_types.selected.dictValue || '',
      workExperience: data.exp.selected.value || '',
      city: data.selectedCity.zoneCode || '',
      sortField: data.sortWay.selected.value || '',
      pageIndex: pIndex
    })

    if (res.code === 0) {
      if (res.data.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      this.setData({
        'experts.list': data.experts.list.concat(res.data.list),
        'experts.pageIndex': pIndex,
        'experts.nomore': nomore
      })
    }
    
  },

  selectFilter(e) {
    if (this.data.activeFilter) {
      this.setData({
        activeFilter: ''
      })
    } else {
      this.setData({
        activeFilter: e.currentTarget.dataset.name
      })
    }
  },

  closePopup() {
    this.setData({
      activeFilter: ''
    })
  },

  filter(e) {
    let data = e.currentTarget.dataset
    switch (data.type) {
      case 'sortWay':
        this.setData({
          'sortWay.selected': data.item
        })
        break;
      case 'exp':
        this.setData({
          'exp.selected': data.item
        })
        break;
      case 'job_types':
        this.setData({
          'job_types.selected': data.item
        })
        break;
    }

    this.refresh()
    this.closePopup()
  },

  selectCity(e) {
    this.setData({
      selectedCity: e.detail.city
    })
    this.refresh()
    this.closePopup()
  },

  async getFilter() {
    let res = await app.request.post('/user/talent/searchCondition')
    let cities = await app.request.post('/dict/dictZone/talentAreaList')
    let job_types = await app.request.post('/dict/dictCommon/getDicts', {
      dictType: 'job_type',
      resultType: '1'
    })

    if (res.code === 0 && cities.code === 0 && job_types.code === 0) {
      this.setData({
        'sortWay.list': res.data.sortFieldOptions,
        'sortWay.selected': res.data.sortFieldOptions[0],
        'job_types.list': job_types.data.data[0].dictList,
        'exp.list': this.data.exp.list.concat(res.data.workExperienceOptions),
        cities: cities.data.data
      })
    }
  },

  scrollToJobTypes(e) {
    this.setData({
      'job_types.parent': 'job' + e.currentTarget.dataset.code
    })
  },

  updateExpert(e) {
    this.setData({
      [`experts.list[${e.detail.index}].followFlag`]: e.detail.flag
    })
  }

})



