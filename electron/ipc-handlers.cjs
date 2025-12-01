const { ipcMain, BrowserWindow } = require("electron");
const {
	closeBacktestWindow,
	checkOrOpenBacktestWindow,
	refreshAllBacktestWindows,
} = require("./window-manager.cjs");

const setupIpcHandlers = () => {
	// Listen for messages from renderer process - check if window exists first
	ipcMain.handle("open-backtest-window", (_, strategyId, strategyName) => {
		const result = checkOrOpenBacktestWindow(strategyId, strategyName);
		return result;
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
