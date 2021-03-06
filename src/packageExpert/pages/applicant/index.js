const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime

Page({
  data: {
    pageIndex:1,
    applicants:[],
    icon:{
      '1':'/assets/img/icon/gr.png',
      '2': '/assets/img/icon/td.png'
    }
  },

  onLoad (options) {
      this.getApplicant(options.id)
  },

  async getApplicant(id){
    let res = await app.request.post('/project/projectRelation/getApplyList', {
      pageIndex: this.data.pageIndex,
      projectId:id
    })

    if (res.code === 0) {
      this.setData({
        applicants: this.data.applicants.concat(res.data.list)
      })
    }
  },
  download: app.download
})