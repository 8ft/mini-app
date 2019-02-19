let isIPX=false

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

  data: {
    isIPX:false
  },

  created:function(){
    wx.getSystemInfo({
      success: function(res) {
        if(/iPhone X/.test(res.model))
          isIPX=true
        }
     })
  },

  attached:function(){
    this.setData({
      isIPX:isIPX
    })
  }
})
