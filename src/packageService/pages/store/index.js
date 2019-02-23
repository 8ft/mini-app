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
    this.getDetail()
  },

  getNavHeight: function (e) {
    const systemInfo=wx.getSystemInfoSync()
    this.setData({
      swiperHeight:systemInfo.windowHeight-e.detail.height-150*systemInfo.windowWidth/750
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
        'detail.collectFlag':this.data.detail.collectFlag==='0'?'1':'0'
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
      sortType:isPage2?'1':'2'
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