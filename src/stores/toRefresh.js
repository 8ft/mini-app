const extendObservable = require('../libs/mobx').extendObservable;

const pages = {
  'login': [
    'index',
    'work',
    'publish',
    'project_list',
    'project_detail',
    'blog_list',
    'discover',
    'service-store',
    'service-index'
  ],
  'logout': [
    'index',
    'publish',
    'discover'
  ],
  'applied': [
    'index',
    'work',
    'project_list',
    'project_detail'
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