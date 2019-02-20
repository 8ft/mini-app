const app = getApp()
const regeneratorRuntime = require('../../libs/regenerator-runtime.js')
const observer = require('../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    scrollViewHeight:0,
    typeIndex:0,
    iconName: {
      '01': 'kaifa',
      '02': 'sheji',
      '03': 'yunying',
      '04': 'chanpin'
    },

    pageSize:10,
    loading:true,
    myPublish:{
      states: [
        {
          dictName: '全部',
          dictValue: ''
        },
        {
          dictName: '待审核',
          dictValue: '1'
        },
        {
          dictName: '审核未通过',
          dictValue: '3'
        },
        {
          dictName: '招募中',
          dictValue: '2|5|6|7'
        },
        {
          dictName: '执行中',
          dictValue: '8'
        },
        {
          dictName: '待验收',
          dictValue: '10|14'
        },
        {
          dictName: '已完成',
          dictValue: '11'
        },
        {
          dictName: '已关闭',
          dictValue: '12'
        },
        {
          dictName: '已下架',
          dictValue: '13'
        }
      ],
      currentState:0,
      projects:[],
      pageIndex: 1,
      nomore: false
    },

    myApply: {
      states: [
        {
          dictName: '全部',
          dictValue: ''
        },
        {
          dictName: '申请中',
          dictValue: '4|5'
        },
        {
          dictName: '未通过',
          dictValue: '9|12|13'
        }
      ],
      currentState: 0,
      projects: [],
      pageIndex: 1,
      nomore: false
    }
  },

  onShow:function(){
    if(!this.props.stores.account.logged_in)return 
    this.props.stores.toRefresh.refresh('work',(exist)=>{
      if (this.data.scrollViewHeight===0){
        wx.createSelectorQuery().select('#projects').fields({
          rect: true
        }, res => {
          this.setData({
            scrollViewHeight: wx.getSystemInfoSync().windowHeight - res.top
          })
        }).exec()
        this.getMyPublish()
      }else if(exist){
        this.refresh()
      }
    })
  },

  refresh:function(){
    if (this.data.typeIndex === 0) {
      this.data.myPublish.pageIndex=1
      this.data.myPublish.nomore=false
      this.data.myPublish.projects=[]
      this.getMyPublish()
    } else {
      this.data.myApply.pageIndex=1
      this.data.myApply.nomore=false
      this.data.myApply.projects=[]
      this.getMyApply()
    }
  },

  switchList:function(e){
    let index = e.detail.index
    this.setData({
      typeIndex: index
    })
    this.refresh()
  },

  switchState:function(e){
    const index = e.currentTarget.dataset.index
    if(this.data.typeIndex===0){
      this.setData({
        'myPublish.currentState':index
      })
    }else{
      this.setData({
        'myApply.currentState': index
      })
    }
    this.refresh()
  },

  getMyPublish:async function(){
    this.setData({
      loading:true
    })
    let myPublish = this.data.myPublish
    if (myPublish.nomore || !this.props.stores.account.logged_in) return 
    let res = await app.request.post('/project/projectInfo/myProjectList', {
      relationType:'1|3',
      projectState: myPublish.states[myPublish.currentState].dictValue,
      pageIndex: myPublish.pageIndex,
      pageSize:this.data.pageSize
    })
    if (res.code !== 0)return 

    if (res.data.count > myPublish.pageIndex*this.data.pageSize){
      myPublish.pageIndex++
    }else{
      this.setData({
        'myPublish.nomore':true
      })
    }

    this.setData({
      'myPublish.pageIndex': myPublish.pageIndex,
      'myPublish.projects':myPublish.projects.concat(res.data.list.map(project => {
        project.createTime = project.createTime.split(' ')[0].replace(/-/g, '.')
        if(project.projectSkill){
          project.projectSkill = project.projectSkill.split('|')
        }
        return project
      })),
      loading:false
    })
  },

  getMyApply:async function(){
    this.setData({
      loading: true
    })
    let myApply = this.data.myApply
    if (myApply.nomore || !this.props.stores.account.logged_in) return
    let res = await app.request.post('/project/projectInfo/myProjectList', {
      relationType: 2,
      projectState: myApply.states[myApply.currentState].dictValue,
      pageIndex: myApply.pageIndex,
      pageSize: this.data.pageSize
    })
    if (res.code !== 0) return

    if (res.data.count > myApply.pageIndex * this.data.pageSize) {
      myApply.pageIndex++
    } else {
      this.setData({
        'myApply.nomore': true
      })
    }

    this.setData({
      'myApply.pageIndex': myApply.pageIndex,
      'myApply.projects': myApply.projects.concat(res.data.list.map(project => {
        project.createTime = project.createTime.split(' ')[0].replace(/-/g, '.')
        if(project.projectSkill){
          project.projectSkill = project.projectSkill.split('|')
        }
        return project
      })),
      loading:false
    })
  }

}))