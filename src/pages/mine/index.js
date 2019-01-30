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

  onShareAppMessage: function () {
    return {
      title: '接包发包专业平台',
      path: 'pages/tabBar/project/index',
      imageUrl:'/assets/img/share.png'
    }
  },

  onPullDownRefresh:function(){
    this.props.stores.account.refresh()
  },

  onShow:function(){
    if(!this.props.stores.account.userInfo)return
    const sex=this.props.stores.account.userInfo.userBaseInfo.sex
    if(this.data.sex!=sex){
      this.setData({
        sex:sex
      })
    }
  },

  go:function(e){
    if (!app.checkLogin()) return 
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  },

  logout:function(){
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
