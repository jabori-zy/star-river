const { app, BrowserWindow, ipcMain, globalShortcut } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let backendProcess = null;

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 1600,
		height: 1080,
		frame: false, // 去除窗口边框和菜单栏
		titleBarStyle: "hidden", // 隐藏标题栏
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	mainWindow.loadURL("http://localhost:5173/");

	// 开发环境自动打开控制台
	if (process.env.NODE_ENV !== "production") {
		mainWindow.webContents.openDevTools();

		// 开发环境启用右键菜单
		mainWindow.webContents.on("context-menu", (e, params) => {
			const { Menu, MenuItem } = require("electron");
			const menu = new Menu();

			// 添加开发者工具菜单项
			menu.append(
				new MenuItem({
					label: "检查元素",
					click: () => {
						mainWindow.webContents.inspectElement(params.x, params.y);
					},
				}),
			);

			menu.append(
				new MenuItem({
					label: "打开开发者工具",
					click: () => {
						mainWindow.webContents.openDevTools();
					},
				}),
			);

			menu.append(new MenuItem({ type: "separator" }));

			menu.append(
				new MenuItem({
					label: "刷新",
					accelerator: "CmdOrCtrl+R",
					click: () => {
						mainWindow.webContents.reload();
					},
				}),
			);

			menu.popup({ window: mainWindow });
		});
	}
};

// 创建回测窗口
const createBacktestWindow = (strategyId) => {
	const backtestWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		title: "回测结果",
		frame: false, // 去除窗口边框和菜单栏
		titleBarStyle: "hidden", // 隐藏标题栏
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	// 加载 backtest 页面，如果提供了strategyId则包含在URL中
	const backtestUrl = strategyId
		? `http://localhost:5173/backtest/${strategyId}`
		: "http://localhost:5173/backtest";
	backtestWindow.loadURL(backtestUrl);

	// 开发环境自动打开控制台
	if (process.env.NODE_ENV !== "production") {
		backtestWindow.webContents.openDevTools();

		// 开发环境启用右键菜单
		backtestWindow.webContents.on("context-menu", (e, params) => {
			const { Menu, MenuItem } = require("electron");
			const menu = new Menu();

			// 添加开发者工具菜单项
			menu.append(
				new MenuItem({
					label: "检查元素",
					click: () => {
						backtestWindow.webContents.inspectElement(params.x, params.y);
					},
				}),
			);

			menu.append(
				new MenuItem({
					label: "打开开发者工具",
					click: () => {
						backtestWindow.webContents.openDevTools();
					},
				}),
			);

			menu.append(new MenuItem({ type: "separator" }));

			menu.append(
				new MenuItem({
					label: "刷新",
					accelerator: "CmdOrCtrl+R",
					click: () => {
						backtestWindow.webContents.reload();
					},
				}),
			);

			menu.popup({ window: backtestWindow });
		});
	}

	return backtestWindow;
};

// 监听来自渲染进程的消息
ipcMain.handle("open-backtest-window", (event, strategyId) => {
	createBacktestWindow(strategyId);
	return true;
});

// 窗口控制IPC处理程序
ipcMain.handle("minimize-window", () => {
	const focusedWindow = BrowserWindow.getFocusedWindow();
	if (focusedWindow) {
		focusedWindow.minimize();
	}
});

ipcMain.handle("maximize-window", () => {
	const focusedWindow = BrowserWindow.getFocusedWindow();
	if (focusedWindow) {
		if (focusedWindow.isMaximized()) {
			focusedWindow.unmaximize();
		} else {
			focusedWindow.maximize();
		}
	}
});

ipcMain.handle("close-window", () => {
	const focusedWindow = BrowserWindow.getFocusedWindow();
	if (focusedWindow) {
		focusedWindow.close();
	}
});

const createRustBackend = () => {
	const __dirname = path.resolve();
	console.log(__dirname);
	const backendPath = path.join(__dirname, "service/star-river-backend.exe");
	const rustBackend = spawn(backendPath, {
		stdio: "inherit",
		shell: true,
	});

	// 启动后端进程
	backendProcess = spawn(backendPath);

	backendProcess.stdout.on("data", (data) => {
		console.log(`Backend stdout: ${data}`);
	});

	backendProcess.stderr.on("data", (data) => {
		console.error(`Backend stderr: ${data}`);
	});

	backendProcess.on("close", (code) => {
		console.log(`Backend process exited with code ${code}`);
	});
};

app.whenReady().then(() => {
	createWindow();

	// 开发环境注册全局快捷键
	if (process.env.NODE_ENV !== "production") {
		// 注册 F12 快捷键打开开发者工具
		globalShortcut.register("F12", () => {
			const focusedWindow = BrowserWindow.getFocusedWindow();
			if (focusedWindow) {
				focusedWindow.webContents.toggleDevTools();
			}
		});

		// 注册 Ctrl+Shift+I 快捷键打开开发者工具
		globalShortcut.register("CommandOrControl+Shift+I", () => {
			const focusedWindow = BrowserWindow.getFocusedWindow();
			if (focusedWindow) {
				focusedWindow.webContents.toggleDevTools();
			}
		});

		console.log("开发环境快捷键已注册：F12 或 Ctrl+Shift+I 打开开发者工具");
	}

	// 判断环境模式
	if (process.env.NODE_ENV === "production") {
		// 如果是生产模式
		createRustBackend(); // 启动后端服务
	}
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		// 清理全局快捷键
		globalShortcut.unregisterAll();
		app.quit();
	}
});

app.on("will-quit", () => {
	// 清理全局快捷键
	globalShortcut.unregisterAll();
});
