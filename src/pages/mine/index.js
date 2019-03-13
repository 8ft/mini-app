const app = getApp()
const regeneratorRuntime = require('../../libs/regenerator-runtime.js')
const observer = require('../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    sex:''
  },

  onShareAppMessage () {
    return {
      title: '接包发包专业平台',
      path: 'pages/tabBar/project/index',
      imageUrl:'/assets/img/share.png'
    }
  },

  onPullDownRefresh(){
    this.props.stores.account.refresh()
  },

  onShow(){
    if(!this.props.stores.account.userInfo)return
    const sex=this.props.stores.account.userInfo.userBaseInfo.sex
    if(this.data.sex!=sex){
      this.setData({
        sex:sex
      })
    }
  },

  go(e){
    if (!app.checkLogin()) return 
    const url=e.currentTarget.dataset.url
    if(url!==undefined){
      wx.navigateTo({
        url: e.currentTarget.dataset.url
      })
    }else{
      app.download()
    }
  },

  logout(){
    wx.showModal({
      title: '提示',
      content: '确定要退出吗',
      success: async res => {
        if (res.confirm) {
            this.props.stores.account.logout(app)
        }
      }
    })
  }
}))
