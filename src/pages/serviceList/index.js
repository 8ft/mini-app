const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime


Page({
  data: {
    activeFilter: '',

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
    this.getServiceTypes()
    this.getServices()
  },

  onPullDownRefresh () {
    this.refresh()
  },

  onReachBottom () {
    this.getServices()
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
    this.data.services = {
      list: [],
      pageIndex: 1,
      nomore: false
    }
    this.getServices()
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
    
  }

})



