Component({
  properties: {
    qa:{
      type:Object,
      observer(newVal, oldVal, changedPath) {
        if(!newVal.questionName)return
        if(newVal.questionName.length>36){
          this.setData({
            'qa.questionName':newVal.questionName.substring(0,30)+'...'
          })
        }

        const num=newVal.answerUsers.length
        if(num===0)return
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
