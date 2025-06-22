const { app, BrowserWindow, ipcMain } = require('electron')
const { spawn } = require('child_process')
const path = require('path')

let backendProcess = null;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 1080,
    frame: false, // 去除窗口边框和菜单栏
    titleBarStyle: 'hidden', // 隐藏标题栏
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.loadURL('http://localhost:5173/')
}

// 创建回测窗口
const createBacktestWindow = () => {
  const backtestWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: '回测结果',
    frame: false, // 去除窗口边框和菜单栏
    titleBarStyle: 'hidden', // 隐藏标题栏
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // 加载 backtest 页面
  backtestWindow.loadURL('http://localhost:5173/backtest')
  
  return backtestWindow
}

// 监听来自渲染进程的消息
ipcMain.handle('open-backtest-window', () => {
  createBacktestWindow()
  return true
})

// 窗口控制IPC处理程序
ipcMain.handle('minimize-window', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow()
  if (focusedWindow) {
    focusedWindow.minimize()
  }
})

ipcMain.handle('maximize-window', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow()
  if (focusedWindow) {
    if (focusedWindow.isMaximized()) {
      focusedWindow.unmaximize()
    } else {
      focusedWindow.maximize()
    }
  }
})

ipcMain.handle('close-window', () => {
  const focusedWindow = BrowserWindow.getFocusedWindow()
  if (focusedWindow) {
    focusedWindow.close()
  }
})

const createRustBackend = () => {
  const __dirname = path.resolve()
  console.log(__dirname)
  const backendPath = path.join(__dirname, 'service/star-river-backend.exe')
  const rustBackend = spawn(backendPath, {
    stdio: 'inherit',
    shell: true
  })

  // 启动后端进程
  backendProcess = spawn(backendPath);

  backendProcess.stdout.on('data', (data) => {
      console.log(`Backend stdout: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
      console.error(`Backend stderr: ${data}`);
  });

  backendProcess.on('close', (code) => {
      console.log(`Backend process exited with code ${code}`);
  });
}

app.whenReady().then(() => {
  createWindow()

  // 判断环境模式
  if (process.env.NODE_ENV === 'production') { // 如果是生产模式
    createRustBackend() // 启动后端服务
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

