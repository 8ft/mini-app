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
    attached(){
      this.setData({
        top: wx.getSystemInfoSync().statusBarHeight
      })
    },
    ready () {
      wx.createSelectorQuery().in(this).select('#navBar').fields({
        size: true
      }, size => {
        this.setData({
          height:size.height
        })
        this.triggerEvent('ready', { height: size.height })
      }).exec()
    }
  }
})
