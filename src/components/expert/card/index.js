
const app = getApp()
const regeneratorRuntime = require('../../../libs/regenerator-runtime.js')

Component({
  properties: {
    data:Object,
    remarkable:{
      type:Boolean,
      value:false
    }
  },

  data:{
    remark:'',
    showRemarkBox:false
  },

  attached() {
    this.setData({
      remark:this.properties.data.talentRemark
    })
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
      this.setData({
        'data.followFlag':this.properties.data.followFlag===0?1:0
      })
    },

    _openRemarkBox:function(){
      this.setData({
        showRemarkBox:true
      })
    },

    _closeRemarkBox:function(){
      this.setData({
        remark:this.properties.data.talentRemark,
        showRemarkBox:false
      })
    },

    _delRemark:function(){
      this._remark('')
    },

    _updateRemark(e) {
      this._remark(e.detail.value.textarea)
    },

    _remark:async function(remark){
      let res = await app.request.post('/user/talent/followTalent', {
        action:1,
        talentRemark:remark,
        talentUserId:this.properties.data.userId
      })
      if (res.code !==0) return
      this.setData({
        'data.talentRemark':remark
      })

      this._closeRemarkBox()
    }
  }
})
