// components/common/popup/index.js
Component({

  properties: {
    position:{
      type:String,
      value:'top'
    },
    active:{
      type:Boolean,
      value: false
    },
    margin:{
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
