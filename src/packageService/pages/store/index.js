const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

const priceSortWays={
  'default':{val:1,next:'asc'},
  'asc':{val:4,next:'desc'},
  'desc':{val:5,next:'default'},
}

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    tabIndex:0,
    isMyself: false,

    id: '',
    detail: null,
    loading: false,

    activeFilter: '',
    serviceTypes: {
      parent: '',
      selected: {},
      list: []
    },

    services: {
      list: [],
      pageIndex: 1,
      nomore: false,
      sort:'default'
    },
    latest:{
      list: [],
      pageIndex: 1,
      nomore: false
    }
  },

  onLoad (options) {
    this.setData({
      id: options.id
    })
    this.getServiceTypes()
  },

  onShow(){
    this.props.stores.toRefresh.refresh('service_store',async(exist)=>{
      if(this.data.detail===null||exist){
        wx.removeStorageSync('storeInfo')
        this.getDetail()
      }
    })

    const storeInfo=wx.getStorageSync('storeInfo')
    if(storeInfo&&storeInfo.collectFlag!==this.data.detail.collectFlag){
      this.setData({
        'detail.collectFlag':storeInfo.collectFlag,
        'detail.collectNums':storeInfo.collectNums
      })
    }
  },

  onUnload(){
    wx.removeStorageSync('storeInfo')
  },

  getNavHeight (e) {
    const systemInfo=wx.getSystemInfoSync()
    const ratio=systemInfo.windowWidth/750
    const scrollViewHeight=systemInfo.windowHeight-e.detail.height-150*ratio
    this.setData({
      scrollViewHeight:scrollViewHeight,
      allServicesScrollViewHeight:scrollViewHeight-80*ratio
    })
  },

  tabChange(e){
    this.switchPage(e.detail.index)
  },

  onSwiperChange(e){
    this.switchPage(e.detail.current)
  },

  switchPage(index){
    if(index===this.data.tabIndex)return
    this.setData({
      tabIndex:index
    })
    if((index===this.data.indexOf_pageAll&&this.data.services.list.length===0)||(index===this.data.indexOf_pageLatest&&this.data.latest.list.length===0)){
      this.getServices()
    }
  },

  async getDetail () {
    this.setData({ loading: true })

    let data = await app.request.post('/store/storeBaseInfo/getStoreInfo', {
      storeId: this.data.id
    })
    if (data.code !== 0) return

    let isMyself = false
    let detail = data.data.storeInfo
    if (this.props.stores.account.logged_in) {
      isMyself = this.props.stores.account.userInfo.userId === detail.userId
    }

    const hasHomePage=detail.homepage?0:1
    this.setData({
      isMyself: isMyself,
      loading: false,
      detail: detail,
      hasHomePage:hasHomePage,
      indexOf_pageAll:1-hasHomePage,
      indexOf_pageLatest:2-hasHomePage
    })

    if(hasHomePage===1){
      this.getServices()
    }
  },

  async collect(){
    if(app.checkLogin()){
      const res = await app.request.post('/store/collectionInfo/collect',{
        businessId:this.data.id,
        type:0
      })
      if(res.code!==0)return

      const collectFlag=this.data.detail.collectFlag===0?1:0
      this.setData({
        'detail.collectFlag':collectFlag,
        'detail.collectNums':this.data.detail.collectNums+=collectFlag?1:-1
      })
      this.props.stores.toRefresh.updateList('collect')
    }
  },

  filter (e) {
    let data = e.currentTarget.dataset
    switch (data.type) {
      case 'sortWay':
        this.setData({
          'sortWay.selected': data.item
        })
        break;
      case 'serviceTypes':
        this.setData({
          'serviceTypes.selected': data.item
        })
        this.data.services = {
          list: [],
          pageIndex: 1,
          nomore: false,
          sort:'default'
        }
        break;
    }
    
    this.getServices()
    this.setData({
      activeFilter: ''
    })
  },

  selectFilter (e) {
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

  sortServicesByPrice(){
    this.setData({
      'services.sort':priceSortWays[this.data.services.sort].next
    })
    this.data.services = {
      list: [],
      pageIndex: 1,
      nomore: false,
      sort:this.data.services.sort
    }
    this.getServices()
  },

  scrollToServiceTypes (e) {
    this.setData({
      'serviceTypes.parent': 'service' + e.currentTarget.dataset.code
    })
  },

  async getServiceTypes () {
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

  async getServices () {
    const isPageServices=this.data.tabIndex===this.data.indexOf_pageAll
    let data =isPageServices?this.data.services:this.data.latest
    let nomore = data.nomore
    if (nomore) return
    this.setData({
      loading: true
    })

    let pIndex = data.pageIndex
    let res = await app.request.post('/store/productBaseInfo/getList', {
      pageIndex: pIndex,
      storeId: this.data.id,
      sortType:isPageServices?priceSortWays[data.sort].val:3,
      productSubtype:this.data.serviceTypes.selected.dictValue || ''
    })

    if (res.code === 0) {
      if (res.data.pageData.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      if(isPageServices){
        this.setData({
          'services.list': this.data.services.list.concat(res.data.pageData.list.map(service => {
            if (service.productName.length > 16) {
              service.productName = service.productName.substring(0,16) + '...'
            }
            return service
          })),
          'services.pageIndex': pIndex,
          'services.nomore': nomore,
          'services.sort':data.sort,
          loading: false
        })
      }else{
        this.setData({
          'latest.list': this.data.latest.list.concat(res.data.pageData.list.map(service => {
            if (service.productName.length > 16) {
              service.productName = service.productName.substring(0,16) + '...'
            }
            return service
          })),
          'latest.pageIndex': pIndex,
          'latest.nomore': nomore,
          loading: false
        })
      }
    }
    wx.stopPullDownRefresh()
  },

  jump(){
    wx.setStorageSync('storeInfo',this.data.detail)
    wx.navigateTo({
      url:'/packageService/pages/storeDetail/index'
    })
  },
  
  download:app.download
}))