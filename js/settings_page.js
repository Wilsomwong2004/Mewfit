// darkmode.js 完整修正版
class DarkModeSync {
  constructor() {
    // 确保元素已加载
    this.toggles = this.getToggles();
    
    // 添加异步初始化
    if(document.readyState === 'complete') {
      this.init();
    } else {
      document.addEventListener('DOMContentLoaded', () => this.init());
    }
  }

  getToggles() {
    // 增强元素选择方法
    const toggles = [
      document.getElementById('dark-mode-toggle'),
      document.getElementById('settings-darkmode-toggle')
    ];
    
    // 调试输出
    console.log('找到的开关:', toggles.map(t => t?.id));
    
    return toggles.filter(toggle => {
      if (!toggle) {
        console.error('开关元素未找到! 请检查:');
        console.error('1. HTML中是否存在对应ID');
        console.error('2. 是否重复ID');
        console.error('3. JS加载顺序是否早于DOM创建');
        return false;
      }
      return true;
    });
  }

  init() {
    // 增强状态初始化
    this.isDark = this.loadDarkModeState();
    document.documentElement.classList.toggle('dark-mode', this.isDark);
    
    // 添加防抖处理
    this.updateToggles();
    
    // 事件监听优化
    this.toggles.forEach(toggle => {
      // 移除已有监听避免重复
      toggle.removeEventListener('change', this.handleToggle);
      // 使用箭头函数保持this指向
      toggle.addEventListener('change', e => this.handleToggle(e));
    });

    // 调试输出
    console.log('初始化完成，当前模式:', this.isDark ? '深色' : '浅色');
  }

  loadDarkModeState() {
    // 处理localStorage异常
    try {
      return localStorage.getItem('darkMode') === 'true';
    } catch (e) {
      console.error('读取本地存储失败:', e);
      return false;
    }
  }

  handleToggle = (e) => {
    // 添加事件锁防止循环触发
    if (this.isUpdating) return;
    this.isUpdating = true;

    this.isDark = e.target.checked;
    
    // 异步更新避免渲染阻塞
    requestAnimationFrame(() => {
      this.updateToggles();
      this.saveDarkModeState();
      this.updateDarkModeClass();
      this.isUpdating = false;
    });
  }

  updateToggles() {
    this.toggles.forEach(toggle => {
      if (toggle.checked !== this.isDark) {
        // 使用属性直接赋值避免触发change事件
        toggle.checked = this.isDark;
        console.log(`已同步 ${toggle.id}: ${this.isDark}`);
      }
    });
  }

  saveDarkModeState() {
    try {
      localStorage.setItem('darkMode', this.isDark);
    } catch (e) {
      console.error('保存本地存储失败:', e);
    }
  }

  updateDarkModeClass() {
    document.documentElement.classList.toggle('dark-mode', this.isDark);
    // 添加过渡效果
    document.body.style.transition = 'background-color 0.3s ease';
  }
}

// 确保单例运行
if (!window.darkModeSyncInstance) {
  window.darkModeSyncInstance = new DarkModeSync();
}

class LogoutToggle {
  constructor() {
    this.logoutProfile = document.getElementById('logout-profile');
    this.logoutSettings = document.getElementById('logout-settings');
    this.isSyncing = false; // 状态标志，防止重复触发
    this.init();
  }

  init() {
    if (this.logoutProfile) {
      this.logoutProfile.addEventListener('click', (e) => this.handleLogout(e, 'profile'));
    }
    if (this.logoutSettings) {
      this.logoutSettings.addEventListener('click', (e) => this.handleLogout(e, 'settings'));
    }
  }

  handleLogout(e, source) {
    e.preventDefault();
    if (this.isSyncing) return; // 已在同步中则直接返回
    this.isSyncing = true;

    // 如果需要，可以程序化触发另一按钮的点击事件（但注意这样可能会导致循环调用）
    // 例如：
    // if (source === 'profile' && this.logoutSettings) {
    //   this.logoutSettings.dispatchEvent(new Event('click'));
    // } else if (source === 'settings' && this.logoutProfile) {
    //   this.logoutProfile.dispatchEvent(new Event('click'));
    // }

    // 统一执行退出逻辑
    this.logoutAction();

    this.isSyncing = false;
  }

  logoutAction() {
    const modal = document.getElementById('logout-modal');
    if (modal) {
      modal.classList.toggle('active');
      document.body.style.overflow = modal.classList.contains('active') ? 'hidden' : 'auto';
    }
    console.log('执行退出操作');
    // 在这里加入实际退出逻辑
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LogoutToggle();
});

document.addEventListener('DOMContentLoaded', () => {
  // 头像上传功能
  const avatarUpload = document.getElementById('avatar-upload');
  const profileImages = [
    document.getElementById('profile-pic'), // 导航栏头像
    document.querySelector('.profile-photo') // 左侧大头像
  ];

  // 绑定点击事件
  document.querySelector('.change-photo').addEventListener('click', () => {
    avatarUpload.click();
  });

  // 处理文件选择
  avatarUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!['image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Only JPG/JPEG files are allowed');
      return;
    }

    // 预览图片
    const reader = new FileReader();
    reader.onload = (event) => {
      profileImages.forEach(img => {
        if (img) img.src = event.target.result;
      });
      
      // 这里可以添加实际上传逻辑
      console.log('准备上传:', file);
      // uploadToServer(file);
    };
    reader.readAsDataURL(file);
  });

  // 示例上传函数
  async function uploadToServer(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/your-upload-endpoint', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      console.log('上传成功');
    } catch (error) {
      console.error('上传错误:', error);
      alert('上传失败，请重试');
    }
  }
});

