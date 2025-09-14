const { ipcMain, BrowserWindow } = require("electron");
const { createBacktestWindow, closeBacktestWindow, checkOrOpenBacktestWindow, refreshAllBacktestWindows } = require("./window-manager.cjs");

const setupIpcHandlers = () => {
	// 监听来自渲染进程的消息
	ipcMain.handle("open-backtest-window", (_, strategyId) => {
		createBacktestWindow(strategyId);
		return true;
	});

	// 检查或打开回测窗口（如果存在则移动到前台，否则创建新窗口）
	ipcMain.handle("check-or-open-backtest-window", (_, strategyId) => {
		const result = checkOrOpenBacktestWindow(strategyId);
		return result;
	});

	// 关闭指定策略的回测窗口
	ipcMain.handle("close-backtest-window", (_, strategyId) => {
		const closed = closeBacktestWindow(strategyId);
		return closed;
	});

	// 刷新所有回测窗口
	ipcMain.handle("refresh-all-backtest-windows", () => {
		const refreshedCount = refreshAllBacktestWindows();
		return refreshedCount;
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