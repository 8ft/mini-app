
const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Component({
  properties: {
    index:Number,
    data:Object
  },

  methods:{
    _download:app.download,

    _collect:async function(){
      if(!app.checkLogin())return
      let res = await app.request.post('/user/talent/followTalent', {
        action:this.properties.data.followFlag===0?1:0,
        talentUserId:this.properties.data.userId
      })
      if (res.code !==0) return
      this.triggerEvent('collect', { index: this.properties.index,flag:this.properties.data.followFlag===0?1:0})
    }
  }
})
