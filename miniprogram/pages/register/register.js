const app = getApp()

Page({
  data: {
    nickname: '',
    gender: '',
    age: '',
    province: '',
    city: '',
    avatar: '',
    contact: '',
    occupation: '',
    height: '',
    weight: '',
    family: ''
  },
  
  // 绑定昵称输入
  bindNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },
  
  // 绑定性别选择
  bindGenderChange(e) {
    this.setData({ gender: e.detail.value })
  },
  
  // 绑定年龄输入
  bindAgeInput(e) {
    this.setData({ age: e.detail.value })
  },
  
  // 绑定省份输入
  bindProvinceInput(e) {
    this.setData({ province: e.detail.value })
  },
  
  // 绑定城市输入
  bindCityInput(e) {
    this.setData({ city: e.detail.value })
  },
  
  // 选择照片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePaths = res.tempFilePaths
        this.setData({ avatar: tempFilePaths[0] })
        // 这里可以上传图片到服务器，获取图片URL
      }
    })
  },
  
  // 绑定联系方式输入
  bindContactInput(e) {
    this.setData({ contact: e.detail.value })
  },
  
  // 绑定职业输入
  bindOccupationInput(e) {
    this.setData({ occupation: e.detail.value })
  },
  
  // 绑定身高输入
  bindHeightInput(e) {
    this.setData({ height: e.detail.value })
  },
  
  // 绑定体重输入
  bindWeightInput(e) {
    this.setData({ weight: e.detail.value })
  },
  
  // 绑定家庭情况输入
  bindFamilyInput(e) {
    this.setData({ family: e.detail.value })
  },
  
  // 注册
  register() {
    // 验证必填项
    if (!this.data.nickname) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    if (!this.data.gender) {
      wx.showToast({ title: '请选择性别', icon: 'none' })
      return
    }
    
    // 准备注册数据
    const registerData = {
      nickname: this.data.nickname,
      gender: this.data.gender,
      age: this.data.age ? parseInt(this.data.age) : null,
      province: this.data.province,
      city: this.data.city,
      avatar: this.data.avatar,
      contact: this.data.contact,
      occupation: this.data.occupation,
      height: this.data.height ? parseFloat(this.data.height) : null,
      weight: this.data.weight ? parseFloat(this.data.weight) : null,
      family: this.data.family
    }
    
    // 发送注册请求
    wx.request({
      url: `${app.globalData.baseUrl}/auth/register`,
      method: 'POST',
      data: registerData,
      success: res => {
        if (res.data && res.data.access_token) {
          // 存储token和用户信息
          app.globalData.token = res.data.access_token
          app.globalData.userInfo = res.data.user
          
          wx.setStorageSync('token', res.data.access_token)
          wx.setStorageSync('userInfo', res.data.user)
          
          // 跳转到首页
          wx.switchTab({
            url: '/pages/index/index'
          })
        } else {
          wx.showToast({ title: '注册失败', icon: 'none' })
        }
      },
      fail: err => {
        console.log('注册请求失败:', err)
        wx.showToast({ title: '网络错误', icon: 'none' })
      }
    })
  }
})