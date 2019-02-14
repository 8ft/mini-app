Component({
  properties: {
    fixed:{
      type:Boolean,
      value:true
    },
    title:String,
    returnable:{
      type:Boolean,
      value:true
    }
  },

  data: {
    top:0
  },

  attached:function(){
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
