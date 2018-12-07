const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer;

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    id:'',
    detail:null,
    comments:[]
  },

  onLoad:function(options){
    this.setData({
      id:options.id
    })
  },

  onShow:function(){
   this.getDetail()
  },

  onShareAppMessage: function () {
    return {
      title: '接包发包专业平台',
      path: 'pages/project/index/index',
      imageUrl:'/assets/img/share.png'
    }
  },

  getDetail: async function () {
    let detail = await app.request.post('/blog/article/detail',{
      articleId:this.data.id,
      comments:1
    })
    if (detail.code !== 0) return

    detail.data.createTime=detail.data.createTime.split(' ')[0]
    detail.data.articleTags=detail.data.articleTags.split('|')
    this.setData({
      detail:detail.data,
      comments:detail.data.comments.list
    })
    
  }

}))
