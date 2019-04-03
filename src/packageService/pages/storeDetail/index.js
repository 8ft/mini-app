const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    detail: null
  },

  onShow(){
    this.props.stores.toRefresh.refresh('service_store',async(exist)=>{
      if(this.data.detail===null){
        this.setData({
          detail:wx.getStorageSync('storeInfo')
        })
      }else if(exist){
        this.getDetail()
      }
    })
  },

  getNavHeight (e) {
    const systemInfo=wx.getSystemInfoSync()
    const ratio=systemInfo.windowWidth/750
    this.setData({
      scrollViewHeight:systemInfo.windowHeight-e.detail.height-230*ratio
    })
  },

  async getDetail () {
    let data = await app.request.post('/store/storeBaseInfo/getStoreInfo', {
      storeId: wx.getStorageSync('storeInfo').id
    })
    if (data.code !== 0) return

    this.setData({
      detail: detail
    })
    wx.setStorageSync('storeInfo',detail)
  },

  async collect(){
    if(app.checkLogin()){
      const res = await app.request.post('/store/collectionInfo/collect',{
        businessId:this.data.detail.id,
        type:0
      })
      if(res.code!==0)return

      const collectFlag=this.data.detail.collectFlag===0?1:0
      this.setData({
        'detail.collectFlag':collectFlag,
        'detail.collectNums':this.data.detail.collectNums+=collectFlag?1:-1
      })
      wx.setStorageSync('storeInfo',this.data.detail)
      this.props.stores.toRefresh.updateList('collect')
    }
  },
  
  download:app.download
}))