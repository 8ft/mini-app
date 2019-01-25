const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    typeIndex:0,

    experts:{
      list:[],
      pageIndex:1,
      nomore:false
    },

    articles:{
      list:[],
      pageIndex:1,
      nomore:false
    },

    loading:true
   },
 
  onLoad:function(options){
    this.getExperts()
   },

  onShow:function(){
    if(this.data.typeIndex!==1)return
    const articleAmount=this.data.articles.amount
    const latest_articleAmount=this.props.stores.account.blogInfo.favoriteNum
    
    if(articleAmount&&articleAmount!==latest_articleAmount){
      this.setData({
        'articles.amount':latest_articleAmount,
        'articles.pageIndex': 1,
        'articles.nomore': false,
        'articles.list': []
      })
      this.getArticles()
    }
  },

  onPullDownRefresh:function(){
    this.refresh()
  },

  onReachBottom:function(){
    switch(this.data.typeIndex){
      case 0:
        this.getExperts()
      break;
      case 1:
        this.getArticles()
      break;
    }
  },

  refresh:function(){
    switch(this.data.typeIndex){
      case 0:
        if(this.data.experts.list.length>0){
          this.setData({
            experts:{
              list:[],
              pageIndex:1,
              nomore:false
            }
          })
        }
        this.getExperts()
      break;
      case 1:
        if(this.data.articles.list.length>0){
          this.setData({
            articles:{
              list:[],
              pageIndex:1,
              nomore:false
            }
          })
        }
        this.getArticles()
      break;
    }
  },

  switchList: function(e){
    const index = e.detail.index
    if(index===1&&this.data.articles.list.length===0&&this.props.stores.account.blogInfo.favoriteNum>0){
      this.getArticles()
    }
    this.setData({
      typeIndex: index
    })
  },

  updateExpert:function(e){
    const data=e.detail
    if(data.remark!==undefined){
      this.setData({
        [`experts.list[${data.index}].talentRemark`]:data.remark
      })
    }else{
      this.setData({
        [`experts.list[${data.index}].followFlag`]:data.flag
      })
      if(data.flag===0){
        this.setData({
          [`experts.list[${data.index}].talentRemark`]:''
        })
      }
    }
  },

  getExperts: async function (){
    let nomore = this.data.experts.nomore
    if (nomore)return
    this.setData({
      loading:true
    })

    let pIndex = this.data.experts.pageIndex
    let res = await app.request.post('/user/talent/myTalents',{
      pageIndex:pIndex,
    })

    if (res.code === 0) {
      if (res.data.page > pIndex){
        pIndex++
      }else{
        nomore=true
      }
    
      this.setData({
        'experts.list':this.data.experts.list.concat(res.data.list),
        'experts.pageIndex':pIndex,
        'experts.nomore':nomore,
        loading:false
      })
    }
    wx.stopPullDownRefresh()
  },

  getArticles: async function (){
    let nomore = this.data.articles.nomore
    if (nomore)return
    this.setData({
      loading:true
    })

    let pIndex = this.data.articles.pageIndex
    let res = await app.request.post('/blog/article/getList',{
      queryType:2,
      articleType:1,
      ownerId:this.props.stores.account.userInfo.userId,
      pageIndex:pIndex,
      pageSize:10
    })

    if (res.code === 0) {
      if (res.data.page > pIndex){
        pIndex++
      }else{
        nomore=true
      }
    
      this.setData({
        'articles.list': this.data.articles.list.concat(res.data.list.map(blog=>{
          if(blog.articleBrief.length>76){
            blog.articleBrief=blog.articleBrief.substring(0,76)+'...'
          }
          blog.createTime=app.util.formatTime(blog.createTime,'blogCard')
          return blog
        })),
        'articles.pageIndex':pIndex,
        'articles.nomore':nomore,
        'articles.amount':res.data.count,
        loading:false
      })
    }
    wx.stopPullDownRefresh()
  }
  
}))
