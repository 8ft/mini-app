Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    position:{
      type:String,
      value:'fixed'
    }
  },

  attached(){
    this.setData({
      isIPX:/iPhone X/.test(wx.getSystemInfoSync().model)
    })
  }
})
