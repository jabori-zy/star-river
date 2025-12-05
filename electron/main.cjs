const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("node:path");
const { createWindow } = require("./window-manager.cjs");
const {
	createRustBackend,
	killBackendProcess,
} = require("./backend-manager.cjs");
const { setupIpcHandlers } = require("./ipc-handlers.cjs");

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// 设置应用名称，影响用户数据目录 (~/Library/Application Support/Star River/)
app.setName("Star River");

app.whenReady().then(async () => {
	// 开发环境下设置 Dock 图标 (macOS)
	if (isDev && process.platform === "darwin") {
		const iconPath = path.join(__dirname, "../build/icons/icon.png");
		app.dock.setIcon(iconPath);
	}

	// 生产模式启动后端服务（需要在创建窗口前启动，以便获取端口）
	if (!isDev) {
		await createRustBackend();
	}

	createWindow();
	setupIpcHandlers();

	// 开发环境注册全局快捷键
	if (isDev) {
		setupDevShortcuts();
	}

	// 生产环境隐藏调试快捷键
	if (!isDev) {
		setupHiddenDevShortcuts();
	}
});

const setupDevShortcuts = () => {
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

	console.log("dev environment shortcuts registered: F12 or Ctrl+Shift+I open developer tools");
};

// 生产环境隐藏调试快捷键 (Cmd+Shift+Option+I)
const setupHiddenDevShortcuts = () => {
	globalShortcut.register("CommandOrControl+Shift+Alt+I", () => {
		const focusedWindow = BrowserWindow.getFocusedWindow();
		if (focusedWindow) {
			focusedWindow.webContents.toggleDevTools();
		}
	});
};

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		globalShortcut.unregisterAll();
		killBackendProcess();
		app.quit();
	}
});

// macOS: 点击 Dock 图标时重新创建窗口
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

app.on("will-quit", () => {
	globalShortcut.unregisterAll();
	killBackendProcess();
});

app.on("before-quit", () => {
	killBackendProcess();
});
