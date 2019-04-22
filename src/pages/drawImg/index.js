Page({
  onLoad() {
    this.ratio = wx.getSystemInfoSync().windowWidth / 750

    const ctx = wx.createCanvasContext('canvas')
    
    ctx.setFontSize(36*this.ratio)
    this.drawText('如果只是做一款小程序可以流程，那么这样是否可以能够改变一些原来没有的东西呢，如果可以的这样子的 ？1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111',ctx)

    ctx.draw()

    // wx.chooseImage({
    //   success:res=> {
    //     ctx.moveTo(0,0)
    //     ctx.drawImage(res.tempFilePaths[0], 30, 50, 220, 110)
    //   },
    //   complete(){
    //     ctx.draw()
    //   }
    // })
  },

  drawText(str,ctx){
    let arr = []
    const rowWidth=456*this.ratio
    if (ctx.measureText(str).width>rowWidth){
      let row=''
      for(let i=0;i<str.length;i++){
        row += str[i]
        if (ctx.measureText(row).width>rowWidth){
          arr.push(row.slice(0, -1))
          --i
          row=''
        }else if(i===str.length-1){
          arr.push(row)
        }
      }
    }else{
      arr.push(str)
    }

    const canvasWidth=590*this.ratio
    const canvasHeight=(300+40*arr.length)*this.ratio

    this.setData({
      canvasWidth:canvasWidth,
      canvasHeight:canvasHeight
    })

    ctx.setFillStyle('#4F7EF3')
    ctx.fillRect(0, 0, canvasWidth,canvasHeight)

    ctx.setFillStyle('#fff')
    arr.forEach((row,index)=>{
      ctx.fillText(row, 66*this.ratio,163*this.ratio+40*this.ratio*index)
    })
    
  },

  save(){
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.data.canvasWidth,
      height: this.data.canvasHeight,
      destWidth: 1080,
      destHeight:this.data.canvasHeight/this.data.canvasWidth*1080,
      canvasId: 'canvas',
      success(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          complete(result) {
            wx.showToast({
              icon:'none',
              title:result.errMsg
            })
          }
        })
      }
    })
  },

  auth(){
    wx.getSetting({
      success:res=> {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success:()=> {
              this.save()
            }
          })
        }else{
          this.save()
        }
      }
    })
  }

})
