Component({
  externalClasses: ['custom-class'],

  properties: {
    title:String,
    returnable:{
      type:Boolean,
      value:true
    }
  },

  data: {
    top:0,
    height:0
  },

  attached:function(){
    wx.getSystemInfo({
      success: res=>{
        this.setData({
          top: res.statusBarHeight
        })
      },
    })
  },

  ready:function(){
    const query = wx.createSelectorQuery().in(this)
    query.select('#appHeader').fields({
      size: true
    }, (res) => {
      this.setData({
        height: res.height
      })
    }).exec()
  },

  methods: {
    back:function(){
      wx.navigateBack()
    }
  }
})
