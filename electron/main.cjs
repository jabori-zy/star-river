const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("node:path");
const {
	createWindow,
	closeAllBacktestWindows,
} = require("./window-manager.cjs");
const {
	createRustBackend,
	killBackendProcess,
} = require("./backend-manager.cjs");
const { setupIpcHandlers } = require("./ipc-handlers.cjs");
const { initUpdater, checkForUpdates } = require("./updater.cjs");

// Check if development environment
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// Set app name, affects user data directory (~/Library/Application Support/Star River/)
app.setName("Star River");

app.whenReady().then(async () => {
	// Set Dock icon in development environment (macOS)
	if (isDev && process.platform === "darwin") {
		const iconPath = path.join(__dirname, "../build/icons/icon.png");
		app.dock.setIcon(iconPath);
	}

	// Start backend service (needs to start before creating window to get the port)
	await createRustBackend();

	const mainWindow = createWindow();
	setupIpcHandlers();

	// Initialize updater
	initUpdater(mainWindow);

	// Check for updates after window is ready (delay 3 seconds)
	mainWindow.once("ready-to-show", () => {
		setTimeout(() => {
			checkForUpdates();
		}, 3000);
	});

	// Listen for main window close event, close all backtest windows
	mainWindow.on("close", () => {
		console.log("Main window closing, closing all backtest windows...");
		closeAllBacktestWindows();
	});

	// 开发环境注册全局快捷键
	if (isDev) {
		setupDevShortcuts();
	}

	// Hide debug shortcuts in production environment
	if (!isDev) {
		setupHiddenDevShortcuts();
	}
});

const setupDevShortcuts = () => {
	// Register F12 shortcut to open developer tools
	globalShortcut.register("F12", () => {
		const focusedWindow = BrowserWindow.getFocusedWindow();
		if (focusedWindow) {
			focusedWindow.webContents.toggleDevTools();
		}
	});

	// Register Ctrl+Shift+I shortcut to open developer tools
	globalShortcut.register("CommandOrControl+Shift+I", () => {
		const focusedWindow = BrowserWindow.getFocusedWindow();
		if (focusedWindow) {
			focusedWindow.webContents.toggleDevTools();
		}
	});

	console.log("dev environment shortcuts registered: F12 or Ctrl+Shift+I open developer tools");
};

// Hidden debug shortcuts in production environment (Cmd+Shift+Option+I)
const setupHiddenDevShortcuts = () => {
	globalShortcut.register("CommandOrControl+Shift+Alt+I", () => {
		const focusedWindow = BrowserWindow.getFocusedWindow();
		if (focusedWindow) {
			focusedWindow.webContents.toggleDevTools();
		}
	});
};

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		globalShortcut.unregisterAll();
		killBackendProcess();
		app.quit();
	}
});

// macOS: Recreate window when clicking Dock icon
app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});

app.on("will-quit", () => {
	globalShortcut.unregisterAll();
	killBackendProcess();
});

app.on("before-quit", () => {
	killBackendProcess();
});
