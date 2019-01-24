const util=require('../../../utils/util.js')

Component({
  externalClasses: ['custom-class'],
  properties: {
    data:{
      type:Object,
      observer(newVal, oldVal, changedPath) {
        let state=[]
        if(newVal.topFlag===1){
          state.push('置顶')
        }

        switch(newVal.articleState){
          case 0:
            state.push('审核中')
          break;
          case 2:
            state.push('审核未通过')
          break;
          case 3:
            state.push('已下架')
          break;
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
    state:[]
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
