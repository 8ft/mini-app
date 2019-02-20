const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')
const upload = require('../../../api/upload.js')

Page({

  data: {
    content:'',
    inputLen:-1,
    conLen:0,
    demoShow:false,

    batchNo:'',
    imgs:[],
    
    height:''
  },

  onLoad: function (options) {
    const systemInfo=wx.getSystemInfoSync()
    let cache = app.globalData.publishDataCache.desc
    this.setData({
      height: systemInfo.windowHeight * 750 / systemInfo.windowWidth - 300,
      content: cache.content.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, ""),
      inputLen: cache.inputLen||-1,
      conLen: cache.conLen||0,
      batchNo: cache.batchNo||'',
      imgs:cache.imgs||[]
    })
  },

  onUnload: function () {
    if(this.data.imgs.length===0){
      this.data.batchNo=''
    }
    app.globalData.publishDataCache.desc = this.data
  },

  input:function(e){
    let input = e.detail.value
    let validInput = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
    let conLen = validInput.length

    if(conLen>5000){
      input = input.slice(0, 5000)
      validInput = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
      conLen = validInput.length
    }

    let inputLen
    if(conLen===5000){
      inputLen = 5000
    }else if(conLen<5000){
      inputLen = -1
    }
    
    this.setData({
      content: input,
      conLen: conLen,
      inputLen:inputLen
    })
  },

  hideDemo:function(){
    this.setData({
      demoShow:false
    })
  },

  showDemo:function(){
    this.setData({
      demoShow: true
    })
  },

  chooseImage: function () {
    let count = 3 - this.data.imgs.length
    wx.chooseImage({
      count: count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success:async res => {
        let batchNo = this.data.batchNo
        let imgs = await upload(res.tempFiles, '1108', batchNo)
        if (!batchNo) {
          this.setData({
            batchNo: imgs[0].batchNo
          })
        }
        this.setData({
          imgs: this.data.imgs.concat(imgs)
        })
      }
    })
  },

  delImg:async function(e){
    let res = await app.request.post('/public/file/delete', {
      fileId: this.data.imgs[e.currentTarget.dataset.index].fileId
    })

    if (res.code === 0) {
      this.data.imgs.splice(e.currentTarget.dataset.index, 1)
      this.setData({
        imgs: this.data.imgs
      })
    }
  },

  preview:function(e){
    let curUrl=e.currentTarget.dataset.url
    let urls=this.data.imgs.map(img=>{
      return img.url
    })
    wx.previewImage({
      urls:urls,
      current:curUrl
    })
  }

})