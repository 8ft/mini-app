Component({
  properties: {
    data:{
      type:Object,
      observer(newVal, oldVal, changedPath) {
        if(!newVal.questionName)return
        if(newVal.questionName.length>36){
          this.setData({
            'data.questionName':newVal.questionName.substring(0,30)+'...'
          })
        }

        const num=newVal.answerUsers.length
        if(num===0)return
        this.setData({
          imgsWidth:(num>4?4:num)*40+30
        })
      }
    },
    appearance: {
      type: String,
      value: 'normal'
    }
   
  },

  data: {

  },

  methods:{
    goDetail(e){
      this.setData({
        'data.viewNum':this.properties.data.viewNum+=1
      })
      wx.navigateTo({
        url: e.currentTarget.dataset.url
      })
    }
  }
})
