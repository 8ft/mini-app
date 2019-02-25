const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    tabIndex: 0,
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
      nomore: false
    },
    latest:{
      list: [],
      pageIndex: 1,
      nomore: false
    }
  },

  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    this.getServiceTypes()
  },

  onShow:function(){
    this.props.stores.toRefresh.refresh('service-store',async(exist)=>{
      if(this.data.detail===null||exist){
        this.getDetail()
      }
    })
  },

  getNavHeight: function (e) {
    const systemInfo=wx.getSystemInfoSync()
    const ratio=systemInfo.windowWidth/750
    const scrollViewHeight=systemInfo.windowHeight-e.detail.height-150*ratio
    this.setData({
      scrollViewHeight:scrollViewHeight,
      allServicesScrollViewHeight:scrollViewHeight-80*ratio
    })
  },

  tabChange:function(e){
    this.switchPage(e.detail.index)
  },

  onSwiperChange:function(e){
    this.switchPage(e.detail.current)
  },

  switchPage:function(index){
    if(index===this.data.tabIndex)return
    this.setData({
      tabIndex:index
    })
    if((index===1&&this.data.services.list.length===0)||(index===2&&this.data.latest.list.length===0)){
      this.getServices()
    }
  },

  getDetail: async function () {
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

    this.setData({
      isMyself: isMyself,
      loading: false,
      detail: detail
    })
  },

  collect:async function(){
    if(app.checkLogin()){
      const res = await app.request.post('/store/collectionInfo/collect',{
        businessId:this.data.id,
        type:0
      })
      if(res.code!==0)return
      this.setData({
        'detail.collectFlag':this.data.detail.collectFlag==0?1:0
      })
    }
  },

  filter: function (e) {
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
          nomore: false
        }
        break;
    }
    
    this.getServices()
    this.setData({
      activeFilter: ''
    })
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

  scrollToServiceTypes: function (e) {
    this.setData({
      'serviceTypes.parent': 'service' + e.currentTarget.dataset.code
    })
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

  getServices: async function () {
    const isPage2=this.data.tabIndex===1
    let data =isPage2?this.data.services:this.data.latest
    let nomore = data.nomore
    if (nomore) return
    this.setData({
      loading: true
    })

    let pIndex = data.pageIndex
    let res = await app.request.post('/store/productBaseInfo/getList', {
      pageIndex: pIndex,
      storeId: this.data.id,
      sortType:isPage2?'1':'2',
      productSubtype:this.data.serviceTypes.selected.dictValue || ''
    })

    if (res.code === 0) {
      if (res.data.pageData.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      if(isPage2){
        this.setData({
          'services.list': this.data.services.list.concat(res.data.pageData.list.map(service => {
            if (service.productName.length > 16) {
              service.productName = service.productName.substring(0,16) + '...'
            }
            return service
          })),
          'services.pageIndex': pIndex,
          'services.nomore': nomore,
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
  
  download:app.download
}))