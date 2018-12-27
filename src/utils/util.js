const formatTime = (time,type) => {
  const serverDate=new Date(wx.getStorageSync('serverDate'))
  const year_server = serverDate.getFullYear()
  const day_server=serverDate.getDate()
  const date=new Date(time.replace(/-/g, '/'))
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()

  let dateSpan = serverDate - date;
  dateSpan = Math.abs(dateSpan);
  const iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
  
  switch(type){
    case 'blogCard':
      if(iDays<1){
        if(day_server!==day){
          return '1天前'
        }else{
          return [hour, minute].map(formatNumber).join(':')
        }
      }else if(iDays>=1&&iDays<=7){
        return iDays+'天前'
      }else{
        return `${year}年${formatNumber(month)}月${formatNumber(day)}日`
      }
    break;
    case 'blogDetail':
      if(year!==year_server){
        return `${year}年${formatNumber(month)}月${formatNumber(day)}日`
      }else {
        return `${formatNumber(month)}月${formatNumber(day)}日`
      }
    break;
    case 'blogComment':
      if(year===year_server&&iDays<1){
        if(day_server!==day){
          return `${formatNumber(month)}-${formatNumber(day)} ${hour}:${minute}`
        }else{
          return [hour, minute].map(formatNumber).join(':')
        }
      }else if(year===year_server&&iDays>=1){
        return `${formatNumber(month)}-${formatNumber(day)} ${hour}:${minute}`
      }else{
        return `${year}年-${formatNumber(month)}-${formatNumber(day)} ${hour}:${minute}`
      }
    break;
  }
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
