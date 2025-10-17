const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let backendProcess = null;
let backendHealthCheckInterval = null;

const getBackendPath = () => {
	const __dirname = path.resolve();

	// 根据不同环境和平台确定后端路径
	let backendName = "star-river-backend";

	// Windows平台添加.exe后缀
	if (process.platform === "win32") {
		backendName += ".exe";
	}

	// 优先查找本地service目录
	let backendPath = path.join(__dirname, "service", backendName);
	if (fs.existsSync(backendPath)) {
		return backendPath;
	}

	// 生产环境可能在resources目录
	backendPath = path.join(process.resourcesPath, "service", backendName);
	if (fs.existsSync(backendPath)) {
		return backendPath;
	}

	// 如果都找不到，返回默认路径
	return path.join(__dirname, "service", backendName);
};

const createRustBackend = () => {
	const backendPath = getBackendPath();

	// 检查后端可执行文件是否存在
	if (!fs.existsSync(backendPath)) {
		console.error(`后端可执行文件不存在：${backendPath}`);
		return false;
	}

	console.log(`尝试启动后端服务：${backendPath}`);

	try {
		backendProcess = spawn(backendPath, [], {
			stdio: ["pipe", "pipe", "pipe"],
			shell: false,
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
				console.error(`后端进程异常退出，退出码：${code}`);
			}
			// 清理健康检查定时器
			if (backendHealthCheckInterval) {
				clearInterval(backendHealthCheckInterval);
				backendHealthCheckInterval = null;
			}
		});

		backendProcess.on("error", (error) => {
			console.error(`后端进程启动失败：${error.message}`);
			return false;
		});

		console.log(`后端服务已启动，PID：${backendProcess.pid}`);

		// 启动健康检查
		startBackendHealthCheck();

		return true;
	} catch (error) {
		console.error(`启动后端服务时出错：${error.message}`);
		return false;
	}
};

const startBackendHealthCheck = () => {
	// 每30秒检查后端进程是否还在运行
	backendHealthCheckInterval = setInterval(() => {
		if (!backendProcess || backendProcess.killed) {
			console.log("检测到后端进程已停止");
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
		console.log("正在终止后端进程...");
		try {
			// 先尝试优雅关闭
			backendProcess.kill("SIGTERM");

			// 如果5秒后仍未关闭，强制终止
			setTimeout(() => {
				if (backendProcess && !backendProcess.killed) {
					console.log("强制终止后端进程");
					backendProcess.kill("SIGKILL");
				}
			}, 5000);
		} catch (error) {
			console.error(`终止后端进程时出错：${error.message}`);
		}
	}
};

module.exports = {
	createRustBackend,
	killBackendProcess,
};
