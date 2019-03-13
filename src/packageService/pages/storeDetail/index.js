const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    id: '',
    isMyself: false,
    detail: null
  },

  onLoad (options) {
    this.setData({
      id: options.id
    })
    this.getDetail()
  },

  getNavHeight (e) {
    const systemInfo=wx.getSystemInfoSync()
    const ratio=systemInfo.windowWidth/750
    this.setData({
      scrollViewHeight:systemInfo.windowHeight-e.detail.height-230*ratio
    })
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

    this.setData({
      isMyself: isMyself,
      loading: false,
      detail: detail
    })
  },

  async collect(){
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
  
  download:app.download
}))