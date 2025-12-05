const { BrowserWindow, Menu, MenuItem, app } = require("electron");
const path = require("node:path");

// 用于跟踪策略ID到窗口的映射
const strategyWindows = new Map();

// 判断是否为开发环境
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// 获取页面 URL（使用 HashRouter，路由通过 # 传递）
const getURL = (route = "") => {
	if (isDev) {
		const base = "http://localhost:5173";
		return route ? `${base}/#${route}` : base;
	}
	// 生产环境加载本地文件
	const base = `file://${path.join(__dirname, "../dist/index.html")}`;
	return route ? `${base}#${route}` : base;
};

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 1600,
		height: 1080,
		minWidth: 800,
		minHeight: 600,
		frame: false,
		titleBarStyle: "hidden",
		icon: path.join(__dirname, "../build/icons/icon.icns"),
		// macOS: vertically center the traffic light buttons in the 40px header
		trafficLightPosition: { x: 12, y: 8 },
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			webSecurity: false,
			allowRunningInsecureContent: true,
		},
	});

	mainWindow.loadURL(getURL());

	// 监听全屏状态变化，通知渲染进程
	mainWindow.on("enter-full-screen", () => {
		mainWindow.webContents.send("fullscreen-change", true);
	});
	mainWindow.on("leave-full-screen", () => {
		mainWindow.webContents.send("fullscreen-change", false);
	});

	// 开发环境自动打开控制台
	if (isDev) {
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
		icon: path.join(__dirname, "../build/icons/icon.icns"),
		// macOS: vertically center the traffic light buttons in the 40px header
		trafficLightPosition: { x: 12, y: 8 },
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			webSecurity: false,
			allowRunningInsecureContent: true,
		},
	});

	const route = strategyId ? `/backtest/${strategyId}` : "/backtest";
	let backtestUrl = getURL(route);

	// Add strategyName as query parameter if provided
	if (strategyName) {
		const separator = isDev ? "?" : (backtestUrl.includes("?") ? "&" : "?");
		backtestUrl += `${separator}strategyName=${encodeURIComponent(strategyName)}`;
	}

	backtestWindow.loadURL(backtestUrl);

	// Add window to the map if strategyId is provided
	if (strategyId) {
		strategyWindows.set(strategyId, backtestWindow);
		console.log(
			`Backtest window created and registered: strategyId=${strategyId}`,
		);

		// Remove from map when window is closed
		backtestWindow.on("closed", () => {
			strategyWindows.delete(strategyId);
			console.log(
				`Backtest window closed and cleaned up: strategyId=${strategyId}`,
			);
		});
	}

	if (isDev) {
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
		console.log(
			`Window not found or already destroyed: strategyId=${strategyId}`,
		);
		return false;
	}
};

// 检查指定策略的回测窗口是否存在并处理（打开或移动到前台）
const checkOrOpenBacktestWindow = (strategyId, strategyName) => {
	const existingWindow = strategyWindows.get(strategyId);

	if (existingWindow && !existingWindow.isDestroyed()) {
		// Window exists, bring it to front
		console.log(
			`Backtest window already exists, bringing to front: strategyId=${strategyId}`,
		);
		existingWindow.show();
		existingWindow.focus();
		return { created: false, focused: true };
	} else {
		// Window does not exist, create a new one
		console.log(
			`Backtest window does not exist, creating new window: strategyId=${strategyId}`,
		);
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
