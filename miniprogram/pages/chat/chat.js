const app = getApp()

Page({
  data: {
    friendId: '',
    friendInfo: {},
    messages: [],
    inputValue: '',
    userInfo: {},
    affection: 0
  },
  
  onLoad(options) {
    this.setData({ 
      friendId: options.friend_id,
      userInfo: app.globalData.userInfo
    })
    this.getFriendInfo()
    this.getChatHistory()
    this.getAffection()
  },
  
  // 获取好友信息
  getFriendInfo() {
    wx.request({
      url: `${app.globalData.baseUrl}/friend/detail/${this.data.friendId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: res => {
        if (res.data) {
          this.setData({ friendInfo: res.data })
        }
      },
      fail: err => {
        console.log('获取好友信息失败:', err)
      }
    })
  },
  
  // 获取聊天历史
  getChatHistory() {
    wx.request({
      url: `${app.globalData.baseUrl}/chat/history/${this.data.friendId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: res => {
        if (res.data) {
          this.setData({ messages: res.data })
        }
      },
      fail: err => {
        console.log('获取聊天历史失败:', err)
      }
    })
  },
  
  // 获取好感度
  getAffection() {
    wx.request({
      url: `${app.globalData.baseUrl}/chat/affection/${this.data.friendId}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: res => {
        if (res.data) {
          this.setData({ affection: res.data.affection })
        }
      },
      fail: err => {
        console.log('获取好感度失败:', err)
      }
    })
  },
  
  // 绑定消息输入
  bindMessageInput(e) {
    this.setData({ inputValue: e.detail.value })
  },
  
  // 发送消息
  sendMessage() {
    if (!this.data.inputValue.trim()) {
      return
    }
    
    wx.request({
      url: `${app.globalData.baseUrl}/chat/send`,
      method: 'POST',
      data: {
        friend_id: this.data.friendId,
        content: this.data.inputValue
      },
      header: {
        'Authorization': `Bearer ${app.globalData.token}`
      },
      success: res => {
        if (res.data && res.data.message === '消息发送成功') {
          // 清空输入框
          this.setData({ inputValue: '' })
          // 刷新聊天历史
          this.getChatHistory()
          // 刷新好感度
          this.getAffection()
        }
      },
      fail: err => {
        console.log('发送消息失败:', err)
        wx.showToast({ title: '发送消息失败', icon: 'none' })
      }
    })
  },
  
  // 加载更多消息
  loadMoreMessages() {
    // 实现加载更多消息的逻辑
  },
  
  // 格式化时间
  formatTime(timeString) {
    const date = new Date(timeString)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) {
      return '刚刚'
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    } else {
      return `${date.getMonth() + 1}-${date.getDate()}`
    }
  }
})