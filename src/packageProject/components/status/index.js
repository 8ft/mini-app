// components/project/status/index.js
Component({

  properties: {
    status:{
      type:String,
      value:''
    },
    refundState:{
      type:Number,
      value:0
    },
    character: {
      type: String,
      value: ''
    },
    remark: {
      type: String,
      value: ''
    },
    countDown:{
      type: Number,
      value: 0,
      observer(newVal, oldVal, changedPath) {
        if(newVal>0){
          this._countDown(newVal)
        }else if(newVal===0){
          this.triggerEvent('timeout')
        }
      }
    }
  },

  data: {
    content:{
      '2':{
        'publisher':{
          title: '招募专家',
          desc: '有专家申请你的项目了，快去选择心仪的TA。',
          img: 'zmzj'
        }
      },
      '5': {
        'publisher': {
          title: '雇佣并付款',
          desc: '我发起了合作意向，等待专家确认。',
          img: 'zmzj'
        },
        'applicant':{
          title: '确认合作意向',
          desc: '项目方发起了合作意向，点击立即处理查看详情。',
          img: 'zmzj'
        }
      },
      '6': {
        'publisher': {
          title: '雇佣并付款',
          desc: '专家已确认合作意向，快去付款吧！',
          img: 'gyfk'
        },
        'applicant': {
          title: '已确认合作',
          desc: '我已确认合作意向，等待项目方付款。',
          img: 'gyfk'
        }
      },
      '7': {
        'publisher': {
          title: '招募专家',
          desc: '专家拒绝了合作，重新招募其他专家。',
          img: 'zmzj'
        }
      },
      '8': {
        'publisher': {
          title: '项目执行中',
          desc: '已完成付款，等待专家交付项目成果。',
          img: 'zxz'
        },
        'applicant': {
          title: '项目执行中',
          desc: '项目方已付款，请在交付日期前完成项目。',
          img: 'zxz'
        }
      },
      '10': {
        'publisher': {
          title: '待项目验收',
          desc: '专家已提交验收，点击处理验收查看详情。',
          img: 'dys'
        },
        'applicant': {
          title: '待项目方验收',
          desc: '我已提交项目成果，等待项目方验收。',
          img: 'dys'
        }
      },
      '11': {
        'publisher': {
          title: '合作完成',
          desc: '平台将在24小时内打款至专家账户。',
          img: 'wc'
        },
        'applicant': {
          title: '合作完成',
          desc: '平台将在24小时内打款至你的账户。',
          img: 'wc'
        }
      },
      '13':{
        'publisher': {
          title: '已下架',
          desc: '发布内容不符合平台的服务范围，请发布与平台相关的内容需求。',
          img: 'cry'
        },
      },
      '14': {
        'publisher': {
          title: '待项目验收',
          desc: '我退回了验收，等待专家重新提交。',
          img: 'zmzj'
        },
        'applicant': {
          title: '待项目方验收',
          desc: '项目方发起验收不通过，请修改后重新提交验收。',
          img: 'zmzj'
        }
      }
    },

    //售后退款
    refundContent:{
      '20':{//退款中
        'publisher': {
          title: '退款中',
          desc: '您已申请退款，等待专家处理',
          img: ''
        },
        'applicant': {
          title: '退款中',
          desc: '项目方发起退款申请，若3天未处理将自动退款',
          img: 'tk'
        }
      },
      '22':{//拒绝退款
        'publisher': {
          title: '专家拒绝退款',
          desc: '您可以发起申诉获得帮助',
          img: ''
        },
        'applicant': {
          title: '拒绝退款',
          desc: '您已拒绝项目方退款申请',
          img: ''
        }
      },
      '23':{//已退款（到账）
        'publisher': {
          title: '已关闭',
          desc: '交易结束，平台已完成退款',
          img: 'tk'
        },
        'applicant': {
          title: '已关闭',
          desc: '交易结束，平台已完成退款',
          img: ''
        }
      },
      '30':{//申诉中
        'publisher': {
          title: '申诉中',
          desc: '您已发起申诉，平台将在1-2个工作日内与您联系，请保持手机通畅！',
          img: ''
        }
      },
      '32':{//申诉中
        'publisher': {
          title: '驳回',
          desc: '您发起的申述由于部分原因已被驳回',
          img: 'tk'
        }
      },
      '33':{//申诉已退款（到账）
        'publisher': {
          title: '已关闭',
          desc: '您项目遇到的问题平台已处理',
          img: 'tk'
        },
        'applicant': {
          title: '已关闭',
          desc: '您项目遇到的问题平台已处理',
          img: ''
        }
      }
    }
  },

  methods: {
    _download () {
      wx.showModal({
        title: '温馨提示',
        content: '请前往应用市场搜索下载"巨牛汇APP"进行后续操作',
        showCancel: false,
        confirmText: '知道了'
      })
    },

    _countDown(val){
      setTimeout(() => {
          let newCountDown=val-1
          let day=Math.floor(newCountDown/86400)
          let hour=Math.floor(newCountDown%86400/3600)
          let minute=Math.floor(newCountDown%86400%3600/60)

          let str=`${day>0?day+'天':''}${hour>0?hour+'小时':''}${minute>0?minute+'分钟':''}`
          this.setData({
            countDown:newCountDown,
            countDownFormat:str
          })
      }, 1000);
    }
  }
})
