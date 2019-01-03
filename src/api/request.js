const config = require('config.js')
const requestArr = []

const request = (url, options, requireServerDate, hideLoading) => {
  if (!hideLoading && requestArr.length === 0) {
    wx.showLoading()
  }
  requestArr.push(1)

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${config.host}${url}`,
      method: options.method,
      data: options.data,
      header: {
        'Content-Type': config.contentType,
        'client_type': config.clientType,
        'api_version': config.version,
        'token': wx.getStorageSync('account').token || ''
      },
      success(res) {
        requestArr.pop()
        if (requestArr.length === 0) {
          wx.hideLoading()
        }

        let code = res.data.code
        if (code && code !== 0) {
          if (code === 506001) {
            //重新登录
            wx.navigateTo({
              url: '/pages/user/wxLogin/index'
            })
          } else if (code !== 507) {
            wx.showModal({
              title: '提示',
              content: `${res.data.message}`,
              showCancel: false,
              confirmText: '好的'
            })
          }
        }

        //返回服务器时间
        if (requireServerDate) {
          wx.setStorageSync('serverDate', res.header.Date)
        }

        resolve(res.data)
      },
      fail(error) {
        requestArr.pop()
        if (requestArr.length === 0) {
          wx.hideLoading()
        }

        wx.showModal({
          title: '请求异常',
          content: error.errMsg,
          showCancel: false,
          confirmText: '好的'
        })
        reject()
      }
    })

  })
}

const get = (url, options = {}, requireServerDate, hideLoading) => {
  return request(url, { method: 'GET', data: options }, requireServerDate, hideLoading)
}

const post = (url, options, requireServerDate, hideLoading) => {
  return request(url, { method: 'POST', data: options }, requireServerDate, hideLoading)
}

module.exports = {
  get,
  post
}