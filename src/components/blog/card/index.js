// components/project/card/card.js
Component({
  properties: {
    data:Object,
    showAuthor:{
      type:Boolean,
      value:false
    }
  },

  methods:{
    goDetail:function(e){
      this.setData({
        'data.viewNum':this.properties.data.viewNum+=1
      })
      wx.navigateTo({
        url: e.currentTarget.dataset.url
      })
    }
  }
})
