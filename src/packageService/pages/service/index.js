const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer
const Towxml = require('../../../libs/towxml/main')
const towxml = new Towxml()

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    hideNav: true,
    contentIndex:0,
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
  },

  onReady: function () {
    const query = wx.createSelectorQuery()
    query.select('#comments').fields({
      rect: true
    }, res => {
      this.setData({
        commentsPostion: res.top
      })
    }).exec()

    query.select('#detail').fields({
      rect: true
    }, res => {
      this.setData({
        detailPostion: res.top
      })
    }).exec()

    query.select('#navBar').fields({
      size: true
    }, res => {
     console.log(res)
    }).exec()
  },

  onPageScroll(scroll) {
    let sTop=scroll.scrollTop 

    if (sTop > 50 && this.data.hideNav === true) {
      this.setData({
        hideNav: false
      })
    } else if (sTop <= 50 && this.data.hideNav === false) {
      this.setData({
        hideNav: true
      })
    }

    if(this.data.commentsPostion>sTop>0&&this.contentIndex!==0){
      this.setData({
        contentIndex:0
      })
    }else if(this.data.detailPostion>sTop>=this.data.commentsPostion&&this.contentIndex!==1){
      this.setData({
        contentIndex:1
      })
    }else if(sTop>=this.data.detailPostion&&this.contentIndex!==2){
      this.setData({
        contentIndex:2
      })
    }
  },

  scrollToContent: function (e) {
    const index = e.detail.index
    let scrollTop = 0

    if (index === 1) {
      scrollTop = this.data.commentsPostion
    } else if (index === 2) {
      scrollTop = this.data.detailPostion
    }

    wx.pageScrollTo({
      scrollTop: scrollTop,
      duration: 300
    })
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
  },
}))