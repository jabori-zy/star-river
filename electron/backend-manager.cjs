const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const net = require("node:net");
const { app } = require("electron");

// Check if development environment
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

let backendProcess = null;
let backendHealthCheckInterval = null;
let backendPort = null;

// Check if port is in use
const portUsed = (port) => {
	return new Promise((resolve) => {
		const server = net.createServer().listen(port, "0.0.0.0");
		server.on("listening", () => {
			server.close();
			resolve(port); // Port available, return port number
		});
		server.on("error", (err) => {
			if (err.code === "EADDRINUSE") {
				resolve(err); // Port is in use, return error
			}
		});
	});
};

// Find available port (incrementing from startPort)
const findAvailablePort = (startPort = 3100) => {
	return new Promise((resolve) => {
		const tryPort = async (port) => {
			const res = await portUsed(port);
			if (res instanceof Error) {
				console.log(`Port ${port} is occupied, trying next...`);
				tryPort(port + 1);
			} else {
				resolve(port);
			}
		};
		tryPort(startPort);
	});
};

// Get backend port
const getBackendPort = () => backendPort;

// Get backend executable name (platform-specific)
const getBackendName = () => {
	let backendName = "star-river-backend";
	// Add .exe suffix for Windows platform
	if (process.platform === "win32") {
		backendName += ".exe";
	}
	return backendName;
};

// Get platform directory name
const getPlatformDir = () => {
	switch (process.platform) {
		case "darwin":
			return "darwin";
		case "win32":
			return "win32";
		case "linux":
			return "linux";
		default:
			return process.platform;
	}
};

// Development environment: load from resources directory
const getDevBackendPath = () => {
	const backendName = getBackendName();
	const platformDir = getPlatformDir();

	// Development environment: project root/resources/{platform}/star-river-backend
	const backendPath = path.join(__dirname, "..", "resources", platformDir, backendName);
	if (fs.existsSync(backendPath)) {
		return backendPath;
	}

	console.error(`[dev] backend file not found: ${backendPath}`);
	return null;
};

// Production environment: load from resourcesPath directory
const getProdBackendPath = () => {
	const backendName = getBackendName();

	// Production environment: resourcesPath/service/
	const backendPath = path.join(process.resourcesPath, "service", backendName);
	if (fs.existsSync(backendPath)) {
		return backendPath;
	}

	console.error(`[prod] backend file not found: ${backendPath}`);
	return null;
};

// Get backend path based on environment
const getBackendPath = () => {
	return isDev ? getDevBackendPath() : getProdBackendPath();
};

const createRustBackend = async () => {
	const backendPath = getBackendPath();

	// Check backend executable path
	if (!backendPath) {
		return false;
	}

	// Find available port
	backendPort = await findAvailablePort(3100);
	console.log(`find available backend port: ${backendPort}`);

	console.log(`try to start backend: ${backendPath}`);

	// Get backend directory as working directory
	const backendDir = path.dirname(backendPath);
	console.log(`backend directory: ${backendDir}`);

	try {
		backendProcess = spawn(backendPath, ["--port", String(backendPort)], {
			stdio: ["pipe", "pipe", "pipe"],
			shell: false,
			cwd: backendDir,
		});

		backendProcess.stdout.on("data", (data) => {
			console.log(`Backend stdout: ${data}`);
		});

		backendProcess.stderr.on("data", (data) => {
			console.error(`Backend stderr: ${data}`);
		});

		backendProcess.on("close", (code) => {
			console.log(`Backend process exited with code ${code}`);
			if (code !== 0 && code !== null) {
				console.error(`backend process exited with code ${code}`);
			}
			// Clean up health check timer
			if (backendHealthCheckInterval) {
				clearInterval(backendHealthCheckInterval);
				backendHealthCheckInterval = null;
			}
		});

		backendProcess.on("error", (error) => {
			console.error(`backend process start failed: ${error.message}`);
			return false;
		});

		console.log(`backend service started, PID: ${backendProcess.pid}, port: ${backendPort}`);

		// Start health check
		startBackendHealthCheck();

		return true;
	} catch (error) {
		console.error(`start backend service failed: ${error.message}`);
		return false;
	}
};

const startBackendHealthCheck = () => {
	// Check every 30 seconds if backend process is still running
	backendHealthCheckInterval = setInterval(() => {
		if (!backendProcess || backendProcess.killed) {
			console.log("detected backend process stopped");
			if (backendHealthCheckInterval) {
				clearInterval(backendHealthCheckInterval);
				backendHealthCheckInterval = null;
			}
		}
	}, 30000);
};

const killBackendProcess = () => {
	// Clean up health check timer
	if (backendHealthCheckInterval) {
		clearInterval(backendHealthCheckInterval);
		backendHealthCheckInterval = null;
	}

	if (backendProcess && !backendProcess.killed) {
		console.log("terminating backend process...");
		try {
			// Try graceful shutdown first
			backendProcess.kill("SIGTERM");

			// Force terminate if not closed after 5 seconds
			setTimeout(() => {
				if (backendProcess && !backendProcess.killed) {
					console.log("force terminate backend process");
					backendProcess.kill("SIGKILL");
				}
			}, 5000);
		} catch (error) {
			console.error(`terminate backend process failed: ${error.message}`);
		}
	}
};

module.exports = {
	createRustBackend,
	killBackendProcess,
	getBackendPort,
};
