const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer
const Towxml = require('../../../libs/towxml/main')
const towxml = new Towxml()

let toScrollList=[]
let scrolling=false

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    hideNav: true,
    tabIndex: 0,
    isMyself: false,

    id: '',
    detail: null,
    loading: false
  },

  onLoad: function (options) {
    this.setData({
      id: options.id
    })
    this.getDetail()

    setInterval(()=>{
      if(toScrollList.length>0){
        this.setData({
          tabIndex:toScrollList.pop()
        })
        toScrollList=[]
      }
    },400)
  },

  onPageScroll(e) {
    let sTop=e.scrollTop

    if (sTop > 100 && this.data.hideNav === true) {
      this.setData({
        hideNav: false
      })
    } else if (sTop <= 100 && this.data.hideNav === false) {
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
    }, 400)
  },

  getDetail: async function () {
    this.setData({ loading: true })

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
      loading: false,
      detail: detail,
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
}))