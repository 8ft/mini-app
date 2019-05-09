const app = getApp()
const regeneratorRuntime=app.regeneratorRuntime

Page({
  data: {
    uid:'',
    list:[],
    pageIndex: 1,
    nomore: false,
    loading:true,
  },

  onLoad (options) {
    this.setData({
      uid:options.id
    })
    this.getCollection()
  },

  refresh(){
    if(this.data.loading)return
    this.data.pageIndex=1
    this.data.nomore=false
    this.data.list=[]
    this.getCollection()
  },

  onPullDownRefresh(){
    this.refresh()
  },

  onReachBottom(){
    this.getCollection()
  },

  async getCollection (){
    let nomore = this.data.nomore
    if (nomore)return
    this.setData({
      loading:true
    })

    let pIndex = this.data.pageIndex
    let res = await app.request.post('/blog/article/getList',{
      queryType:2,
      ownerId:this.data.uid,
      pageIndex:pIndex,
      pageSize:10
    })

    if (res.code === 0) {
      if (res.data.page > pIndex){
        pIndex++
      }else{
        nomore=true
      }
    
      this.setData({
        list: this.data.list.concat(res.data.list.map(blog=>{
          if(blog.articleBrief.length>50){
            blog.articleBrief=blog.articleBrief.substring(0,50)+'...'
          }
          blog.createTime=app.util.formatTime(blog.createTime,'blogCard')
          return blog
        })),
        pageIndex:pIndex,
        nomore:nomore,
        loading:false
      })
    }
    wx.stopPullDownRefresh()
  }
 
})