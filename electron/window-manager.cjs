const { BrowserWindow, Menu, MenuItem } = require("electron");

// 用于跟踪策略ID到窗口的映射
const strategyWindows = new Map();

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 1600,
		height: 1080,
		minWidth: 800,
		minHeight: 600,
		frame: false,
		titleBarStyle: "hidden",
		// macOS: vertically center the traffic light buttons in the 40px header
		trafficLightPosition: { x: 12, y: 8 },
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			webSecurity: false,
			allowRunningInsecureContent: true,
		},
	});

	mainWindow.loadURL("http://localhost:5173/");

	// 开发环境自动打开控制台
	if (process.env.NODE_ENV !== "production") {
		mainWindow.webContents.openDevTools();
		setupDevContextMenu(mainWindow);
	}

	return mainWindow;
};

const createBacktestWindow = (strategyId, strategyName) => {
	const backtestWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		minWidth: 600,
		minHeight: 400,
		frame: false,
		titleBarStyle: "hidden",
		// macOS: vertically center the traffic light buttons in the 40px header
		trafficLightPosition: { x: 12, y: 8 },
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			webSecurity: false,
			allowRunningInsecureContent: true,
		},
	});

	let backtestUrl = strategyId
		? `http://localhost:5173/backtest/${strategyId}`
		: "http://localhost:5173/backtest";
	
	// Add strategyName as query parameter if provided
	if (strategyName) {
		backtestUrl += `?strategyName=${encodeURIComponent(strategyName)}`;
	}
	
	backtestWindow.loadURL(backtestUrl);

	// Add window to the map if strategyId is provided
	if (strategyId) {
		strategyWindows.set(strategyId, backtestWindow);
		console.log(`Backtest window created and registered: strategyId=${strategyId}`);

		// Remove from map when window is closed
		backtestWindow.on("closed", () => {
			strategyWindows.delete(strategyId);
			console.log(`Backtest window closed and cleaned up: strategyId=${strategyId}`);
		});
	}

	if (process.env.NODE_ENV !== "production") {
		backtestWindow.webContents.openDevTools();
		setupDevContextMenu(backtestWindow);
	}

	return backtestWindow;
};

// Close backtest window for specific strategy
const closeBacktestWindow = (strategyId) => {
	const window = strategyWindows.get(strategyId);
	if (window && !window.isDestroyed()) {
		console.log(`Closing backtest window: strategyId=${strategyId}`);
		window.close();
		strategyWindows.delete(strategyId);
		return true;
	} else {
		console.log(`Window not found or already destroyed: strategyId=${strategyId}`);
		return false;
	}
};

// 检查指定策略的回测窗口是否存在并处理（打开或移动到前台）
const checkOrOpenBacktestWindow = (strategyId, strategyName) => {
	const existingWindow = strategyWindows.get(strategyId);

	if (existingWindow && !existingWindow.isDestroyed()) {
		// Window exists, bring it to front
		console.log(`Backtest window already exists, bringing to front: strategyId=${strategyId}`);
		existingWindow.show();
		existingWindow.focus();
		return { created: false, focused: true };
	} else {
		// Window does not exist, create a new one
		console.log(`Backtest window does not exist, creating new window: strategyId=${strategyId}`);
		createBacktestWindow(strategyId, strategyName);
		return { created: true, focused: false };
	}
};

// Refresh all backtest windows
const refreshAllBacktestWindows = () => {
	let refreshedCount = 0;
	for (const [strategyId, window] of strategyWindows.entries()) {
		if (window && !window.isDestroyed()) {
			console.log(`Refreshing backtest window: strategyId=${strategyId}`);
			window.webContents.reload();
			refreshedCount++;
		}
	}
	console.log(`Refreshed ${refreshedCount} backtest window(s)`);
	return refreshedCount;
};

const setupDevContextMenu = (window) => {
	window.webContents.on("context-menu", (_, params) => {
		const menu = new Menu();

		menu.append(
			new MenuItem({
				label: "检查元素",
				click: () => {
					window.webContents.inspectElement(params.x, params.y);
				},
			}),
		);

		menu.append(
			new MenuItem({
				label: "打开开发者工具",
				click: () => {
					window.webContents.openDevTools();
				},
			}),
		);

		menu.append(new MenuItem({ type: "separator" }));

		menu.append(
			new MenuItem({
				label: "刷新",
				accelerator: "CmdOrCtrl+R",
				click: () => {
					window.webContents.reload();
				},
			}),
		);

		menu.popup({ window });
	});
};

module.exports = {
	createWindow,
	createBacktestWindow,
	closeBacktestWindow,
	checkOrOpenBacktestWindow,
	refreshAllBacktestWindows,
};
