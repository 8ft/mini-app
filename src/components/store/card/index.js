
const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime

Component({
  properties: {
    index:Number,
    data:Object
  },

  methods:{
    _download:app.download,

    _toStore(){
      wx.navigateTo({
        url:`/packageService/pages/store/index?id=${this.properties.data.id}`
      })
    },

    async _collect(){
      if(!app.checkLogin())return
      const res = await app.request.post('/store/collectionInfo/collect',{
        businessId:this.properties.data.id,
        type:0
      })
      if (res.code !==0) return
      this.triggerEvent('collect', { index: this.properties.index,flag:this.properties.data.collectFlag==0?1:0})
    }
  }
})
