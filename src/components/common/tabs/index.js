// components/tabs/tabs.js
Component({
  externalClasses:['custom-class'],
  properties: {
    active:{
      type:Number,
      value:0,
    },
    tabs: Array,
    fixed:{
      type:Boolean,
      value:false
    },
    underLineRatio:{
      type:Number,
      value:1
    }
  },
  data: {
    animationData:null
  },

  lifetimes: {
    attached: function () {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease',
      })
      this.animation = animation
    },
    ready:function(){
      if(this.data.animationData)return
      this.selectTab(this.properties.active)
    }
  },

  pageLifetimes: {
    show: function () {
      this.selectTab(this.properties.active)
    }
  },

  methods: {
    tabClick: function (e) {
      let index = e.currentTarget.dataset.index
      if (index!==this.data.active){
        this.selectTab(index)
        this.triggerEvent('change', { index: index})
      }
    },
    selectTab:function(index){
      wx.createSelectorQuery().in(this).select('#scrollView').fields({
        scrollOffset:true
      },sv=>{

        wx.createSelectorQuery().in(this).select(`#tab${index}`).fields({
          size: true,
          rect:true
        }, (res) => {
          const ratio=this.properties.underLineRatio
          const width = res.width *ratio
          const diff=res.width*(1-ratio)/2

          this.setData({
            active: index,
            animationData: this.animation.width(width).translateX(sv.scrollLeft+res.left + diff).step().export()
          })
        }).exec()

      }).exec()
    }
  }
})
