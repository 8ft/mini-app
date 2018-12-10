// components/common/actionBar/index.js


Component({
  externalClasses:['custom-class'],
  properties: {

  },

  data: {
    isIPX:false
  },

  attached:function(){
    this.setData({
      isIPX:wx.getStorageSync('isIPX')||false
    })
  },

  methods: {
  
  }
})
