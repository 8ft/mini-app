Component({
  properties: {
    project:Object
  },

  data: {
    uid:'',
    bg:{
      1:'#4db2ff',
      10:'#4db2ff',
      14:'#4db2ff',

      2:'#1ac6a4',
      5:'#1ac6a4',
      6:'#1ac6a4',
      7:'#1ac6a4',

      3:'#fc5b31',
      9:'#fc5b31',
      13:'#fc5b31',

      4:'#f9b337',
      8:'#95d364',

      11:'#ccc',
      12:'#ccc',
    }
  },

  attached:function(){
    let user = wx.getStorageSync('account')
    if (user) {
      this.setData({
        uid: user.userId
      })
    }
  },

  methods:{
    _toApplicant:function(){
      wx.navigateTo({
        url:`/packageExpert/pages/applicant/index?id=${this.data.project.id}`
      })
    }
  }
})
