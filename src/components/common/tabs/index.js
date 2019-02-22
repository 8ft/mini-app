// 由于切换动画需要300毫秒，存在短时间内多次切换的情况。
// 为此所有切换请求都先录入toActiveArr。
// 待没用动画进行，即processing=false时，处理toActiveArr最后一个，并清空toActiveArr。
let processing = false
let timeoutId = ''
let toActiveArr = []

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    active: {
      type: Number,
      value:0,
      observer(newVal, oldVal, changedPath) {
        this._selectTab(newVal)
      }
    },
    tabs: Array,
    fixed: {
      type: Boolean,
      value: false
    },
    underLineRatio: {
      type: Number,
      value: 1
    }
  },
  data: {
    animationData: null,
    scrollLeft: 0
  },

  lifetimes: {
    attached: function () {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease',
      })
      this.animation = animation
      this.windowWidth = wx.getSystemInfoSync().windowWidth
    },
    ready: function () {
      this._selectTab(0)
    }
  },

  pageLifetimes: {
    hide: function () {
      clearTimeout(timeoutId)
    }
  },

  methods: {
    _tabClick: function (e) {
      let index = e.currentTarget.dataset.index
      if (index !== this.data.active) {
        this.setData({
          active:index
        })
        this.triggerEvent('change', { index: index })
      }
    },
    _selectTab: function (tabIndex) {
      if (tabIndex!==undefined) toActiveArr.push(tabIndex)
      if (processing) return
      processing = true

      const query = wx.createSelectorQuery().in(this)
      query.select('#scrollView').scrollOffset()

      let toActiveIndex = toActiveArr.pop()
      toActiveArr = []
      query.select(`#tab${toActiveIndex}`).boundingClientRect()

      query.exec(e => {
        const ratio = this.properties.underLineRatio
        const width = e[1].width * ratio
        const diff = e[1].width * (1 - ratio) / 2
        const x = e[0].scrollLeft + e[1].left + diff
        this.setData({
          animationData: this.animation.width(width).translateX(x).step().export(),
          scrollLeft: x - this.windowWidth / 2 + width / 2
        })

        timeoutId = setTimeout(() => {
          processing = false
          if (toActiveArr.length > 0) {
            this._selectTab()
          }
        }, 350);
      })

    }
  }
})
