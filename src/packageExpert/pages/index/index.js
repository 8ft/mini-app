const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    isMyself: false,
    nodataHeight: 0,

    from: '',
    uid: '',
    tabIndex: 0,
    user: null,
    blogInfo: null,

    blogs: {
      tag: 0,
      tags: [],
      list: [],
      pageIndex: 1,
      nomore: false
    },

    questions: {
      tag: 0,
      tags:{
        'someone':[
          {name:'全部',val:'1|2'},
          {name:'已解决',val:'2'},
          {name:'未解决',val:'1'}
        ],
        'mine':[
          {
            name: '全部',
            val: ''
          },
          {
            name: '已解决',
            val: '12'
          },
          {
            name: '未解决',
            val: '11'
          },
          {
            name: '已关闭',
            val: '0|22'
          },
          {
            name: '审核中',
            val: '10'
          },
          {
            name: '未通过',
            val: '20'
          },
          {
            name: '已下架',
            val: '13|21'
          }
        ]
      },
      list: [],
      pageIndex: 1,
      nomore: false
    },

    answers: {
      tag: 0,
      tags:{
        'someone':[
          {name:'全部',val:'1|2'},
          {name:'已解决',val:'2'},
          {name:'未解决',val:'1'}
        ],
        'mine':[
          {
            name: '全部',
            val: ''
          },
          {
            name: '已解决',
            val: '12'
          },
          {
            name: '未解决',
            val: '11'
          }
        ]
      },
      list: [],
      pageIndex: 1,
      nomore: false
    },

    loading: true
  },

  onLoad(options) {
    const myId = wx.getStorageSync('account').userId
    const curId = options.id
    const isMyself = myId === curId

    this.setData({
      pageTitle: isMyself ? '个人主页' : 'TA的主页',
      from: options.from || '',
      uid: curId,
      isMyself: isMyself
    })
    this.getUserInfo()
  },

  onShareAppMessage() {
    return {
      title: `${this.data.user.nickName}的主页`
    }
  },

  onPullDownRefresh() {
    this.getUserInfo()
  },

  onReachBottom() {
    if (this.data.tabIndex === 1) {
      this.getBlogs()
    }
  },

  copyLink(e) {
    const link = e.currentTarget.dataset.link
    if (!link) return
    wx.setClipboardData({
      data: link
    })
  },

  viewImage(e) {
    const curUrl = e.currentTarget.dataset.url
    if (!curUrl) return
    wx.previewImage({
      urls: [curUrl]
    })
  },

  async switchList(e) {
    const index = e.detail.index
    if (index === 1 &&this.data.blogInfo.articleNum>0&& this.data.blogs.tags.length <= 1) {
      await this.getBlogTags()
      this.getBlogs()
    } else if (index === 2 && this.data.blogInfo.questionNum > 0) {
      this.getQas('questions')
    } else if (index === 3 && this.data.blogInfo.answerNum > 0) {
      this.getQas('answers')
    }

    this.setData({
      tabIndex: index
    })
  },

  switchTag(e) {
    const index = e.currentTarget.dataset.index
    const page=e.currentTarget.dataset.page

    this.setData({
      [`${page}.tag`]:index
    })

    this.data[page].list=[]
    this.data[page].pageIndex=1
    this.data[page].nomore=false

    if(page==='blogs'&&this.data.blogs.tags[index].articleNum>0){
      this.getBlogs()
    }else if(page==='blogs'){
      this.setData({
        'blogs.list':[]
      })
    }else{
      this.getQas(page)
    }
  },

  async getUserInfo() {
    let userInfo
    if (this.data.isMyself) {
      userInfo = app.util.deepCopy(this.props.stores.account.userInfo)
    } else {
      let res = await app.request.post('/user/userAuth/viewUserBaseInfo', {
        userId: this.data.uid
      })
      if (res.code !== 0) return
      userInfo = res.data
    }

    let positionTitle = userInfo.userBaseInfo.positionTitle
    if (positionTitle && positionTitle.length > 10) {
      userInfo.userBaseInfo.positionTitle = `${positionTitle.substr(0, 10)}...`
    }

    let positionTypeCn = userInfo.userBaseInfo.positionTypeCn
    if (positionTypeCn) {
      userInfo.userBaseInfo.positionTypeCn = positionTypeCn.split('|')
    }

    if (userInfo.userSampleInfos.length > 0) {
      userInfo.userSampleInfos = userInfo.userSampleInfos.map(item => {
        if (item.sampleDesc.length >= 30) {
          item.sampleDesc = item.sampleDesc.substring(0, 30) + '...'
        }
        return item
      })
    }

    let blogInfo = await app.request.post('/blog/attentionInfo/queryBlogUserInfo', {
      userId: userInfo.userId
    })
    if (blogInfo.code !== 0) return

    this.setData({
      user: userInfo,
      blogInfo: blogInfo.data,
      'blogs.tags[0]': {
        name: '全部标签',
        articleNum: blogInfo.data.articleNum,
        id: ''
      }
    })

    if (this.data.nodataHeight === 0) {
      wx.createSelectorQuery().select('#content').fields({
        rect: true
      }, res => {
        this.setData({
          nodataHeight: wx.getSystemInfoSync().windowHeight - res.top
        })
      }).exec()
    }

    wx.stopPullDownRefresh()
  },

  async getBlogTags() {
    let res = await app.request.post('/blog/catalog/getList', {
      userId: this.data.uid,
      pageIndex: 1,
      pageSize: 99
    })

    if (res.code !== 0) return

    this.setData({
      'blogs.tags': this.data.blogs.tags.concat(res.data.list)
    })
  },

  async getBlogs() {
    let nomore = this.data.blogs.nomore
    if (nomore) return

    this.setData({
      loading: true
    })

    let pIndex = this.data.blogs.pageIndex
    let res = await app.request.post('/blog/article/getList', {
      ownerId: this.data.uid,
      catalogId: this.data.blogs.tags[this.data.blogs.tag].id,
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
        'blogs.list': this.data.blogs.list.concat(res.data.list.map(blog => {
          if (blog.articleBrief.length > 50) {
            blog.articleBrief = blog.articleBrief.substring(0, 50) + '...'
          }
          blog.createTime = app.util.formatTime(blog.createTime, 'blogCard')
          return blog
        })),
        'blogs.pageIndex': pIndex,
        'blogs.nomore': nomore,
        loading: false
      })
    }
    wx.stopPullDownRefresh()
  },

  deleteQa(e){
    const index=e.currentTarget.dataset.index
    this.data.answers.list.splice(index,1)
    this.setData({
      'answers.list':this.data.answers.list
    })
  },

  async getQas(page) {
    let nomore = this.data[page].nomore
    if (nomore) return
    this.setData({
      loading: true
    })

    let pIndex = this.data[page].pageIndex
    let res = await app.request.post('/qa/question/query/list', {
      userId:this.data.user.userId,
      stateCond:this.data[page].tags[this.data.isMyself?'mine':'someone'][this.data[page].tag].val,
      queryType: page==='questions'?2:3,
      pageIndex: pIndex
    })

    if (res.code === 0) {
      if (res.data.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      this.setData({
        [`${page}.list`]: this.data[page].list.concat(res.data.list.map(qa => {
          if (qa.skillTag) {
            qa.skillTag = qa.skillTag.split('|')
          }
          return qa
        })),
        [`${page}.pageIndex`]: pIndex,
        [`${page}.nomore`]: nomore,
        loading: false
      })
    }
    wx.stopPullDownRefresh()
  },

  download: app.download

}))