const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer;

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    blogInfo:null
  },

  onShow:function(){
    console.log(this.props.stores.account)
    
  },

  onShareAppMessage: function () {
    return {
      title: '接包发包专业平台',
      path: 'pages/project/index/index',
      imageUrl:'/assets/img/share.png'
    }
  },

  go:function(e){
    if (!app.checkLogin()) return 
    wx.navigateTo({
      url: e.currentTarget.dataset.url
    })
  },

  getInfo: async function () {
    let blogInfo=await app.request.post('/blog/attentionInfo/queryBlogUserInfo',{
      userId:baseInfo.data.userId
    })
    if (blogInfo.code !== 0) return

    this.setData({
      blogInfo:blogInfo.data
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
