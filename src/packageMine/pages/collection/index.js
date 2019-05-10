const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    tabIndex: 0,

    articles: {
      list: [],
      pageIndex: 1,
      nomore: false
    },

    qas: {
      list: [],
      pageIndex: 1,
      nomore: false
    },

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

    loading: true,
    scrollY:true
  },

  onLoad() {
    if (this.props.stores.account.blogInfo.favoriteNum > 0) {
      this.getArticles()
    }
  },

  onShow() {
    this.props.stores.toRefresh.refresh('mine_collection', async (exist) => {
      if (exist) {
        this.refresh()
      }
    })
  },

  getNavHeight(e) {
    const systemInfo = wx.getSystemInfoSync()
    const ratio = systemInfo.windowWidth / 750
    const scrollViewHeight = systemInfo.windowHeight - e.detail.height
    this.setData({
      scrollViewHeight: scrollViewHeight
    })
  },

  tabChange(e) {
    this.switchPage(e.detail.index)
  },

  onSwiperChange(e) {
    this.switchPage(e.detail.current)
  },

  switchPage(index) {
    if (index === this.data.tabIndex) return
    this.setData({
      tabIndex: index
    })

    if (index === 0 && this.data.articles.list.length === 0 && this.props.stores.account.blogInfo.favoriteNum > 0) {
      this.getArticles()
    } else if (index === 1 && this.data.qas.list.length === 0) {
      this.getQas()
    } else if (index === 2 && this.data.experts.list.length === 0) {
      this.getExperts()
    } else if (index === 3 && this.data.services.list.length === 0) {
      this.getServices(1)
    } else if (index === 4 && this.data.stores.list.length === 0) {
      this.getServices(0)
    }
  },

  loadMore() {
    if (this.data.tabIndex === 0&&this.props.stores.account.blogInfo.favoriteNum > 0) {
      this.getArticles()
    } else if (this.data.tabIndex === 1) {
      this.getQas()
    } else if (this.data.tabIndex === 2) {
      this.getExperts()
    } else if (this.data.tabIndex === 3) {
      this.getServices(1)
    }else if (this.data.tabIndex === 4) {
      this.getServices(0)
    }
  },

  refresh(e) {
    if(this.data.loading)return
    this.setData({scrollY:false})
    
    switch (this.data.tabIndex) {
      case 0:
        this.data.articles = {
          list: [],
          pageIndex: 1,
          nomore: false
        }
        this.getArticles()
        break;
      case 1:
        this.data.qas = {
          list: [],
          pageIndex: 1,
          nomore: false
        }
        this.getQas()
        break;
      case 2:
        this.data.experts = {
          list: [],
          pageIndex: 1,
          nomore: false
        }
        this.getExperts()
        break;
      case 3:
        this.data.services = {
          list: [],
          pageIndex: 1,
          nomore: false
        }
        this.getServices(1)
        break;
      case 4:
        this.data.stores = {
          list: [],
          pageIndex: 1,
          nomore: false
        }
        this.getServices(0)
        break;
    }
  },

  updateExpertCard(e) {
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

  updateQaCard(e) {
    const data = e.detail
    this.setData({
      [`qas.list[${data.index}].collectFlag`]: data.flag
    })
  },

  updateServiceCard(e) {
    const data = e.detail
    this.setData({
      [`services.list[${data.index}].collectFlag`]: data.flag
    })
  },

  updateStoreCard(e) {
    const data = e.detail
    this.setData({
      [`stores.list[${data.index}].collectFlag`]: data.flag
    })
  },

  async getQas() {
    let nomore = this.data.qas.nomore
    if (nomore) return
    this.setData({
      loading: true
    })

    let pIndex = this.data.qas.pageIndex
    let res = await app.request.post('/qa/question/query/list', {
      queryType: 4,
      pageIndex: pIndex
    })

    if (res.code === 0) {
      if (res.data.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      this.setData({
        'qas.list': this.data.qas.list.concat(res.data.list.map(qa => {
          if (qa.skillTag) {
            qa.skillTag = qa.skillTag.split('|')
          }
          return qa
        })),
        'qas.pageIndex': pIndex,
        'qas.nomore': nomore,
        loading:false,
        scrollY:true
      })
    }
    
  },

  async getExperts() {
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
        loading:false,
        scrollY:true
      })
    }
    
  },

  async getServices(type) {
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
          loading:false,
          scrollY:true
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
          loading:false,
          scrollY:true
        })
      }

    }
    
  },

  async getArticles() {
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

    if (res.code !== 0) return
    if (res.data.page > pIndex) {
      pIndex++
    } else {
      nomore = true
    }

    this.setData({
      'articles.list': this.data.articles.list.concat(res.data.list.map(blog => {
        if (blog.articleBrief.length > 50) {
          blog.articleBrief = blog.articleBrief.substring(0, 50) + '...'
        }
        blog.createTime = app.util.formatTime(blog.createTime, 'blogCard')
        return blog
      })),
      'articles.pageIndex': pIndex,
      'articles.nomore': nomore,
      'articles.amount': res.data.count,
      loading:false,
      scrollY:true
    })
  }

}))
