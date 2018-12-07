const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const validatePhone = (phone) =>{
  if (!phone) {
    wx.showToast({
      title: '请输入手机号码',
      icon: 'none'
    })
    return false
  }
  if (!/^0?1[3|4|5|8|7][0-9]\d{8}$/.test(phone)){
    wx.showToast({
      title: '手机号码格式有误',
      icon: 'none'
    })
    return false
  }
  return true
}

const validatePwd = (pwd) => {
  if (!pwd) {
    wx.showToast({
      title: '请输入密码',
      icon: 'none'
    })
    return false
  }
  return true
}

module.exports = {
  validatePhone:validatePhone,
  validatePwd:validatePwd,
  formatTime: formatTime
}
