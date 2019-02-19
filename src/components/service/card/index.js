Component({
  properties: {
    data:Object
  },

  data:{
  },

  methods:{
    _toStore:function(){
      wx.navigateTo({
        url:`/packageService/pages/store/index?id=${this.properties.data.id}`
      })
    }
  }
})
