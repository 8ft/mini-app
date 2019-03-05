const app = getApp()
const regeneratorRuntime = require('../../libs/regenerator-runtime.js')
const observer = require('../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    banners: null,
    hasNew: 0,
    types: [],

    blogs: {
      list: [],
      pageIndex: 1,
      nomore: false
    },

    activeFilter: '',
    sortWay: {
      selected: {},
      list: []
    },
    jobTypes: {
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

    experts: {
      list: [],
      pageIndex: 1,
      nomore: false
    },

    services: {
      list: [],
      pageIndex: 1,
      nomore: false
    },
    service_sortWay: {
      selected:{text:'默认排序',value:''},
      list: [
        {text:'默认排序',value:''},
        {text:'价格从高到低',value:'5'},
        {text:'价格从低到高',value:'4'},
        {text:'成交量优先',value:'1'},
      ]
    },
    serviceTypes: {
      parent: '',
      selected: {},
      list: []
    }
  },

  onLoad:function(options){
    if(options.page){
      this.switchPage({detail:{index:options.page}})
    }
  },

  onShow: function () {
    if (this.data.pageIndex === 0) {
      this.getMyAttentionStats()
    }

    this.props.stores.toRefresh.refresh('discover', exist => {
      if (this.data.banners === null) {
        const systemInfo=wx.getSystemInfoSync()
        const navHeight = 100 + systemInfo.statusBarHeight * 750 / systemInfo.windowWidth
        this.setData({
          navHeight: `${navHeight}rpx`,
          popupTop: `${navHeight + 80}rpx`
        })

        this.getBanner()
        this.getBlogTypes()
        this.getBlogs()
      } else if (exist) {
        this.refresh()
      }
    })
  },

  onPullDownRefresh: function () {
    this.refresh()
  },

  onReachBottom: function () {
    if (this.data.pageIndex === 0) {
      this.getBlogs()
    } else if (this.data.pageIndex === 1) {
      this.getExperts()
    } else {
      this.getServices()
    }
  },

  switchPage: function (e) {
    const pageIndex =e.detail.index

    if (pageIndex === 1 && !this.data.cities) {
      this.getFilter()
      this.getExperts()
    } else if (pageIndex === 2 && this.data.services.list.length === 0) {
      this.getServiceTypes()
      this.getServices()
    }

    this.setData({
      pageIndex: pageIndex
    })
  },

  refresh: function () {
    switch (this.data.pageIndex) {
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
        this.data.experts = {
          list: [],
          pageIndex: 1,
          nomore: false
        }
        this.getExperts()
        break;
      case 2:
        this.data.services = {
          list: [],
          pageIndex: 1,
          nomore: false
        }
        this.getServices()
        break;
    }
  },

  getBanner: async function () {
    let res = await app.request.post('/blog/carouselConfig/getList')
    if (res.code === 0) {
      this.setData({
        banners: res.data.list
      })
    }
  },

  getBlogTypes: async function () {
    let res = await app.request.post('/blog/category/getAvailableList', {
      scope: 1
    })
    if (res.code === 0) {
      this.setData({
        types: res.data.splice(1)
      })
    }
  },

  getMyAttentionStats: async function () {
    if (!this.props.stores.account.logged_in) return
    let res = await app.request.post('/blog/attentionInfo/myAttentionStats', {}, false, true)
    if (res.code === 0) {
      this.setData({
        hasNew: res.data.articleNews
      })
    }
  },

  getBlogs: async function () {
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
          if (blog.articleBrief.length > 76) {
            blog.articleBrief = blog.articleBrief.substring(0, 76) + '...'
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

  getExperts: async function () {
    const data = this.data
    let nomore = data.experts.nomore
    if (nomore) return

    let pIndex = data.experts.pageIndex
    let res = await app.request.post('/user/talent/searchTalents', {
      positionType: data.jobTypes.selected.dictValue || '',
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

  selectFilter: function (e) {
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

  closePopup: function () {
    this.setData({
      activeFilter: ''
    })
  },

  filter: function (e) {
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
      case 'jobTypes':
        this.setData({
          'jobTypes.selected': data.item
        })
        break;
      case 'serviceTypes':
        this.setData({
          'serviceTypes.selected': data.item
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

  selectCity: function (e) {
    this.setData({
      selectedCity: e.detail.city
    })
    this.refresh()
    this.closePopup()
  },

  getFilter: async function () {
    let res = await app.request.post('/user/talent/searchCondition')
    let cities = await app.request.post('/dict/dictZone/talentAreaList')
    let jobTypes = await app.request.post('/dict/dictCommon/getDicts', {
      dictType: 'job_type',
      resultType: '1'
    })

    if (res.code === 0 && cities.code === 0 && jobTypes.code === 0) {
      this.setData({
        'sortWay.list': res.data.sortFieldOptions,
        'sortWay.selected': res.data.sortFieldOptions[0],
        'jobTypes.list': jobTypes.data.data[0].dictList,
        'exp.list': this.data.exp.list.concat(res.data.workExperienceOptions),
        cities: cities.data.data
      })
    }
  },

  scrollToJobTypes: function (e) {
    this.setData({
      'jobTypes.parent': 'job' + e.currentTarget.dataset.code
    })
  },

  updateExpert: function (e) {
    this.setData({
      [`experts.list[${e.detail.index}].followFlag`]: e.detail.flag
    })
  },

  bannerJump: function (e) {
    app.bannerJump(e)
  },

  getServiceTypes:async function () {
    let res = await app.request.post('/dict/dictCommon/getDicts', {
      dictType: 'product_type',
      resultType: '1'
    })

    if (res.code === 0) {
      this.setData({
        'serviceTypes.list': res.data.data[0].dictList
      })
    }
  },

  scrollToServiceTypes: function (e) {
    this.setData({
      'serviceTypes.parent': 'service' + e.currentTarget.dataset.code
    })
  },

  getServices: async function () {
    let nomore = this.data.services.nomore
    if (nomore) return

    let pIndex = this.data.services.pageIndex
    let res = await app.request.post('/store/productBaseInfo/getList', {
      pageIndex: pIndex,
      productSubtype:this.data.serviceTypes.selected.dictValue || '',
      sortType:this.data.service_sortWay.selected.value
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
  }

}))


