const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const net = require("node:net");

let backendProcess = null;
let backendHealthCheckInterval = null;
let backendPort = null;

// 检测端口是否被占用
const portUsed = (port) => {
	return new Promise((resolve) => {
		const server = net.createServer().listen(port, "0.0.0.0");
		server.on("listening", () => {
			server.close();
			resolve(port); // 端口可用，返回端口号
		});
		server.on("error", (err) => {
			if (err.code === "EADDRINUSE") {
				resolve(err); // 端口被占用，返回错误
			}
		});
	});
};

// 查找可用端口（从 startPort 开始递增）
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

// 获取后端端口
const getBackendPort = () => backendPort;

const getBackendPath = () => {
	let backendName = "star-river-backend";

	// Windows平台添加.exe后缀
	if (process.platform === "win32") {
		backendName += ".exe";
	}

	// 生产环境：resourcesPath/service/
	const backendPath = path.join(process.resourcesPath, "service", backendName);
	if (fs.existsSync(backendPath)) {
		return backendPath;
	}

	console.error(`backend file not found: ${backendPath}`);
	return null;
};

const createRustBackend = async () => {
	const backendPath = getBackendPath();

	// 检查后端可执行文件路径
	if (!backendPath) {
		return false;
	}

	// 查找可用端口
	backendPort = await findAvailablePort(3100);
	console.log(`find available backend port: ${backendPort}`);

	console.log(`try to start backend: ${backendPath}`);

	// 获取后端所在目录作为工作目录
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
			// 清理健康检查定时器
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

		// 启动健康检查
		startBackendHealthCheck();

		return true;
	} catch (error) {
		console.error(`start backend service failed: ${error.message}`);
		return false;
	}
};

const startBackendHealthCheck = () => {
	// 每30秒检查后端进程是否还在运行
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
	// 清理健康检查定时器
	if (backendHealthCheckInterval) {
		clearInterval(backendHealthCheckInterval);
		backendHealthCheckInterval = null;
	}

	if (backendProcess && !backendProcess.killed) {
		console.log("terminating backend process...");
		try {
			// 先尝试优雅关闭
			backendProcess.kill("SIGTERM");

			// 如果5秒后仍未关闭，强制终止
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
