const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    tabIndex: 0,
    banners: null,
    hasNew: 0,
    activeFilter: '',

    //博客
    types: [],
    blogs: {
      list: [],
      pageIndex: 1,
      nomore: false
    },

    //问答
    qa: {
      list: [],
      pageIndex: 1,
      nomore: false
    },
    qa_sortWay: {
      selected: { text: '默认排序', value: '' },
      list: [
        { text: '默认排序', value: '' },
        { text: '时间优先', value: '1' },
        { text: '价格优先', value: '2' }
      ]
    },
    qa_types: {
      parent: '',
      selected: {},
      list: []
    },
    qa_priceIn: {
      selected: { text: '不限', value: '' },
      list: [
        { text: '不限', value: '' },
        { text: '5-20元', value: '1' },
        { text: '50-100元', value: '2' },
        { text: '200-300元', value: '3' }
      ]
    },
    qa_status: {
      selected: { text: '不限', value: '' },
      list: [
        { text: '不限', value: '' },
        { text: '未解决', value: '0' },
        { text: '已解决', value: '1' }
      ]
    },


    //人才库
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

    //服务
    services: {
      list: [],
      pageIndex: 1,
      nomore: false
    },
    service_sortWay: {
      selected: { text: '默认排序', value: '' },
      list: [
        { text: '默认排序', value: '' },
        { text: '价格从高到低', value: '5' },
        { text: '价格从低到高', value: '4' },
        { text: '成交量优先', value: '1' },
      ]
    },
    service_types: {
      parent: '',
      selected: {},
      list: []
    },

    loading:true
  },

  onLoad(options) {
    if (options.page) {
      this.switchPage(parseInt(options.page))
    } else {
      this.setData({
        tabIndex: 0
      })
    }
  },

  onShow() {
    if (this.data.pageIndex === 0) {
      this.getMyAttentionStats()
    }

    this.props.stores.toRefresh.refresh('discover', exist => {
      if (this.data.banners === null) {
        this.getBanner()
        this.getBlogTypes()
        this.getBlogs()
      } else if (exist) {
        this.refresh()
      }
    })
  },

  getNavHeight(e) {
    const systemInfo = wx.getSystemInfoSync()
    const ratio = systemInfo.windowWidth / 750
    const scrollViewHeight = systemInfo.windowHeight - e.detail.height
    this.setData({
      scrollViewHeight: scrollViewHeight,
      allServicesScrollViewHeight: scrollViewHeight - 80 * ratio
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

    if (index === 1 && this.data.qa_types.list.length===0) {
      this.getQa()
    } else if (index === 2 && !this.data.cities) {
      this.getFilter()
      this.getExperts()
    } else if (index === 3 && this.data.services.list.length === 0) {
      this.getServiceTypes()
      this.getServices()
    }
  },

  loadMore() {
    if (this.data.tabIndex === 0) {
      this.getBlogs()
    } else if (this.data.tabIndex === 1) {
      this.getQa()
    } else if (this.data.tabIndex === 2) {
      this.getExperts()
    } else if (this.data.tabIndex === 3) {
      this.getServices()
    }
  },

  refresh() {
    switch (this.data.tabIndex) {
      case 0:
        this.data.blogs = {
          list: [],
          pageIndex: 1,
          nomore: false
        }
        this.getBanner()
        this.getMyAttentionStats()
        this.getBlogs()
        break;
      case 1:
        this.data.qa = {
          list: [],
          pageIndex: 1,
          nomore: false
        }
        this.getQa()
        break;
      case 2:
        this.data.experts = {
          list: [],
          pageIndex: 1,
          nomore: false
        }
        this.getExperts()
        break;
      case 3:
        this.data.services = {
          list: [],
          pageIndex: 1,
          nomore: false
        }
        this.getServices()
        break;
    }
  },

  async getBanner() {
    let res = await app.request.post('/blog/carouselConfig/getList')
    if (res.code === 0) {
      this.setData({
        banners: res.data.list
      })
    }
  },

  async getBlogTypes() {
    let res = await app.request.post('/blog/category/getAvailableList', {
      scope: 1
    })
    if (res.code === 0) {
      this.setData({
        types: res.data.splice(1)
      })
    }
  },

  async getMyAttentionStats() {
    if (!this.props.stores.account.logged_in) return
    let res = await app.request.post('/blog/attentionInfo/myAttentionStats', {}, false, true)
    if (res.code === 0) {
      this.setData({
        hasNew: res.data.articleNews
      })
    }
  },

  async getBlogs() {
    let nomore = this.data.blogs.nomore
    if (nomore) return

    let pIndex = this.data.blogs.pageIndex
    let res = await app.request.post('/blog/article/getList', {
      queryType: 1,
      articleType: 1,
      categoryId: 1,
      pageIndex: pIndex,
      pageSize: 10
    }, true)

    if (res.code === 0) {
      if (res.data.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      this.setData({
        'blogs.list': this.data.blogs.list.concat(res.data.list.map(blog => {
          if (blog.articleBrief.length > 50) {
            blog.articleBrief = blog.articleBrief.substring(0, 50) + '...'
          }
          blog.createTime = app.util.formatTime(blog.createTime, 'blogCard')
          return blog
        })),
        'blogs.pageIndex': pIndex,
        'blogs.nomore': nomore
      })
    }
    wx.stopPullDownRefresh()
  },

  async getQa() {
    const data = this.data
    let nomore = data.qa.nomore
    if (nomore) return

    this.setData({
      loading:true
    })

    let pIndex = data.qa.pageIndex
    let res = await app.request.post('/qa/question/query/list', {
      queryType:1,
      questionState:'11|12',
      sortBy: data.qa_sortWay.selected.value || '',
      stateCond: data.qa_status.selected.value || '',
      subType: data.qa_types.selected.dictValue || '',
      rewardCond: data.qa_priceIn.selected.value || '',
      pageIndex: pIndex
    })

    if (res.code === 0) {
      if (res.data.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      let newData={
        'qa.list': data.qa.list.concat(res.data.list.map((qa) => {
          if(qa.skillTag){
            qa.skillTag = qa.skillTag.split('|')
          }
          return qa
        })),
        'qa.pageIndex': pIndex,
        'qa.nomore': nomore,
        loading:false
      }
      
      if(data.qa_types.list.length===0){
        const qa_types = await app.request.post('/dict/dictCommon/getDicts', {
          dictType: 'project_type',
          resultType: '1'
        })
        newData['qa_types.list']=qa_types.data.data[0].dictList
      }

      this.setData(newData)
    }
    wx.stopPullDownRefresh()
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
    wx.stopPullDownRefresh()
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
      case 'qa_sortWay':
        this.setData({
          'qa_sortWay.selected': data.item
        })
        break;
      case 'qa_types':
        this.setData({
          'qa_types.selected': data.item
        })
        break;
      case 'qa_priceIn':
        this.setData({
          'qa_priceIn.selected': data.item
        })
        break;
      case 'qa_status':
        this.setData({
          'qa_status.selected': data.item
        })
        break;


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


      case 'service_types':
        this.setData({
          'service_types.selected': data.item
        })
        break;
      case 'service_sortWay':
        this.setData({
          'service_sortWay.selected': data.item
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

  scrollToQaTypes(e) {
    this.setData({
      'qa_types.parent': 'qa' + e.currentTarget.dataset.code
    })
  },

  updateExpert(e) {
    this.setData({
      [`experts.list[${e.detail.index}].followFlag`]: e.detail.flag
    })
  },

  bannerJump(e) {
    app.bannerJump(e)
  },

  async getServiceTypes() {
    let res = await app.request.post('/dict/dictCommon/getDicts', {
      dictType: 'product_type',
      resultType: '1'
    })

    if (res.code === 0) {
      this.setData({
        'service_types.list': res.data.data[0].dictList
      })
    }
  },

  scrollToServiceTypes(e) {
    this.setData({
      'service_types.parent': 'service' + e.currentTarget.dataset.code
    })
  },

  async getServices() {
    let nomore = this.data.services.nomore
    if (nomore) return

    let pIndex = this.data.services.pageIndex
    let res = await app.request.post('/store/productBaseInfo/getList', {
      pageIndex: pIndex,
      productSubtype: this.data.service_types.selected.dictValue || '',
      sortType: this.data.service_sortWay.selected.value
    })

    if (res.code === 0) {
      if (res.data.pageData.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      this.setData({
        'services.list': this.data.services.list.concat(res.data.pageData.list.map(service => {
          if (service.productName.length > 30) {
            service.productName = service.productName.substring(0, 30) + '...'
          }
          return service
        })),
        'services.pageIndex': pIndex,
        'services.nomore': nomore
      })
    }
    wx.stopPullDownRefresh()
  },

  hideIntroduce(){
    this.setData({
      hideIntroduce:true
    })
  }

}))



