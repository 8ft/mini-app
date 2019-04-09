Component({
  properties: {
    qa:{
      type:Object,
      observer(newVal, oldVal, changedPath) {
        // const num=parseInt(newVal.answerNum)
        const num=4
        this.setData({
          imgsWidth:num*40+30
        })
      }
    }
   
  },

  data: {

  },

  methods:{
    goDetail(e){
      this.setData({
        'qa.viewNum':this.properties.qa.viewNum+=1
      })
      wx.navigateTo({
        url: e.currentTarget.dataset.url
      })
    }
  }
})
