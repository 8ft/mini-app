const app = getApp()
const regeneratorRuntime = require('../../../../libs/regenerator-runtime.js')
const observer = require('../../../../libs/observer').observer;

Page(observer({
  props: {
    stores: app.stores
  },

  data: {
    id:'',
    budget:'',
    price:'',
    desc: '',
    conLen: 0,
    inputLen: -1,
    disagree:false
  },

  onLoad: function (options) {
    this.setData({
      id:options.id,
      budget: options.budget
    })
  },

  input: function (e) {
    const inputType = e.currentTarget.dataset.type
    let input = e.detail.value
    let validInput = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
   
    switch (inputType) {
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
      case 'desc':
        let conLen = validInput.length
        if (conLen > 100) {
          input = input.slice(0, 100)
          validInput = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
          conLen = validInput.length
        }
        let inputLen
        if (conLen === 100) {
          inputLen = 100
        } else if (conLen < 100) {
          inputLen = -1
        }
        this.setData({
          desc: input,
          conLen: conLen,
          inputLen: inputLen
        })
        break;
    }
  },

  setAgree:function(){
    this.setData({
      disagree:!this.data.disagree
    })
  },

  send: async function () {
    if (!app.checkLogin()) return 
    let data = this.data
    if (!data.price) {
      wx.showToast({
        title: '请输入您的报价',
        icon: 'none'
      })
      return
    }
    if (!data.desc) {
      wx.showToast({
        title: '请输入申请说明',
        icon: 'none'
      })
      return
    }

    let res = await app.request.post('/project/projectApply/save', {
      projectId: data.id,
      applyDesc: data.desc,
      projectOffer: data.price
    })
    if (res.code === 0) {
      wx.showToast({
        title: '发送成功',
        icon: 'none'
      })
      this.props.stores.toRefresh.updateList('applied')
      wx.navigateBack()
    }
  }
}))