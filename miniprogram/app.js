App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'https://your-vercel-deployment-url.vercel.app/api'
  },
  
  onLaunch() {
    // 检查本地存储的token
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    
    if (token && userInfo) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    }
    
    // 登录
    this.login();
  },
  
  login() {
    wx.login({
      success: res => {
        if (res.code) {
          // 发送code到后端获取openid
          this.requestLogin(res.code);
        } else {
          console.log('登录失败:', res.errMsg);
        }
      }
    });
  },
  
  requestLogin(code) {
    wx.request({
      url: `${this.globalData.baseUrl}/auth/login`,
      method: 'POST',
      data: { code },
      success: res => {
        if (res.data && res.data.access_token) {
          this.globalData.token = res.data.access_token;
          this.globalData.userInfo = res.data.user;
          
          // 存储到本地
          wx.setStorageSync('token', res.data.access_token);
          wx.setStorageSync('userInfo', res.data.user);
        }
      },
      fail: err => {
        console.log('登录请求失败:', err);
      }
    });
  },
  
  // 通用请求方法
  request(options) {
    const token = this.globalData.token;
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.baseUrl}${options.url}`,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: res => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(res);
          }
        },
        fail: err => {
          reject(err);
        }
      });
    });
  }
})