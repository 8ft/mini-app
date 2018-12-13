// components/common/actionBar/index.js

let isIPX=false

Component({
  externalClasses:['custom-class'],
  options: {
    addGlobalClass: true,
  },
  properties: {

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
  },

  methods: {
  
  }
})
