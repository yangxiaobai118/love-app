const app = getApp()

Page({
  data: {
    recommendedUsers: []
  },
  
  onLoad() {
    this.getRecommendedUsers()
  },
  
  // 获取推荐用户
  getRecommendedUsers() {
    // 这里可以调用API获取推荐用户
    // 暂时使用模拟数据
    const mockUsers = [
      {
        id: 1,
        nickname: '小明',
        gender: '男',
        age: 28,
        avatar: ''
      },
      {
        id: 2,
        nickname: '小红',
        gender: '女',
        age: 25,
        avatar: ''
      },
      {
        id: 3,
        nickname: '小刚',
        gender: '男',
        age: 30,
        avatar: ''
      },
      {
        id: 4,
        nickname: '小丽',
        gender: '女',
        age: 26,
        avatar: ''
      }
    ]
    
    this.setData({ recommendedUsers: mockUsers })
  },
  
  // 跳转到搜索页面
  goToSearch() {
    wx.switchTab({
      url: '/pages/search/search'
    })
  },
  
  // 跳转到好友列表
  goToFriends() {
    wx.switchTab({
      url: '/pages/friends/friends'
    })
  },
  
  // 跳转到充值页面
  goToRecharge() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
  },
  
  // 跳转到个人中心
  goToProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },
  
  // 跳转到用户详情
  goToUserDetail(e) {
    const userId = e.currentTarget.dataset.userId
    // 这里可以跳转到用户详情页面
    console.log('用户ID:', userId)
  }
})