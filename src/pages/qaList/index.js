const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime


Page({
  data: {
    activeFilter: '',

    //问答
    qa: {
      list: [],
      pageIndex: 1,
      nomore: false
    },
    qa_sortWay: {
      selected: { text: '默认排序', value: '' },
      list: [
        { text: '默认排序', value: '' },
        { text: '时间优先', value: '1' },
        { text: '价格优先', value: '2' }
      ]
    },
    qa_types: {
      parent: '',
      selected: {},
      list: []
    },
    qa_priceIn: {
      selected: { text: '不限', value: '' },
      list: [
        { text: '不限', value: '' },
        { text: '5-20元', value: '1' },
        { text: '50-100元', value: '2' },
        { text: '200-300元', value: '3' }
      ]
    },
    qa_status: {
      selected: { text: '不限', value: '' },
      list: [
        { text: '不限', value: '' },
        { text: '未解决', value: '0' },
        { text: '已解决', value: '1' }
      ]
    },

    loading:true
  },

  onLoad(options) {
    this.getQa()
  },

  onPullDownRefresh () {
    this.refresh()
  },

  onReachBottom () {
    this.getQa()
  },

  getNavHeight(e) {
    const systemInfo = wx.getSystemInfoSync()
    const ratio = systemInfo.windowWidth / 750
    this.setData({
      navHeight:e.detail.height,
      popupTop:`${e.detail.height+80*ratio}px`
    })
  },

  refresh() {
    this.data.qa = {
      list: [],
      pageIndex: 1,
      nomore: false
    }
    this.getQa()
  },

  async getQa() {
    const data = this.data
    let nomore = data.qa.nomore
    if (nomore) return

    this.setData({
      loading:true
    })

    let pIndex = data.qa.pageIndex
    let res = await app.request.post('/qa/question/query/list', {
      queryType:1,
      questionState:'11|12',
      sortBy: data.qa_sortWay.selected.value || '',
      stateCond: data.qa_status.selected.value || '',
      subType: data.qa_types.selected.dictValue || '',
      rewardCond: data.qa_priceIn.selected.value || '',
      pageIndex: pIndex
    })

    if (res.code === 0) {
      if (res.data.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      let newData={
        'qa.list': data.qa.list.concat(res.data.list.map((qa) => {
          if(qa.skillTag){
            qa.skillTag = qa.skillTag.split('|')
          }
          return qa
        })),
        'qa.pageIndex': pIndex,
        'qa.nomore': nomore,
        loading:false
      }
      
      if(data.qa_types.list.length===0){
        const qa_types = await app.request.post('/dict/dictCommon/getDicts', {
          dictType: 'project_type',
          resultType: '1'
        })
        newData['qa_types.list']=qa_types.data.data[0].dictList
      }

      this.setData(newData)
    }

    wx.stopPullDownRefresh()
    
  },

  selectFilter(e) {
    if (this.data.activeFilter) {
      this.setData({
        activeFilter: ''
      })
    } else {
      this.setData({
        activeFilter: e.currentTarget.dataset.name
      })
    }
  },

  closePopup() {
    this.setData({
      activeFilter: ''
    })
  },

  filter(e) {
    let data = e.currentTarget.dataset
    switch (data.type) {
      case 'qa_sortWay':
        this.setData({
          'qa_sortWay.selected': data.item
        })
        break;
      case 'qa_types':
        this.setData({
          'qa_types.selected': data.item
        })
        break;
      case 'qa_priceIn':
        this.setData({
          'qa_priceIn.selected': data.item
        })
        break;
      case 'qa_status':
        this.setData({
          'qa_status.selected': data.item
        })
        break;
    }

    this.refresh()
    this.closePopup()
  },

  scrollToQaTypes(e) {
    this.setData({
      'qa_types.parent': 'qa' + e.currentTarget.dataset.code
    })
  },

  hideIntroduce(){
    this.setData({
      hideIntroduce:true
    })
  }

})



