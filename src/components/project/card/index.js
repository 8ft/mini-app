// components/project/card/card.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    project:Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    uid:''
  },

  attached:function(){
    let user = wx.getStorageSync('user')
    if (user) {
      this.setData({
        uid: user.userId
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
