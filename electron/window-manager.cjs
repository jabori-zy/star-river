const { BrowserWindow, Menu, MenuItem } = require("electron");

// 用于跟踪策略ID到窗口的映射
const strategyWindows = new Map();

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 1600,
		height: 1080,
		frame: false,
		titleBarStyle: "hidden",
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

const createBacktestWindow = (strategyId) => {
	const backtestWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		title: "回测结果",
		frame: false,
		titleBarStyle: "hidden",
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			webSecurity: false,
			allowRunningInsecureContent: true,
		},
	});

	const backtestUrl = strategyId
		? `http://localhost:5173/backtest/${strategyId}`
		: "http://localhost:5173/backtest";
	backtestWindow.loadURL(backtestUrl);

	// 如果有strategyId，将窗口添加到映射中
	if (strategyId) {
		strategyWindows.set(strategyId, backtestWindow);
		console.log(`回测窗口已创建并记录: strategyId=${strategyId}`);
		
		// 窗口关闭时从映射中移除
		backtestWindow.on('closed', () => {
			strategyWindows.delete(strategyId);
			console.log(`回测窗口已关闭并清理: strategyId=${strategyId}`);
		});
	}

	if (process.env.NODE_ENV !== "production") {
		backtestWindow.webContents.openDevTools();
		setupDevContextMenu(backtestWindow);
	}

	return backtestWindow;
};

// 关闭指定策略的回测窗口
const closeBacktestWindow = (strategyId) => {
	const window = strategyWindows.get(strategyId);
	if (window && !window.isDestroyed()) {
		console.log(`正在关闭回测窗口: strategyId=${strategyId}`);
		window.close();
		strategyWindows.delete(strategyId);
		return true;
	} else {
		console.log(`未找到或窗口已销毁: strategyId=${strategyId}`);
		return false;
	}
};

const setupDevContextMenu = (window) => {
	window.webContents.on("context-menu", (e, params) => {
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
};