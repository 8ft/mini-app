const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime


Page(app.observer({
  props: {
    stores: app.stores
  },

  data: {
    no: '',
    character: '',
    inProgress: false,
    detail: null,
    cooperation: null,
    imgs: [],
    docs: [],
    docTemps: [],
    applyUsers: null,
    applyInfo: null,
    shareTitles: {
      '01': '开发笑出声的项目，考虑下',
      '02': '好的设计项目找你，求安排',
      '03': '求助运营大牛，江湖救急',
      '04': '产品进，错过年终奖都不亏'
    },

    actionBarBtns: {
      '1': {//待审核
        publisher: null,
        applicant: null,
        viewer: null
      },
      '2': {//招募中
        publisher: null,
        applicant: null,
        viewer: {
          'contact_small': true,
          'apply': true
        }
      },
      '3': {//审核未通过
        publisher: {
          'edit': true
        },
        applicant: null,
        viewer: null
      },
      '4': {//申请中
        publisher: null,
        viewer: null,
        applicant: {
          'contact': true
        }
      },
      '5': {//发起合作意向
        viewer: null,
        publisher: {
          'contact_small': true,
          'fired': true
        },
        applicant: {
          'contact_small': true,
          'deal_with': true
        }
      },
      '6': {//确认合作意向
        viewer: null,
        publisher: {
          'contact_small': true,
          'firedOrPay': true
        },
        applicant: {
          'contact': true
        }
      },
      '7': {//拒绝合作意向
        publisher: null,
        applicant: null,
        viewer: null
      },
      '8': {//执行中
        viewer: null,
        publisher: {
          'contact': true
        },
        applicant: {
          'contact_small': true,
          'submit': true
        }
      },
      '9': {//项目申请未通过
        publisher: null,
        viewer: null,
        applicant: {
          'contact': true
        }
      },
      '10': {//待验收
        viewer: null,
        publisher: {
          'contact_small': true,
          'check': true
        },
        applicant: {
          'contact_small': true,
          'submit': true
        }
      },
      '11': {//已完成
        viewer: null,
        publisher: {
          'contact': true
        },
        applicant: {
          'contact': true
        }
      },
      '12': {//已关闭
        applicant: null,
        viewer: null,
        publisher: {
          'edit': true
        }
      },
      '13': {//已下架
        applicant: null,
        viewer: null,
        publisher: {
          'edit': true
        }
      },
      '14': {//验收不通过
        viewer: null,
        publisher: {
          'contact': true
        },
        applicant: {
          'contact_small': true,
          'deal_with': true
        }
      }
    },

    actionBarBtns_refund: {
      '20': {//退款中
        publisher: {
          'contact': true
        },
        applicant: {
          'contact_small': true,
          'deal_with': true
        },
        viewer: null
      },
      '21': {//同意退款（钱未到账）
        publisher: {
          'contact': true
        },
        applicant: null,
        viewer: null
      },
      '22': {//拒绝退款
        publisher: {
          'contact': true
        },
        applicant: {
          'contact': true
        },
        viewer: null
      },
      '23': {//已退款（到账）
        publisher: {
          'edit': true
        },
        applicant: null,
        viewer: null
      },
      '30': {//退款申述中（专家方refundState返回状态22）
        publisher: {
          'contact': true
        },
        applicant: null,
        viewer: null
      },
      '31': {//退款申诉成功（同意退款，钱未到账）
        publisher: null,
        applicant: null,
        viewer: {
          'contact_small': true,
          'apply': true
        }
      },
      '32': {//退款申诉失败（专家方refundState返回状态22）
        publisher: null,
        applicant: null,
        viewer: {
          'contact_small': true,
          'apply': true
        }
      },
      '33': {//申诉已退款（到账）
        publisher: {
          'edit': true
        },
        applicant: null,
        viewer: null
      }
    }
  },

  onShareAppMessage(res) {
    let detail = this.data.detail
    if (!detail) return
    return {
      title: this.data.shareTitles[detail.projectType]
    }
  },

  onLoad(options) {
    this.setData({
      no: options.no
    })
  },

  onShow() {
    this.props.stores.toRefresh.refresh('project_detail', (exist) => {
      if (!this.data.detail) {
        this.getDetail()
      } else if (exist) {
        this.getDetail()
      }
    })
  },

  onPullDownRefresh() {
    this.getDetail()
  },

  onTimeout(){
    this.props.stores.toRefresh.add('work')
    this.getDetail()
  },

  async getDetail() {
    let res = await app.request.post('/project/projectInfo/detail', {
      projectNo: this.data.no
    })
    if (res.code !== 0) return

    const user = wx.getStorageSync('account')
    let data = res.data,
      character = 'viewer',
      applyUsers = null,
      applyInfo = null,
      cooperation = null,
      inProgress = ['5', '6', '8', '10', '11', '14','23','33'].includes(data.projectState)

    if (inProgress) cooperation = await this.getCooperation(data.id)

    //已登录且参与项目，判断角色,并请求对应数据
    if (user && data.relationStatus === 1) {
      character = user.userId == data.publisher ? 'publisher' : 'applicant'
      if (character === 'applicant' && ['4', '9'].includes(data.projectState)) {
        applyInfo = await this.getApplyInfo(data.id, user.userId)
      }
      if (data.applyNum > 0 && ['2', '7', '8', '10', '11', '14'].includes(data.projectState) && character === 'publisher') {
        applyUsers = await this.getApplyUsers(data.id)
      }
    }

    //提取详情图片，文件
    let imgs = [], docs = []
    if (data.fileBatchNo) {
      let files = data.filesArr
      imgs = files.filter(item => {
        return /(\.gif|\.jpeg|\.png|\.jpg|\.bmp)/.test(item.url)
      })
      docs = files.filter(item => {
        return /(\.doc|\.docx|\.xls|\.xlsx|\.ppt|\.pptx|\.pdf|\.txt)/.test(item.url)
      })
    }

    data.createTime = data.createTime.slice(0, -3).replace(/-/g, '.')

    this.setData({
      character: character,
      inProgress: inProgress,
      cooperation: cooperation,
      applyUsers: applyUsers,
      applyInfo: applyInfo,
      imgs: imgs,
      docs: docs,
      detail: data
    })
  },

  async getCooperation(id) {
    let res = await app.request.post('/project/projectComfirm/detail', {
      projectId: id
    })
    if (res.code !== 0) return
    res.data.deliverTime = res.data.deliverTime.split(' ')[0].replace(/-/g, '.')
    return res.data
  },

  async getApplyInfo(pid, uid) {
    let res = await app.request.post('/project/projectApply/detail', {
      projectId: pid,
      userId: uid
    })
    if (res.code !== 0) return
    return res.data
  },

  async getApplyUsers(id) {
    let res = await app.request.post('/project/projectRelation/getApplyList', {
      pageSize: 3,
      projectId: id
    })
    if (res.code !== 0) return
    return res.data
  },

  async apply() {
    if (!app.checkLogin()) return

    switch (this.props.stores.account.userInfo.userState) {
      case 0://未完善
        wx.showModal({
          title: '提示',
          content: '去完善个人主页并提交通过审核后，再来申请项目吧！',
          confirmText: '马上去',
          success: res => {
            if (res.cancel) return
            wx.navigateTo({
              url: '/packageMine/pages/personalInfo/index/index',
            })
          }
        })
        break;
      case 1://审核中
        wx.showModal({
          title: '提示',
          content: '您已提交个人主页通过审核后即可申请项目',
          showCancel: false,
          confirmText: '知道了'
        })
        break;
      case 3://审核不通过
        wx.showModal({
          title: '提示',
          content: '您的个人主页未审核通过，请重新修改后提交审核',
          confirmText: '马上去',
          success: res => {
            if (res.cancel) return
            wx.navigateTo({
              url: '/packageMine/pages/personalInfo/index/index',
            })
          }
        })
        break;
      case 2:
        wx.navigateTo({
          url: `/packageProject/pages/apply/index/index?id=${this.data.detail.id}&&budget=${this.data.detail.projectBudgetCn}`,
        })
        break;
    }
  },

  preview() {
    wx.previewImage({
      urls: this.data.imgs.map(img => {
        return img.url
      })
    })
  },

  viewFile(e) {
    let data = e.currentTarget.dataset

    if (/\.txt/.test(data.url)) {
      wx.showModal({
        title: '提示',
        content: '小程序暂不支持该格式文件预览',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }

    let docTemps = this.data.docTemps
    let index = data.index
    let doc = docTemps[index]

    if (!doc) {
      wx.showLoading({
        title: '下载文档中'
      })

      wx.downloadFile({
        url: data.url.replace('http:', 'https:'),
        success: res => {
          const filePath = res.tempFilePath
          docTemps.push(filePath)
          this.setData({
            docTemps: docTemps
          })
          wx.hideLoading()
          this.openDoc(filePath)
        }
      })
    } else {
      this.openDoc(doc)
    }
  },

  openDoc(doc) {
    wx.openDocument({
      filePath: doc,
      fail(res) {
        wx.showToast({
          title: '打开文档失败',
          icon: 'none'
        })
      }
    })
  },

  call(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
    })
  },

  download: app.download

}))