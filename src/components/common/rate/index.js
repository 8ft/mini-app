Component({
  properties: {
    height:String,
    size: {
      type: Number,
      value: 25
    },
    margin: {
      type: Number,
      value: 26
    },
    max: {
      type: Number,
      value: 5
    },
    readonly: {
      type: Boolean,
      value: false
    },
    name: String,
    value: {
      type: Number,
      value: -1,
      observer(newVal, oldVal, changedPath) {
        if (!this.properties.readonly) return
        const margin = Math.floor(this.properties.margin*this.ratio)
        const size = Math.floor(this.properties.size*this.ratio)

        this.setData({
          coverWidth:size * newVal + margin * Math.floor(newVal),
          val: newVal
        })
      }
    }
  },

  lifetimes: {
    created: function () {
      this.ratio = wx.getSystemInfoSync().windowWidth / 750
    }
  },

  data: {
    results: {
      '-1': '',
      0: '非常差',
      1: '差',
      2: '一般',
      3: '好',
      4: '非常好'
    }
  },

  methods: {
    _rate(e) {
      let point = e.currentTarget.dataset.point
      this.setData({
        value: point
      })
      this.triggerEvent('rate', {name:this.properties.name, point: point++ })
    }
  }
})
