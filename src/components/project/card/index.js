Component({
  properties: {
    project:Object
  },

  data: {
    uid:'',
    bg:{
      1:'#4db2ff',
      4:'#4db2ff',

      '51':'#1ac6a4',
      '52':'#4db2ff',

      2:'#1ac6a4',
      6:'#1ac6a4',
      7:'#1ac6a4',

      3:'#fc5b31',
      9:'#fc5b31',
      13:'#fc5b31',

      8:'#96D364',
      10:'#96D364',
      14:'#96D364',

      11:'#ccc',
      12:'#ccc',
    }
  },

  attached(){
    let user = wx.getStorageSync('account')
    if (user) {
      this.setData({
        uid: user.userId
      })
    }
  },

  methods:{
    _toApplicant(){
      wx.navigateTo({
        url:`/packageExpert/pages/applicant/index?id=${this.data.project.id}`
      })
    }
  }
})
