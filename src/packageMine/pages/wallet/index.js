
const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime

Page({
  data: {
    scrollViewHeight:0,
    wallet:null,
    records:[],
    pageIndex:1,
    nomore:false
  },

  onLoad (options) {
    const systemInfo=wx.getSystemInfoSync()
    wx.createSelectorQuery().select('#baseInfo').fields({
      size: true
    }, res => {
      this.setData({
        navHeight: `${160+systemInfo.statusBarHeight*750/systemInfo.windowWidth}rpx`,
        scrollViewHeight: systemInfo.windowHeight - res.height
      })
    }).exec()
    
    this.getWallet()
    this.getRecords()
  },

  refresh(){
    this.data.pageIndex=1
    this.data.records=[]
    this.data.nomore=false
    this.getRecords()
  },

  async getWallet(){
    let res = await app.request.post('/user/payFund/myPayFund')
    if (res.code !== 0) return
    this.setData({
      wallet: res.data
    })
  },

  async getRecords(){
    if(this.data.nomore)return

    let pageIndex = this.data.pageIndex
    let res = await app.request.post('/order/payOrder/myOrders',{
      pageIndex:pageIndex,
      fundFlag:1
    })
    if (res.code !== 0) return

    let list = res.data.list.map(item => {
      item.createTime = item.createTime.slice(0, -3).replace(/-/g, '.')
      return item
    })

    list=list.filter(item=>{
      return item.orderType!==22
    })

    if (res.data.page === pageIndex){
      this.setData({
        nomore:true,
        records: this.data.records.concat(list)
      })
    }else{
      this.setData({
        pageIndex: pageIndex+1,
        records: this.data.records.concat(list)
      })
    }
  },

  download: app.download
})