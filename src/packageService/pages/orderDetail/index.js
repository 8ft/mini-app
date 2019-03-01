const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

const progress={
  0:0,
  1:33,
  2:66,
  3:100
}

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    id:'',
    character:'',
    detail:null,
    progress:0
  },

  onLoad:function(options){
    this.setData({
      id:options.id
    })
    this.getDetail()
  },

  getDetail: async function (){
    let res = await app.request.post('/store/productOrderInfo/detail', {
      productOrderId: this.data.id
    })
    if(res.code!==0)return
    this.setData({
      detail:res.data,
      progress:progress[res.data.businessState]
    })
  },
 
  download: app.download

}))