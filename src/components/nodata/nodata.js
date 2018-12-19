// components/nodata/nodata.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    name:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    contents:{
      'projects':{
        img:'/assets/img/default/no-project.png',
        text:'空空如也，什么都没有～'
      },
      'myPublish': {
        img: '/assets/img/default/no-project.png',
        text: '还没有项目哦，快去发布OR申请~'
      },
      'myApply': {
        img: '/assets/img/default/no-project.png',
        text: '还没有申请过项目呢~'
      },
      'myProjects': {
        img: '/assets/img/default/no-project.png',
        text: '登录了就能开始处理工作了喔~',
        login:true
      },
      'publish': {
        img: '/assets/img/default/no-project.png',
        text: '登录了就能发布项目了喔~',
        login: true
      },
      'wallet': {
        img: '/assets/img/default/no-project.png',
        text: '您暂时还没有收支明细记录哦~'
      },
      'city': {
        img: '/assets/img/default/no-project.png',
        text: '努力加载中'
      },
      'bolgReply':{
        img: '/assets/img/default/no-project.png',
        text: '还没有人评论哦~快来抢沙发吧'
      },
      'bolgListMyFollow':{
        img: '/assets/img/default/no-project.png',
        text: '登录后可以查看更多内容哦',
        login: true
      }
    }
  },

  methods: {

  }
})
