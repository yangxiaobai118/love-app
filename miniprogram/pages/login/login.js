const app = getApp()

Page({
  data: {
  },
  
  onLoad() {
    // 检查是否已经登录
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }
  },
  
  wechatLogin() {
    wx.login({
      success: res => {
        if (res.code) {
          // 发送code到后端
          wx.request({
            url: `${app.globalData.baseUrl}/auth/login`,
            method: 'POST',
            data: { code: res.code },
            success: res => {
              if (res.data && res.data.access_token) {
                // 存储token和用户信息
                app.globalData.token = res.data.access_token;
                app.globalData.userInfo = res.data.user;
                
                wx.setStorageSync('token', res.data.access_token);
                wx.setStorageSync('userInfo', res.data.user);
                
                // 跳转到首页
                wx.switchTab({
                  url: '/pages/index/index'
                });
              } else {
                wx.showToast({
                  title: '登录失败',
                  icon: 'none'
                });
              }
            },
            fail: err => {
              console.log('登录请求失败:', err);
              wx.showToast({
                title: '网络错误',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          });
        }
      }
    });
  }
})