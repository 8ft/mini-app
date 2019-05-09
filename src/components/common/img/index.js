const defaultImg={
  'avatar':'/assets/img/default/avatar.png'
}

Component({
  options: {
    addGlobalClass: true,
  },
  
  properties: {
    type:String,
    mode:String,
    src:String,
    lazy:Boolean
  },

  methods: {
    _error(){
      this.setData({
        src:defaultImg[this.properties.type]
      })
    }
  }
})


