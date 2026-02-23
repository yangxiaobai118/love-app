const app = getApp()

Page({
  data: {
    gender: '',
    ageMin: '',
    ageMax: '',
    province: '',
    city: '',
    users: [],
    hasSearched: false
  },
  
  // 绑定性别选择
  bindGenderChange(e) {
    this.setData({ gender: e.detail.value })
  },
  
  // 绑定最小年龄输入
  bindAgeMinInput(e) {
    this.setData({ ageMin: e.detail.value })
  },
  
  // 绑定最大年龄输入
  bindAgeMaxInput(e) {
    this.setData({ ageMax: e.detail.value })
  },
  
  // 绑定省份输入
  bindProvinceInput(e) {
    this.setData({ province: e.detail.value })
  },
  
  // 绑定城市输入
  bindCityInput(e) {
    this.setData({ city: e.detail.value })
  },
  
  // 搜索用户
  searchUsers() {
    const searchData = {
      gender: this.data.gender,
      age_min: this.data.ageMin ? parseInt(this.data.ageMin) : null,
      age_max: this.data.ageMax ? parseInt(this.data.ageMax) : null,
      province: this.data.province,
      city: this.data.city
    }
    
    wx.request({
      url: `${app.globalData.baseUrl}/search/users`,
      method: 'POST',
      data: searchData,
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: res => {
        if (res.data) {
          this.setData({ 
            users: res.data,
            hasSearched: true
          })
        }
      },
      fail: err => {
        console.log('搜索用户失败:', err)
        wx.showToast({ title: '搜索失败', icon: 'none' })
      }
    })
  },
  
  // 添加好友
  addFriend(e) {
    const userId = e.currentTarget.dataset.userId
    
    wx.request({
      url: `${app.globalData.baseUrl}/friend/add`,
      method: 'POST',
      data: { user_id: userId },
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: res => {
        if (res.data && res.data.message === '添加好友成功') {
          wx.showToast({ title: '添加好友成功', icon: 'success' })
        }
      },
      fail: err => {
        console.log('添加好友失败:', err)
        wx.showToast({ title: '添加好友失败', icon: 'none' })
      }
    })
  }
})