const { app, BrowserWindow } = require('electron')
const { spawn } = require('child_process')
const path = require('path')


const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
  })

  mainWindow.loadURL('http://localhost:5173/')
}


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

