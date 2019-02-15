Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  properties: {
    fixed:{
      type:Boolean,
      value:true
    },
    title:String,
    returnable:{
      type:Boolean,
      value:true
    },
    transparent:{
      type:Boolean,
      value:false
    }
  },

  lifetimes: {
    attached:function(){
      wx.getSystemInfo({
        success: res=>{
          this.setData({
            top: res.statusBarHeight
          })
        }
      })
    },
    ready: function () {
      wx.createSelectorQuery().in(this).select('#navBar').fields({
        size: true
      }, size => {
        this.setData({
          height:size.height
        })
      }).exec()
    }
  },

  methods: {
    back:function(){
      wx.navigateBack()
    }
  }
})
