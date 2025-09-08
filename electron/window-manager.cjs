const { BrowserWindow, Menu, MenuItem } = require("electron");

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

	if (process.env.NODE_ENV !== "production") {
		backtestWindow.webContents.openDevTools();
		setupDevContextMenu(backtestWindow);
	}

	return backtestWindow;
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
};