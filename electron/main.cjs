const { app, BrowserWindow, globalShortcut } = require("electron");
const { createWindow } = require("./window-manager.cjs");
const { createRustBackend, killBackendProcess } = require("./backend-manager.cjs");
const { setupIpcHandlers } = require("./ipc-handlers.cjs");

app.whenReady().then(() => {
	createWindow();
	setupIpcHandlers();

	// 开发环境注册全局快捷键
	if (process.env.NODE_ENV !== "production") {
		setupDevShortcuts();
	}

	// 生产模式启动后端服务
	if (process.env.NODE_ENV === "production") {
		createRustBackend();
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

	console.log("开发环境快捷键已注册：F12 或 Ctrl+Shift+I 打开开发者工具");
};

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		globalShortcut.unregisterAll();
		killBackendProcess();
		app.quit();
	}
});

app.on("will-quit", () => {
	globalShortcut.unregisterAll();
	killBackendProcess();
});

app.on("before-quit", () => {
	killBackendProcess();
});
