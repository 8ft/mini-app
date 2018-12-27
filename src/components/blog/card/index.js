const util=require('../../../utils/util.js')

Component({
  properties: {
    data:{
      type:Object,
      observer(newVal, oldVal, changedPath) {
        let state=''
        switch(newVal.articleState){
          case 0:
            state='待审核'
          break;
          case 2:
            state='不通过'
          break;
          case 3:
            state='下架'
          break;
        }

        if(newVal.topFlag===1){
          state='置顶'
        }

        this.setData({
          state:state
        })
      }
    },
    showAuthor:{
      type:Boolean,
      value:false
    }
  },

  data:{
    state:''
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
