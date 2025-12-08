/**
 * Build script with version suffix support
 *
 * Usage:
 *   npm run build:mac -- --version v0.1.0-beta.1
 *   npm run build:win -- --version v0.1.0-beta.1
 */

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const packageJsonPath = path.join(projectRoot, "package.json");

function parseArgs() {
	const args = process.argv.slice(2);
	let version = null;
	let platform = null;

	for (let i = 0; i < args.length; i++) {
		if (args[i] === "--version" || args[i] === "-v") {
			version = args[i + 1];
			i++;
		} else if (args[i] === "--mac") {
			platform = "mac";
		} else if (args[i] === "--win") {
			platform = "win";
		}
	}

	return { version, platform };
}

function validateVersion(version) {
	const pattern = /^v\d+\.\d+\.\d+(-.*)?$/;
	return pattern.test(version);
}

function getBaseVersion(version) {
	return version.replace(/^v/, "").replace(/-.*/, "");
}

function restoreVersion(pkg, originalVersion, buildVersion) {
	pkg.version = originalVersion;
	fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, "\t")}\n`);
	console.log(`\nVersion restored: ${buildVersion} -> ${originalVersion}`);
}

function main() {
	const { version, platform } = parseArgs();
	const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
	const originalVersion = pkg.version;
	let buildVersion = originalVersion;

	if (version) {
		if (!validateVersion(version)) {
			console.error(`Error: Invalid version format: ${version}`);
			console.error("Expected format: v1.0.0 or v1.0.0-beta.1");
			process.exit(1);
		}

		const versionBase = getBaseVersion(version);
		const pkgBase = getBaseVersion(originalVersion);

		if (versionBase !== pkgBase) {
			console.error(
				`Error: Version base (${versionBase}) does not match package.json (${pkgBase})`,
			);
			process.exit(1);
		}

		buildVersion = version.replace(/^v/, "");
		pkg.version = buildVersion;
		fs.writeFileSync(packageJsonPath, `${JSON.stringify(pkg, null, "\t")}\n`);
		console.log(`Version updated: ${originalVersion} -> ${buildVersion}`);

		// Handle interrupt signals to restore version
		const cleanup = () => restoreVersion(pkg, originalVersion, buildVersion);
		process.on("SIGINT", () => {
			cleanup();
			process.exit(1);
		});
		process.on("SIGTERM", () => {
			cleanup();
			process.exit(1);
		});
	}

	const platformArg = platform ? `--${platform}` : "";
	const cmd = `npx vite build && npx electron-builder ${platformArg} --publish never`;

	console.log(`Building version: ${buildVersion}`);
	console.log(`Platform: ${platform || "all"}`);
	console.log(`Command: ${cmd}\n`);

	try {
		execSync(cmd, { stdio: "inherit", cwd: projectRoot });
		console.log("\nBuild completed!");
	} finally {
		if (version) {
			restoreVersion(pkg, originalVersion, buildVersion);
		}
	}
}

main();
