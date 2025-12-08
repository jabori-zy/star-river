const { BrowserWindow, Menu, MenuItem, app } = require("electron");
const path = require("node:path");

// Map to track strategy ID to window
const strategyWindows = new Map();

// Check if development environment
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// Get page URL (using HashRouter, route passed via #)
const getURL = (route = "") => {
	if (isDev) {
		const base = "http://localhost:5173";
		return route ? `${base}/#${route}` : base;
	}
	// Production environment loads local file
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

	// Listen for fullscreen state changes and notify the renderer process
	mainWindow.on("enter-full-screen", () => {
		mainWindow.webContents.send("fullscreen-change", true);
	});
	mainWindow.on("leave-full-screen", () => {
		mainWindow.webContents.send("fullscreen-change", false);
	});

	// Automatically open DevTools in development environment
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

	// Listen for fullscreen state changes and notify the renderer process
	backtestWindow.on("enter-full-screen", () => {
		backtestWindow.webContents.send("fullscreen-change", true);
	});
	backtestWindow.on("leave-full-screen", () => {
		backtestWindow.webContents.send("fullscreen-change", false);
	});

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

// Check if backtest window for the specified strategy exists and handle it (open or bring to front)
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

// Close all backtest windows
const closeAllBacktestWindows = () => {
	let closedCount = 0;
	for (const [strategyId, window] of strategyWindows.entries()) {
		if (window && !window.isDestroyed()) {
			console.log(`Closing backtest window: strategyId=${strategyId}`);
			window.close();
			closedCount++;
		}
	}
	strategyWindows.clear();
	console.log(`Closed ${closedCount} backtest window(s)`);
	return closedCount;
};

const setupDevContextMenu = (window) => {
	window.webContents.on("context-menu", (_, params) => {
		const menu = new Menu();

		menu.append(
			new MenuItem({
				label: "Inspect Element",
				click: () => {
					window.webContents.inspectElement(params.x, params.y);
				},
			}),
		);

		menu.append(
			new MenuItem({
				label: "Open DevTools",
				click: () => {
					window.webContents.openDevTools();
				},
			}),
		);

		menu.append(new MenuItem({ type: "separator" }));

		menu.append(
			new MenuItem({
				label: "Refresh",
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
	closeAllBacktestWindows,
};
