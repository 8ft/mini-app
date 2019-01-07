Component({
  externalClasses: ['custom-class'],
  properties: {
    active: {
      type: Number,
      value: 0,
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

      wx.getSystemInfo({
        success: res => {
          this.windowWidth = res.windowWidth
        }
      })
    },
    ready: function () {
      if (this.data.animationData) return
      this._selectTab(this.properties.active)
    }
  },

  pageLifetimes: {
    show: function () {
      this._selectTab(this.properties.active)
    }
  },

  methods: {
    _tabClick: function (e) {
      let index = e.currentTarget.dataset.index
      if (index !== this.data.active) {
        this._selectTab(index)
        this.triggerEvent('change', { index: index })
      }
    },
    _selectTab: function (index) {
      wx.createSelectorQuery().in(this).select('#scrollView').fields({
        scrollOffset: true
      }, sv => {
        wx.createSelectorQuery().in(this).select(`#tab${index}`).fields({
          size: true,
          rect: true
        }, (res) => {
          const ratio = this.properties.underLineRatio
          const width = res.width * ratio
          const diff = res.width * (1 - ratio) / 2
          const x = sv.scrollLeft + res.left + diff
          this.setData({
            active: index,
            animationData: this.animation.width(width).translateX(x).step().export(),
            scrollLeft: x - this.windowWidth / 2 + width / 2
          })
        }).exec()
      }).exec()
    }
  }
})
