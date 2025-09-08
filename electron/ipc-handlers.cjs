const { ipcMain, BrowserWindow } = require("electron");
const { createBacktestWindow, closeBacktestWindow } = require("./window-manager.cjs");

const setupIpcHandlers = () => {
	// 监听来自渲染进程的消息
	ipcMain.handle("open-backtest-window", (event, strategyId) => {
		createBacktestWindow(strategyId);
		return true;
	});

	// 关闭指定策略的回测窗口
	ipcMain.handle("close-backtest-window", (event, strategyId) => {
		const closed = closeBacktestWindow(strategyId);
		return closed;
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
};

module.exports = {
	setupIpcHandlers,
};