const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({

  data: {
    isMyself:false,
    nodataHeight:0,

    from:'',
    uid:'',
    typeIndex:0,
    user:null,
    blogInfo:null,

    tags:[],
    tagIndex:0,

    blogs:[],
    pageIndex: 1,
    nomore: false,
    loading:true
  },

  onLoad:function (options) {
    const myId=wx.getStorageSync('account').userId
    const curId=options.id
    const isMyself=myId===curId

    wx.setNavigationBarTitle({
      title: isMyself?'个人主页':'TA的主页'
    })

    this.setData({
      from:options.from||'',
      uid:curId,
      isMyself:isMyself
    })
    this.getUserInfo()
  },

  onShareAppMessage: function () {
    return {
      title: `${this.data.user.nickName}的主页`
    }
  },

  onPullDownRefresh:function(){
    this.getUserInfo()
  },

  onReachBottom:function(){
    if(this.data.typeIndex===1){
      this.getBlogs()
    }
  },

  copyLink:function(e){
    const link = e.currentTarget.dataset.link
    if (!link) return
    wx.setClipboardData({
      data: link
    })
  },  

  viewImage: function (e) {
    const curUrl = e.currentTarget.dataset.url
    if (!curUrl) return
    wx.previewImage({
      urls: [curUrl]
    })
  },

  switchList:async function(e){
    const index = e.detail.index
    if(index===1&&this.data.tags.length<=1){
      await this.getBlogTags()
      this.getBlogs()
    }
    this.setData({
      typeIndex: index
    })
  },

  switchTag:function(e){
    const index = e.currentTarget.dataset.index

    this.setData({
      tagIndex:index,
      blogs:[],
      pageIndex: 1,
      nomore: false,
      loading:true
    })

    if(this.data.tags[index].articleNum!==0){
      this.getBlogs()
    }
  },

  getUserInfo: async function () {
    let res = await app.request.post('/user/userAuth/viewUserBaseInfo', {
      userId: this.data.uid
    })
    if (res.code !== 0) return

    let data=res.data
    if(data.userState===2){
      data.userBaseInfo.positionTypeCn = data.userBaseInfo.positionTypeCn.split('|')
      data.userSampleInfos = data.userSampleInfos.map(item=>{
        if (item.sampleDesc.length >= 30){
          item.sampleDesc=item.sampleDesc.substring(0,30)+'...'
        }
        return item
      })
    }

    let blogInfo=await app.request.post('/blog/attentionInfo/queryBlogUserInfo',{
      userId:data.userId
    })
    if (blogInfo.code !== 0) return
    
    this.setData({
      user:data,
      blogInfo:blogInfo.data,
      'tags[0]':{
        name:'全部标签',
        articleNum:blogInfo.data.articleNum,
        id:''
      }
    })

    if(data.userState!==2&&this.data.nodataHeight===0){
      const query = wx.createSelectorQuery()
      query.select('#nodata').fields({
        rect: true
      }, res => {
        wx.getSystemInfo({
          success: data => {
            this.setData({
              nodataHeight: data.windowHeight - res.top
            })
          }
        })
      }).exec()
    }

    wx.stopPullDownRefresh()
  },

  getBlogTags: async function (){
    let res = await app.request.post('/blog/catalog/getList',{
      userId: this.data.uid,
      pageIndex:1,
      pageSize:99
    })

    if (res.code !== 0)return
    
    this.setData({
      tags:this.data.tags.concat(res.data.list)
    }) 
  },

  getBlogs: async function (){
    let nomore = this.data.nomore
    if (nomore)return

    this.setData({
      loading:true
    })

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/blog/article/getList',{
      ownerId: this.data.uid,
      catalogId:this.data.tags[this.data.tagIndex].id,
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
        blogs: this.data.blogs.concat(res.data.list.map(blog=>{
          if(blog.articleBrief.length>76){
            blog.articleBrief=blog.articleBrief.substring(0,76)+'...'
          }
          blog.createTime=app.util.formatTime(blog.createTime,'blogCard')
          return blog
        })),
        pageIndex:pIndex,
        nomore:nomore,
        loading:false
      })
    }
    wx.stopPullDownRefresh()
  },

  download:app.download
 
})