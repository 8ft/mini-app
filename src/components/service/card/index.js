const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Component({
  properties: {
    data:Object,
    appearance:{
      type:String,
      value:'normal'
    }
  },

  data:{
  },

  methods:{
    _toStore:function(){
      wx.navigateTo({
        url:`/packageService/pages/store/index?id=${this.properties.data.id}`
      })
    },

    _collect:async function(){
      const res = await app.request.post('/store/collectionInfo/collect',{
        businessId:this.properties.data.id,
        type:1
      })
      if(res.code!==0)return
      this.setData({
        'data.collectFlag':this.properties.data.collectFlag==='0'?'1':'0'
      })
    },
    
  }
})
