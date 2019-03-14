const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    typeIndex: 0,

    experts: {
      list: [],
      pageIndex: 1,
      nomore: false
    },

    services: {
      list: [],
      pageIndex: 1,
      nomore: false
    },

    stores: {
      list: [],
      pageIndex: 1,
      nomore: false
    },

    articles: {
      list: [],
      pageIndex: 1,
      nomore: false
    },

    loading: true
  },

  onLoad () {
    this.getExperts()
  },

  onShow () {
    this.props.stores.toRefresh.refresh('mine_collection',async(exist)=>{
      if(exist){
        this.refresh()
      }
    })
  },

  onPullDownRefresh () {
    this.refresh()
  },

  onReachBottom () {
    switch (this.data.typeIndex) {
      case 0:
        this.getExperts()
        break;
      case 1:
        this.getServices(1)
        break;
      case 2:
        this.getServices(0)
        break;
      case 3:
        this.getArticles()
        break;
    }
  },

  refresh () {
    switch (this.data.typeIndex) {
      case 0:
        if (this.data.experts.list.length > 0) {
          this.data.experts = {
            list: [],
            pageIndex: 1,
            nomore: false
          }
        }
        this.getExperts()
        break;
      case 1:
        if (this.data.services.list.length > 0) {
          this.data.services = {
            list: [],
            pageIndex: 1,
            nomore: false
          }
        }
        this.getServices(1)
        break;
      case 2:
        if (this.data.stores.list.length > 0) {
          this.data.stores = {
            list: [],
            pageIndex: 1,
            nomore: false
          }
        }
        this.getServices(0)
        break;
      case 3:
        if (this.data.articles.list.length > 0) {
          this.data.articles = {
            list: [],
            pageIndex: 1,
            nomore: false
          }
        }
        this.getArticles()
        break;
    }
  },

  switchList (e) {
    const index = e.detail.index

    if (index === 1 && this.data.services.list.length === 0) {
      this.getServices(1)
    } else if (index === 2 && this.data.stores.list.length === 0) {
      this.getServices(0)
    } else if (index === 3 && this.data.articles.list.length === 0 && this.props.stores.account.blogInfo.favoriteNum > 0) {
      this.getArticles()
    }

    this.setData({
      typeIndex: index
    })
  },

  updateExpertCard (e) {
    const data = e.detail
    if (data.remark !== undefined) {
      this.setData({
        [`experts.list[${data.index}].talentRemark`]: data.remark
      })
    } else {
      this.setData({
        [`experts.list[${data.index}].followFlag`]: data.flag
      })
      if (data.flag === 0) {
        this.setData({
          [`experts.list[${data.index}].talentRemark`]: ''
        })
      }
    }
  },

  updateServiceCard (e) {
    const data = e.detail
    this.setData({
      [`services.list[${data.index}].collectFlag`]: data.flag
    })
  },

  updateStoreCard (e) {
    const data = e.detail
    this.setData({
      [`stores.list[${data.index}].collectFlag`]: data.flag
    })
  },

  async getExperts () {
    let nomore = this.data.experts.nomore
    if (nomore) return
    this.setData({
      loading: true
    })

    let pIndex = this.data.experts.pageIndex
    let res = await app.request.post('/user/talent/myTalents', {
      pageIndex: pIndex,
    })

    if (res.code === 0) {
      if (res.data.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      this.setData({
        'experts.list': this.data.experts.list.concat(res.data.list),
        'experts.pageIndex': pIndex,
        'experts.nomore': nomore,
        loading: false
      })
    }
    wx.stopPullDownRefresh()
  },

  async getServices (type) {
    let data = type === 1 ? this.data.services : this.data.stores
    let nomore = data.nomore
    if (nomore) return
    this.setData({
      loading: true
    })

    let pIndex = data.pageIndex
    let res = await app.request.post('/store/collectionInfo/getCollectList', {
      pageIndex: pIndex,
      type: type
    })

    if (res.code === 0) {
      if (res.data.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      if (type === 1) {
        this.setData({
          'services.list': this.data.services.list.concat(res.data.list.map(service => {
            if (service.productName.length > 30) {
              service.productName = service.productName.substring(0, 30) + '...'
            }
            return service
          })),
          'services.pageIndex': pIndex,
          'services.nomore': nomore,
          loading: false
        })
      } else {
        this.setData({
          'stores.list': this.data.stores.list.concat(res.data.list.map(store => {
            if (store.productName.length > 30) {
              store.productName = store.productName.substring(0, 30) + '...'
            }
            return store
          })),
          'stores.pageIndex': pIndex,
          'stores.nomore': nomore,
          loading: false
        })
      }

    }
    wx.stopPullDownRefresh()
  },

  async getArticles () {
    let nomore = this.data.articles.nomore
    if (nomore) return
    this.setData({
      loading: true
    })

    let pIndex = this.data.articles.pageIndex
    let res = await app.request.post('/blog/article/getList', {
      queryType: 2,
      articleType: 1,
      ownerId: this.props.stores.account.userInfo.userId,
      pageIndex: pIndex,
      pageSize: 10
    })

    if (res.code === 0) {
      if (res.data.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      this.setData({
        'articles.list': this.data.articles.list.concat(res.data.list.map(blog => {
          if (blog.articleBrief.length > 76) {
            blog.articleBrief = blog.articleBrief.substring(0, 76) + '...'
          }
          blog.createTime = app.util.formatTime(blog.createTime, 'blogCard')
          return blog
        })),
        'articles.pageIndex': pIndex,
        'articles.nomore': nomore,
        'articles.amount': res.data.count,
        loading: false
      })
    }
    wx.stopPullDownRefresh()
  }

}))
