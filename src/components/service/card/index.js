const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Component({
  properties: {
    index:Number,
    data:Object,
    appearance:{
      type:String,
      value:'normal'
    }
  },

  data:{
    activeActions:{
      0:{close:true},
      1:{close:true,pay:true},
      2:{payBack:true},
      3:{payBack:true,comfirm:true},
      4:{delete:true},
      5:{delete:true}
    }
  },

  methods:{
    _toStore:function(){
      wx.navigateTo({
        url:`/packageService/pages/store/index?id=${this.properties.data.storeId}`
      })
    },

    _update:function(e){
      const action=e.currentTarget.dataset.action
      
    },

    _collect:async function(){
      const res = await app.request.post('/store/collectionInfo/collect',{
        businessId:this.properties.data.id,
        type:1
      })
      if(res.code!==0)return
      this.triggerEvent('collect', { index: this.properties.index,flag:this.properties.data.collectFlag==0?1:0})
    }
  }
})
