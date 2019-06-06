const app = getApp()
const regeneratorRuntime = app.regeneratorRuntime
const upload=require('../../../../api/upload')

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

  onLoad (options) {
    let cache = app.globalData.publishDataCache.desc
    this.setData({
      content: cache.content.replace(/(^[\s\r\n]*)|([\s\r\n]*$)/g, ""),
      inputLen: cache.inputLen||-1,
      conLen: cache.conLen||0,
      batchNo: cache.batchNo||'',
      imgs:cache.imgs||[]
    })
  },

  onUnload () {
    if(this.data.imgs.length===0){
      this.data.batchNo=''
    }
    app.globalData.publishDataCache.desc = this.data
  },

  getNavHeight(e) {
    const systemInfo = wx.getSystemInfoSync()
    const ratio = systemInfo.windowWidth / 750
    this.setData({
      height: systemInfo.windowHeight - e.detail.height-300*ratio
    })
  },

  input(e){
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

  hideDemo(){
    this.setData({
      demoShow:false
    })
  },

  showDemo(){
    this.setData({
      demoShow: true
    })
  },

  chooseImage () {
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

  async delImg(e){
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

  preview(e){
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