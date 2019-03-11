const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer
const Towxml = require('../../../libs/towxml/main')
const towxml = new Towxml()

//为防止过度频繁的setData,根据滚动动态修改标签的功能设置了限速器
//滚动时将要修改的标签ID录入toScrollList，每350毫秒取toScrollList组后一个进行setData,并清空toScrollList
let iid=''
let toScrollList=[]
//手动点击切换标签,再动画完成之前,scrolling=true,阻止onPageScroll进行【根据滚动动态修改标签】
let scrolling=false

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    currentSwiper:1,

    hideNav: true,
    isMyself: false,

    id: '',
    detail: null
  },

  onLoad: function (options) {
    this.setData({
      id: options.id
    })
  },

  onShow:function(){
    this.props.stores.toRefresh.refresh('service-index',async(exist)=>{
      if(this.data.detail===null||exist){
        this.getDetail()
      }
    })

    iid=setInterval(()=>{
      if(toScrollList.length>0){
        this.setData({
          tabIndex:toScrollList.pop()
        })
        toScrollList=[]
      }
    },350)
  },

  onHide:function(){
    clearInterval(iid)
  },

  onUnload:function(){
    wx.removeStorageSync('serviceInfo')
  },

  onPageScroll(e) {
    let sTop=e.scrollTop

    if (sTop > 80 && this.data.hideNav === true) {
      this.setData({
        hideNav: false
      })
    } else if (sTop <= 80 && this.data.hideNav === false) {
      this.setData({
        hideNav: true
      })
    }

    if(scrolling)return
    if(this.data.commentsPostion>sTop&&this.data.tabIndex!==0){
      toScrollList.push(0)
    }else if(this.data.detailPostion>sTop&&sTop>=this.data.commentsPostion&&this.data.tabIndex!==1){
      toScrollList.push(1)
    }else if(sTop>=this.data.detailPostion&&this.data.tabIndex!==2){
      toScrollList.push(2)
    }
  },

  onSwiperChange:function(e){
    this.setData({
      currentSwiper:e.detail.current+1
    })
  },

  getNavHeight: function (e) {
    this.setData({
      navHeight: e.detail.height
    })
  },

  tabChange: function (e) {
    scrolling=true
    const index = e.detail.index
    let scrollTop = 0

    if (index === 1) {
      scrollTop = this.data.commentsPostion
    } else if (index === 2) {
      scrollTop = this.data.detailPostion
    }

    wx.pageScrollTo({
      scrollTop: scrollTop,
      duration: 0
    })

    setTimeout(() => {
      scrolling=false
    }, 350)
  },

  getDetail: async function () {
    let data = await app.request.post('/store/productBaseInfo/detail', {
      productId: this.data.id
    })
    if (data.code !== 0) return

    let comments = await app.request.post('/store/productAppraiseRecord/getList', {
      productId: this.data.id,
      pageSize: 3
    })
    if (comments.code !== 0) return


    let isMyself = false
    let detail = data.data.productDetail
    if (this.props.stores.account.logged_in) {
      isMyself = this.props.stores.account.userInfo.userId === detail.userId
    }

    detail.picUrlList = detail.picUrlList.split('|')

    //解析html
    detail.productDesc = towxml.toJson(
      detail.productDesc,
      'html'
    )

    this.setData({
      isMyself: isMyself,
      detail: detail,
      storeInfo:data.data.storeInfo,
      comments: comments.data
    })

    const query = this.createSelectorQuery()
    query.select('#comments').boundingClientRect()
    query.select('#detail').boundingClientRect()

    query.exec(e => {
      this.setData({
        commentsPostion: e[0].top - this.data.navHeight,
        detailPostion: e[1].top - this.data.navHeight
      })
    })
  },

  collect:async function(){
    if(app.checkLogin()){
      const res = await app.request.post('/store/collectionInfo/collect',{
        businessId:this.data.detail.id,
        type:1
      })
      if(res.code!==0)return
      this.setData({
        'detail.collectFlag':this.data.detail.collectFlag==='0'?'1':'0'
      })
    }
  },

  jump:function(e){
    const page=e.currentTarget.dataset.page

    wx.setStorageSync('serviceInfo',{
      service:this.data.detail,
      store:this.data.storeInfo
    })

    if(page==='buy'&&app.checkLogin()){
      wx.navigateTo({
        url:`/packageService/pages/buy/index`
      })
    }else{
      wx.navigateTo({
        url:`/packageService/pages/comments/index`
      })
    }
  },
  
  download:app.download
}))