
const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime

Component({
  properties: {
    index:Number,
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

    async _collect(){
      if(!app.checkLogin())return
      let res = await app.request.post('/user/talent/followTalent', {
        action:this.properties.data.followFlag===0?1:0,
        talentUserId:this.properties.data.userId
      })
      if (res.code !==0) return
      this.triggerEvent('collect', { index: this.properties.index,flag:this.properties.data.followFlag===0?1:0})
    },

    _addRemark(){
      if(this.properties.data.talentRemark)return
      this._openRemarkBox()
    },

    _openRemarkBox(){
      this.setData({
        showRemarkBox:true
      })
    },

    _closeRemarkBox(){
      this.setData({
        remark:this.properties.data.talentRemark,
        showRemarkBox:false
      })
    },

    _delRemark(){
      this._remark('')
    },

    _updateRemark(e) {
      this._remark(e.detail.value.textarea)
    },

    async _remark(remark){
      let res = await app.request.post('/user/talent/followTalent', {
        action:1,
        talentRemark:remark,
        talentUserId:this.properties.data.userId
      })
      if (res.code !==0) return
      this.triggerEvent('remark', { index: this.properties.index,remark:remark})
      this._closeRemarkBox()
    }
  }
})
