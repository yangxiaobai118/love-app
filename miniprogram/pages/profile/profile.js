const app = getApp()

Page({
  data: {
    userInfo: {},
    friendsCount: 0
  },
  
  onLoad() {
    this.setData({ userInfo: app.globalData.userInfo })
    this.getFriendsCount()
  },
  
  onShow() {
    this.setData({ userInfo: app.globalData.userInfo })
    this.getFriendsCount()
  },
  
  // 获取好友数量
  getFriendsCount() {
    wx.request({
      url: `${app.globalData.baseUrl}/friend/list`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: res => {
        if (res.data) {
          this.setData({ friendsCount: res.data.length })
        }
      },
      fail: err => {
        console.log('获取好友数量失败:', err)
      }
    })
  },
  
  // 跳转到充值页面
  goToRecharge() {
    wx.showModal({
      title: '充值',
      content: '请选择充值金额',
      cancelText: '取消',
      confirmText: '充值',
      success: res => {
        if (res.confirm) {
          // 这里可以跳转到充值页面或直接调用充值接口
          this.recharge(10) // 示例：充值10元
        }
      }
    })
  },
  
  // 充值
  recharge(amount) {
    wx.request({
      url: `${app.globalData.baseUrl}/user/recharge`,
      method: 'POST',
      data: { amount },
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: res => {
        if (res.data && res.data.message === '充值成功') {
          wx.showToast({ title: res.data.message, icon: 'success' })
          // 更新用户信息
          app.globalData.userInfo.hearts = res.data.hearts
          this.setData({ userInfo: app.globalData.userInfo })
        }
      },
      fail: err => {
        console.log('充值失败:', err)
        wx.showToast({ title: '充值失败', icon: 'none' })
      }
    })
  },
  
  // 观看广告
  watchAd() {
    wx.request({
      url: `${app.globalData.baseUrl}/user/watch-ad`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: res => {
        if (res.data && res.data.message === '观看广告成功') {
          wx.showToast({ title: res.data.message, icon: 'success' })
          // 更新用户信息
          app.globalData.userInfo.hearts = res.data.hearts
          this.setData({ userInfo: app.globalData.userInfo })
        }
      },
      fail: err => {
        console.log('观看广告失败:', err)
        wx.showToast({ title: '观看广告失败', icon: 'none' })
      }
    })
  },
  
  // 编辑资料
  updateProfile() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  },
  
  // 退出登录
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          // 清除本地存储
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          // 清除全局变量
          app.globalData.token = null
          app.globalData.userInfo = null
          // 跳转到登录页面
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }
      }
    })
  }
})