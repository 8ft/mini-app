Component({
  properties: {
    fixed:{
      type:Boolean,
      value:true
    },
    title:String,
    returnable:{
      type:Boolean,
      value:false
    },
    transparent:{
      type:Boolean,
      value:false
    }
  },

  data: {
    top:0
  },

  attached:function(){
    this.setData({
      returnable:getCurrentPages().length>1
    })

    wx.getSystemInfo({
      success: res=>{
        this.setData({
          top: res.statusBarHeight
        })
      }
    })
  },

  methods: {
    back:function(){
      wx.navigateBack()
    }
  }
})
