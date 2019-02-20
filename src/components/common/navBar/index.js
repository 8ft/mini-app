Component({
  options: {
    addGlobalClass: true,
  },
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
    },
    placeholder:{
      type:Boolean,
      value:true
    }
  },

  lifetimes: {
    attached:function(){
      this.setData({
        top: wx.getSystemInfoSync().statusBarHeight
      })
    },
    ready: function () {
      wx.createSelectorQuery().in(this).select('#navBar').fields({
        size: true
      }, size => {
        this.setData({
          height:size.height
        })
        this.triggerEvent('ready', { height: size.height })
      }).exec()
    }
  },

  methods: {
    back:function(){
      wx.navigateBack()
    }
  }
})
