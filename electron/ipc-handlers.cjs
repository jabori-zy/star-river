const { ipcMain, BrowserWindow } = require("electron");
const {
	closeBacktestWindow,
	checkOrOpenBacktestWindow,
	refreshAllBacktestWindows,
} = require("./window-manager.cjs");
const { getBackendPort } = require("./backend-manager.cjs");

const setupIpcHandlers = () => {
	// Listen for messages from renderer process - check if window exists first
	ipcMain.handle("open-backtest-window", (_, strategyId, strategyName) => {
		const result = checkOrOpenBacktestWindow(strategyId, strategyName);
		return result;
	});

	// Check or open backtest window (if exists, bring to front; otherwise create new window)
	ipcMain.handle("check-or-open-backtest-window", (_, strategyId) => {
		const result = checkOrOpenBacktestWindow(strategyId);
		return result;
	});

	// Close backtest window for specified strategy
	ipcMain.handle("close-backtest-window", (_, strategyId) => {
		const closed = closeBacktestWindow(strategyId);
		return closed;
	});

	// Refresh all backtest windows
	ipcMain.handle("refresh-all-backtest-windows", () => {
		const refreshedCount = refreshAllBacktestWindows();
		return refreshedCount;
	});

	// Window control IPC handlers
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

	// Get backend port
	ipcMain.handle("get-backend-port", () => {
		return getBackendPort();
	});
};

module.exports = {
	setupIpcHandlers,
};
