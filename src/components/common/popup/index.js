// components/common/popup/index.js
Component({

  properties: {
    active:{
      type:Boolean,
      value: false
    },
    top:{
      type:String,
      value:'0'
    }
  },

  data: {
   
  },

  methods: {
    hide:function(){
      this.triggerEvent('hide')
      this.setData({
        active: false
      })
    }
  }
})
