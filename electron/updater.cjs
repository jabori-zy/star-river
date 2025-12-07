const { autoUpdater } = require("electron-updater");
const { ipcMain, dialog, app } = require("electron");

let mainWindow = null;
let currentLocale = "en-US";

// i18n texts for updater dialogs
const i18n = {
	"en-US": {
		updateAvailable: {
			title: "Update Available",
			message: "A new version {version} is available. Would you like to download it now?",
			buttons: ["Download", "Later"],
		},
		updateDownloaded: {
			title: "Update Ready",
			message: "Version {version} has been downloaded. Restart the application to apply the update.",
			buttons: ["Restart Now", "Later"],
		},
		downloadProgress: {
			title: "Downloading Update",
			message: "Downloading: {percent}%",
		},
		error: {
			title: "Update Error",
			message: "An error occurred while updating: {error}",
			buttons: ["OK"],
		},
	},
	"zh-CN": {
		updateAvailable: {
			title: "发现新版本",
			message: "发现新版本 {version}，是否立即下载？",
			buttons: ["下载", "稍后"],
		},
		updateDownloaded: {
			title: "更新就绪",
			message: "版本 {version} 已下载完成，重启应用以完成更新。",
			buttons: ["立即重启", "稍后"],
		},
		downloadProgress: {
			title: "正在下载更新",
			message: "下载进度：{percent}%",
		},
		error: {
			title: "更新错误",
			message: "更新时发生错误：{error}",
			buttons: ["确定"],
		},
	},
};

// Get localized text
const t = (key, params = {}) => {
	const texts = i18n[currentLocale] || i18n["en-US"];
	const keys = key.split(".");
	let text = texts;
	for (const k of keys) {
		text = text?.[k];
	}
	if (typeof text === "string") {
		return text.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? "");
	}
	return text;
};

// Configure autoUpdater
const configureUpdater = () => {
	autoUpdater.autoDownload = false;
	autoUpdater.autoInstallOnAppQuit = true;

	autoUpdater.logger = require("electron-log");
	autoUpdater.logger.transports.file.level = "info";
};

// Send status to renderer
const sendStatusToWindow = (channel, data) => {
	if (mainWindow && !mainWindow.isDestroyed()) {
		mainWindow.webContents.send(channel, data);
	}
};

// Show update available dialog
const showUpdateAvailableDialog = async (info) => {
	const texts = t("updateAvailable");
	const result = await dialog.showMessageBox(mainWindow, {
		type: "info",
		title: texts.title,
		message: texts.message.replace("{version}", info.version),
		buttons: texts.buttons,
		defaultId: 0,
		cancelId: 1,
	});

	if (result.response === 0) {
		autoUpdater.downloadUpdate();
	}
};

// Show update downloaded dialog
const showUpdateDownloadedDialog = async (info) => {
	const texts = t("updateDownloaded");
	const result = await dialog.showMessageBox(mainWindow, {
		type: "info",
		title: texts.title,
		message: texts.message.replace("{version}", info.version),
		buttons: texts.buttons,
		defaultId: 0,
		cancelId: 1,
	});

	if (result.response === 0) {
		autoUpdater.quitAndInstall(false, true);
	}
};

// Show error dialog
const showErrorDialog = (err) => {
	const texts = t("error");
	dialog.showMessageBox(mainWindow, {
		type: "error",
		title: texts.title,
		message: texts.message.replace("{error}", err.message),
		buttons: texts.buttons,
	});
};

// Setup autoUpdater events
const setupUpdaterEvents = () => {
	autoUpdater.on("checking-for-update", () => {
		console.log("Checking for update...");
		sendStatusToWindow("updater:checking", {});
	});

	autoUpdater.on("update-available", (info) => {
		console.log("Update available:", info.version);
		sendStatusToWindow("updater:available", {
			version: info.version,
			releaseDate: info.releaseDate,
			releaseNotes: info.releaseNotes,
		});
		showUpdateAvailableDialog(info);
	});

	autoUpdater.on("update-not-available", (info) => {
		console.log("Update not available, current version is latest");
		sendStatusToWindow("updater:not-available", {
			version: info.version,
		});
	});

	autoUpdater.on("download-progress", (progress) => {
		console.log(`Download progress: ${progress.percent.toFixed(1)}%`);
		sendStatusToWindow("updater:progress", {
			percent: progress.percent,
			bytesPerSecond: progress.bytesPerSecond,
			transferred: progress.transferred,
			total: progress.total,
		});
	});

	autoUpdater.on("update-downloaded", (info) => {
		console.log("Update downloaded:", info.version);
		sendStatusToWindow("updater:downloaded", {
			version: info.version,
		});
		showUpdateDownloadedDialog(info);
	});

	autoUpdater.on("error", (err) => {
		console.error("Update error:", err.message);
		sendStatusToWindow("updater:error", {
			message: err.message,
		});
		showErrorDialog(err);
	});
};

// Setup IPC handlers for renderer communication
const setupIpcHandlers = () => {
	// Check for updates
	ipcMain.handle("updater:check", async () => {
		try {
			const result = await autoUpdater.checkForUpdates();
			return { success: true, version: result?.updateInfo?.version };
		} catch (err) {
			return { success: false, error: err.message };
		}
	});

	// Start download
	ipcMain.handle("updater:download", async () => {
		try {
			await autoUpdater.downloadUpdate();
			return { success: true };
		} catch (err) {
			return { success: false, error: err.message };
		}
	});

	// Quit and install
	ipcMain.handle("updater:install", () => {
		autoUpdater.quitAndInstall(false, true);
	});

	// Get current version
	ipcMain.handle("updater:version", () => {
		return app.getVersion();
	});

	// Set locale for updater dialogs
	ipcMain.handle("updater:setLocale", (_, locale) => {
		if (i18n[locale]) {
			currentLocale = locale;
			return { success: true };
		}
		return { success: false, error: "Unsupported locale" };
	});
};

// Initialize updater
const initUpdater = (window) => {
	mainWindow = window;
	configureUpdater();
	setupUpdaterEvents();
	setupIpcHandlers();
};

// Check for updates (call after app ready)
const checkForUpdates = () => {
	if (app.isPackaged) {
		autoUpdater.checkForUpdates().catch((err) => {
			console.error("Check for updates failed:", err.message);
		});
	}
};

module.exports = {
	initUpdater,
	checkForUpdates,
};
