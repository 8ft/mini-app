Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    tabs: Array,
    active: {
      type: Number,
      value: -1,
      observer(newVal, oldVal, changedPath) {
        wx.nextTick(() => {
          this._selectTab(newVal)
        })
      }
    },
    fixed: {
      type: Boolean,
      value: false
    },
    center: {
      type: Boolean,
      value: false
    },
    margin:{
      type:Number,
      value:34
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
    attached() {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease',
      })
      this.animation = animation
      this.windowWidth = wx.getSystemInfoSync().windowWidth
    },
    ready() {
      if (this.properties.active === -1) {
        this._selectTab(0)
      }
    }
  },

  methods: {
    _tabClick(e) {
      let index = e.currentTarget.dataset.index
      if (index !== this.data.active) {
        this.setData({
          active: index
        })
        this.triggerEvent('change', { index: index })
      }
    },
    _selectTab(tabIndex) {
      const query = wx.createSelectorQuery().in(this)
      query.select('#tabs').fields({
        rect: true,
        scrollOffset: true
      })
      query.select(`#tab${tabIndex}`).boundingClientRect()
      query.exec(e => {
        const ratio = this.properties.underLineRatio
        const scrollView = e[0]
        const tab = e[1]

        const width = tab.width * ratio
        const diff = tab.width * (1 - ratio) / 2
        const x = scrollView.scrollLeft + tab.left + diff - scrollView.left

        this.setData({
          animationData: this.animation.width(width).translateX(x).step().export(),
          scrollLeft: x - this.windowWidth / 2 + width / 2
        })
      })
    }
  }
})
