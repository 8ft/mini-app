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

  methods: {
    _hide:function(){
      this.triggerEvent('hide')
      this.setData({
        active: false
      })
    }
  }
})
