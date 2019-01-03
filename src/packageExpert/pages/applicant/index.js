// pages/expert/applicant/index.js

//获取应用实例
const app = getApp()
//引入async await依赖库
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Page({
  data: {
    pageIndex:1,
    applicants:[],
    icon:{
      '1':'/assets/img/icon/gr.png',
      '2': '/assets/img/icon/td.png'
    }
  },

  onLoad: function (options) {
      this.getApplicant(options.id)
  },

  getApplicant:async function(id){
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