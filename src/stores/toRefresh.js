const extendObservable = require('../libs/mobx').extendObservable;

/**
 * 页面刷新管理
 * 某些操作之后，将需要刷新的页面注入刷新队列。
 * 待打开这些页面时，根据是否在队列中决定刷新与否
 */

//操作对应的需要更新的页面
const pages = {
  //登录
  'login': [
    'index',
    'work',
    'publish',
    'project_list',
    'project_detail',
    'blog_list',
    'discover',
    'service_store',
    'service_index'
  ],

  //登出
  'logout': [
    'index',
    'publish',
    'discover'
  ],

  //申请项目
  'applied': [
    'index',
    'work',
    'project_list',
    'project_detail'
  ],

  //收藏
  'collect':[
    'mine_collection'
  ]
}

const toRefresh = function () {
  extendObservable(this, {
    list: []
  })

  this.updateList = scene => {
    pages[scene].forEach(page => {
      this.add(page)
    })
  }

  this.add = page => {
    if (!this.list.includes(page)) {
      this.list.push(page)
    }
  }

  this.refresh = (page, callBack) => {
    const index = this.list.indexOf(page)
    const exist = index > -1
    if (exist) {
      this.list.splice(index, 1)
    }
    callBack(exist)
  }
}

module.exports = new toRefresh