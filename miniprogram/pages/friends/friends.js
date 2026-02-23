const app = getApp()

Page({
  data: {
    friends: []
  },
  
  onLoad() {
    this.getFriendsList()
  },
  
  onShow() {
    this.getFriendsList()
  },
  
  // 获取好友列表
  getFriendsList() {
    wx.request({
      url: `${app.globalData.baseUrl}/friend/list`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: res => {
        if (res.data) {
          this.setData({ friends: res.data })
        }
      },
      fail: err => {
        console.log('获取好友列表失败:', err)
        wx.showToast({ title: '获取好友列表失败', icon: 'none' })
      }
    })
  },
  
  // 跳转到聊天页面
  goToChat(e) {
    const friendId = e.currentTarget.dataset.friendId
    wx.navigateTo({
      url: `/pages/chat/chat?friend_id=${friendId}`
    })
  },
  
  // 公开信息
  publicInfo(e) {
    const friendId = e.currentTarget.dataset.friendId
    
    wx.request({
      url: `${app.globalData.baseUrl}/friend/public-info/${friendId}`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: res => {
        if (res.data && res.data.message) {
          wx.showToast({ title: res.data.message, icon: 'success' })
          // 刷新好友列表
          this.getFriendsList()
        }
      },
      fail: err => {
        console.log('公开信息失败:', err)
        wx.showToast({ title: '公开信息失败', icon: 'none' })
      }
    })
  }
})