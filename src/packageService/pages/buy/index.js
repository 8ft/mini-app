const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const observer = require('../../../libs/observer').observer

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    id:'',
    desc: '',
    price:'',
    dayCost:'',
    conLen: 0,
    inputLen: -1
  },

  onLoad: function (options) {
    const data=wx.getStorageSync('serviceInfo')
    this.setData({
      serviceInfo:data.service,
      storeInfo:data.store,
      id:options.id
    })
  },

  onUnload:function(){
    wx.removeStorageSync('serviceInfo')
  },

  input: function (e) {
    const inputType = e.currentTarget.dataset.type
    let input = e.detail.value
    let validInput = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
   
    switch (inputType) {
      case 'desc':
        let conLen = validInput.length
        if (conLen > 1000) {
          input = input.slice(0, 1000)
          validInput = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
          conLen = validInput.length
        }
        let inputLen
        if (conLen === 1000) {
          inputLen = 1000
        } else if (conLen < 1000) {
          inputLen = -1
        }
        this.setData({
          desc: input,
          conLen: conLen,
          inputLen: inputLen
        })
        break;

        case 'price':
          if(validInput.length>0&&!/^[1-9]\d{0,6}\.{0,1}\d{0,2}$/.test(validInput)){
            validInput=this.data.price
          }else if(validInput.length>7&&/^\d*$/.test(validInput)){
            validInput=validInput.slice(0,7)
          }
          this.setData({
            price: validInput
          })
        break;

        case 'dayCost':
          if(validInput.length>0&&!/^[1-9]\d{0,4}$/.test(validInput)){
            validInput=this.data.dayCost
          }else if(validInput.length>4&&/^\d*$/.test(validInput)){
            validInput=validInput.slice(0,4)
          }
          this.setData({
            dayCost: validInput
          })
        break;
    }
  },

  formSubmit: async function (e) {
    if (!this.data.desc) {
      wx.showToast({
        title: '请输入需求描述',
        icon: 'none'
      })
      return
    }

    let data=e.detail.value
    if(!data.phone&&!data.wechat){
      wx.showToast({
        title: '联系方式至少填写一个',
        icon: 'none'
      })
      return
    }else if(data.phone&&!/^0?1[3|4|5|8|7][0-9]\d{8}$/.test(data.phone)){
      wx.showToast({
        title: '手机号码格式有误',
        icon: 'none'
      })
      return
    }else if(data.wechat&& ! /[-_a-zA-Z0-9]{5,19}$/.test(data.wechat)){
      wx.showToast({
        title: '请输入正确的微信号',
        icon: 'none'
      })
      return
    }

    if (!data.price) {
      wx.showToast({
        title: '请输入服务金额',
        icon: 'none'
      })
      return
    }

    if (!data.dayCost) {
      wx.showToast({
        title: '请输入天数',
        icon: 'none'
      })
      return
    }
   
    let res = await app.request.post('/store/productOrderInfo/addProductOrder', {
      productId: this.data.id,
      requirements: this.data.desc,
      deliveryDays: data.dayCost,
      price:data.price,
      linkMobile: data.phone||'',
      linkWeixin: data.wechat||''
    })
    if (res.code !== 0) return
    
  }
}))