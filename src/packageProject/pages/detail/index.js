const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    no:'',
    character:'',
    inProgress:false,
    detail:null,
    cooperation:null,
    imgs:[],
    docs: [],
    docTemps:[],
    applyUsers:null,
    applyInfo:null,
    shareTitles:{
      '01':'开发笑出声的项目，考虑下',//开发
      '02': '好的设计项目找你，求安排',//设计
      '03': '求助运营大牛，江湖救急',//运营
      '04': '产品进，错过年终奖都不亏'//产品
    }
  },

  onShareAppMessage (res) {
    let detail = this.data.detail
    if(!detail)return
    return {
      title: this.data.shareTitles[detail.projectType]
    }
  },

  onLoad(options){
    this.setData({
      no:options.no
    })
  },

  onShow () {
    this.props.stores.toRefresh.refresh('project_detail',(exist)=>{
      if(!this.data.detail){
        this.getDetail()
      }else if(exist){
        this.getDetail()
      }
    })
  },

  onPullDownRefresh(){
    this.getDetail()
  },

  async getDetail (){
    let res = await app.request.post('/project/projectInfo/detail', {
      projectNo: this.data.no
    })
    if(res.code!==0)return

    const user = wx.getStorageSync('account')
    let data = res.data,
      character = '', 
      applyUsers=null,
      applyInfo=null,
      cooperation=null,
      inProgress = ['5', '6','8','10','11','14'].includes(data.projectState)

    if (inProgress) cooperation= await this.getCooperation(data.id)

    //已登录且参与项目，判断角色,并请求对应数据
    if (user && data.relationStatus===1) {
      character = user.userId == data.publisher?'publisher':'applicant'
      if (character === 'applicant' && ['4', '9'].includes(data.projectState)) {
        applyInfo=await this.getApplyInfo(data.id,user.userId)
      }
      if (data.applyNum > 0 && ['2','7','8','10','11','14'].includes(data.projectState)&& character === 'publisher' ) {
        applyUsers=await this.getApplyUsers(data.id)
      }
    }

    //提取详情图片，文件
    let imgs=[], docs=[]
    if (data.fileBatchNo){
      let files = data.filesArr
      imgs = files.filter(item=>{
        return /(\.gif|\.jpeg|\.png|\.jpg|\.bmp)/.test(item.url)
      })
      docs = files.filter(item => {
        return /(\.doc|\.docx|\.xls|\.xlsx|\.ppt|\.pptx|\.pdf|\.txt)/.test(item.url)
      })
    }

    data.createTime = data.createTime.slice(0, -3).replace(/-/g,'.')

    this.setData({
      character: character,
      inProgress: inProgress,
      cooperation:cooperation,
      applyUsers: applyUsers,
      applyInfo: applyInfo,
      imgs: imgs,
      docs: docs,
      detail:data
    })
  },

  async getCooperation(id){
    let res = await app.request.post('/project/projectComfirm/detail', {
      projectId: id
    })
    if (res.code !== 0) return
    res.data.deliverTime = res.data.deliverTime.split(' ')[0].replace(/-/g, '.')
    return res.data
  },

  async getApplyInfo (pid,uid) {
    let res = await app.request.post('/project/projectApply/detail', {
      projectId: pid,
      userId: uid
    })
    if (res.code !== 0) return
    return res.data
  },

  async getApplyUsers (id){
    let res = await app.request.post('/project/projectRelation/getApplyList', {
      pageSize: 3,
      projectId: id
    })
    if (res.code !== 0) return
    return res.data
  },

  async apply(){
    if(!app.checkLogin())return

    switch (this.props.stores.account.userInfo.userState){
      case 0://未完善
        wx.showModal({
          title: '提示',
          content: '去完善个人主页并提交通过审核后，再来申请项目吧！',
          confirmText:'马上去',
          success:res=>{
            if(res.cancel)return
            wx.navigateTo({
              url:'/packageMine/pages/personalInfo/index/index',
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

  preview () {
    wx.previewImage({
      urls: this.data.imgs.map(img => {
        return img.url
      })
    })
  },

  viewFile (e) {
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
      let url = data.url.replace('http:', 'https:')
      wx.downloadFile({
        url: url,
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

  openDoc (doc) {
    wx.openDocument({
      filePath: doc,
      fail (res) {
        wx.showToast({
          title: '打开文档失败',
          icon: 'none'
        })
      }
    })
  },

  call(e){
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
    })
  },

  download: app.download

}))