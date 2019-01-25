const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    dicts: [],
    time: [
      { name: '不限', begin: '' },
      { name: '最近3天', begin: '' },
      { name: '最近一周', begin: '' },
      { name: '最近一月', begin: '' }
    ],

    typeIndex:-1,
    budgetIndex:-1,
    cycleIndex:-1,
    timeIndex:0,

    filter:'',

    loading:true,
    pageIndex: 1,
    projects: [],
    nomore: false
  },

  onShareAppMessage: function (res) {
    return {
      title: '好项目很多，人才库告急！'
    }
  },

  onLoad:async function (options) {
    this.data.time.map(item=>{
      item.begin=this.getDate(item.name)||''
    })

    let typeIndex = options.type
    if (typeIndex !== undefined) {
      this.setData({
        typeIndex: parseInt(typeIndex)
      })
    }
  },

  onShow:function(){
    this.props.stores.toRefresh.refresh('project_list',async(exist)=>{
      if(this.data.dicts.length===0){
        await this.getDicts()
        this.getProjects()
      } else if(exist){
        this.refresh()
      }
    })
  },

  onPullDownRefresh: function () {
    this.refresh()
  },

  onReachBottom: function () {
    this.getProjects()
  },

  refresh: function () {
    this.setData({
      pageIndex: 1,
      projects: [],
      nomore: false
    })
    this.getProjects()
  },

  getDate:function(daysAgo){
    let date = new Date(),
      curYear = date.getFullYear(),
      curMonth = date.getMonth() + 1,
      curDate = date.getDate(),

      preYear = curMonth === 1 ? (curYear-1) :curYear,
      preMonth = curMonth===1?12:(curMonth-1),
      preMonthDaysCount = new Date(preYear, preMonth, 0).getDate()
      
      let preDate,
        year,
        month
      switch(daysAgo){
        case '最近3天':
          month = curDate <= 3 ? preMonth : curMonth
          year = month > curMonth ? preYear : curYear
          preDate = curDate <= 3 ? preMonthDaysCount : (curDate - 3)
          return year + '-' + month + '-' + preDate
          break;
        case '最近一周':
          month = curDate <= 7 ? preMonth:curMonth
          year=month>curMonth?preYear:curYear
          preDate=curDate<=7?preMonthDaysCount:(curDate-7)
          return year+'-'+month+'-'+preDate
          break;
        case '最近一月':
          preDate = curDate > preMonthDaysCount ? preMonthDaysCount : curDate
          return preYear + '-' + preMonth + '-' + preDate
          break;
      }
  },

  getDicts: async function () {
    let res = await app.request.post('/dict/dictCommon/getDicts', {
      dictType: 'project_type|price_budget|project_cycle',
      resultType: '1'
    })

    if(res.code===0){
      this.setData({
        dicts: this.data.dicts.concat(res.data.data)
      })
    }
  },

  getProjects: async function () {
    this.setData({
      loading:true
    })
    let nomore = this.data.nomore
    if (nomore) return

    let data = this.data,
      pIndex = data.pageIndex,
      dicts=data.dicts

    let res = await app.request.post('/project/projectInfo/getList', {
      projectType: data.typeIndex<0?'':dicts[0].dictList[data.typeIndex].dictValue,
      priceBudget: data.budgetIndex<0?'':dicts[1].dictList[data.budgetIndex].dictValue,
      projectCycle: data.cycleIndex<0?'':dicts[2].dictList[data.cycleIndex].dictValue,
      beginTime:data.time[data.timeIndex].begin,
      pageIndex: pIndex,
      pageSize: 10
    })

    if(res.code===0){

      if (res.data.page > pIndex) {
        pIndex++
      } else {
        nomore = true
      }

      this.setData({
        projects: this.data.projects.concat(res.data.list.map((project) => {
          project.projectSkill = project.projectSkill.split('|')
          return project
        })),
        pageIndex: pIndex,
        nomore: nomore,
        loading: false
      })
    }

    wx.stopPullDownRefresh()
  },

  filter:function(e){
    let data=e.currentTarget.dataset
    switch(data.type){
      case 'type':
        this.setData({
          typeIndex:data.index
        })
      break;
      case 'budget':
        this.setData({
          budgetIndex: data.index
        })
        break;
      case 'cycle':
        this.setData({
          cycleIndex: data.index
        })
        break;
      case 'time':
        this.setData({
          timeIndex: data.index
        })
        break;
    }

    this.setData({
      nomore: false,
      pageIndex: 1,
      projects: []
    })
    this.getProjects()
    this.close()
  },

  select: function (e) {
    if(this.data.filter){
      this.setData({
        filter:''
      })
    }else{
      this.setData({
        filter: e.currentTarget.dataset.name
      })
    }
  },
  close:function(){
    this.setData({
      filter: ''
    })
  }
}))