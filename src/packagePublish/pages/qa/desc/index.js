const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime
const upload = require('../../../../api/upload')

Page({
  data: {
    titleLen: -1,
    descLen: -1,
    batchNo: '',
    imgs: [],
    keyboardHeight: 0
  },

  onLoad(options) {
    const cache = wx.getStorageSync('questionCache')
    if(!cache)return 
    this.setData(cache)
  },

  save(){
    //还原底部栏位置
    if(this.data.keyboardHeight){
      this.setData({
        keyboardHeight: 0
      })
    }

    if(!this.data.title){
      wx.showToast({
        title: '请输入问题标题',
        icon:'none'
      })
      return
    }

    if(!this.data.desc){
      wx.showToast({
        title: '请输入问题描述',
        icon:'none'
      })
      return
    }

    wx.setStorageSync('questionCache', this.data)
    wx.navigateBack()
  },

  setFocusPostion(e) {
    this.setData({
      keyboardHeight: e.detail.height||0
    })
  },

  setBlurPostion(e) {
    this.setData({
      keyboardHeight: 0
    })
  },

  input(e) {
    const name = e.currentTarget.dataset.name
    const maxLen=(name==='title'?60:500)

    let input = e.detail.value
    if(name==='title'){
      input=input.replace(/^[\s\r\n]*|[\r\n]*|[\s\r\n]*$/g, "").replace(/\s{2,}/g,' ')
    }

    let validInput = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
    let conLen = validInput.length
    if(conLen>maxLen){
      input = input.slice(0, maxLen)
      validInput = input.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, "")
      conLen = validInput.length
    }

    let inputLen
    if(conLen===maxLen){
      inputLen = maxLen
    }else if(conLen<maxLen){
      inputLen = -1
    }

    if(name==='title'){
      this.setData({
        titleLen:inputLen,
        title: input
      })
    }else{
      this.setData({
        descLen:inputLen,
        desc: input
      })
    }
  },

  chooseImage() {
    let count = 3 - this.data.imgs.length
    wx.chooseImage({
      count: count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async res => {
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

  async delImg(e) {
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

  preview(e) {
    let curUrl = e.currentTarget.dataset.url
    let urls = this.data.imgs.map(img => {
      return img.url
    })
    wx.previewImage({
      urls: urls,
      current: curUrl
    })
  }

})