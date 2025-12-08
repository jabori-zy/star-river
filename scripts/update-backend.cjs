/**
 * Download backend binary from GitHub Release
 *
 * Usage:
 *   npm run update-backend -- --tag v1.0.0
 *   npm run update-backend -- -t v1.0.0
 *
 * The script reads backend version from backend.version.json:
 * - If tag contains "-" (e.g., v0.1.0-beta.2), uses "beta" version
 * - Otherwise uses "stable" version
 * 
 */

const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");

// Configuration
const CONFIG = {
  repo: "jabori-zy/star-river-backend",
  platforms: {
    darwin: {
      // Download: star-river-backend-v0.1.0-beta.2-arm64 -> Save as: star-river-backend
      getSourceFileName: (tag) => `star-river-backend-${tag}-arm64`,
      targetFileName: "star-river-backend",
    },
    win32: {
      // Download: star-river-backend-v0.1.0-beta.2-x64.exe -> Save as: star-river-backend.exe
      getSourceFileName: (tag) => `star-river-backend-${tag}-x64.exe`,
      targetFileName: "star-river-backend.exe",
    },
  },
};

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  let tag = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--tag" || args[i] === "-t") {
      tag = args[i + 1];
      break;
    }
  }

  return { tag };
}

// Get version from package.json
function getPackageVersion() {
  const packageJsonPath = path.join(projectRoot, "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  return packageJson.version;
}

// Get backend version from backend.version.json
function getBackendVersion(isBeta) {
  const versionFilePath = path.join(projectRoot, "backend.version.json");
  const versionConfig = JSON.parse(fs.readFileSync(versionFilePath, "utf-8"));
  return isBeta ? versionConfig.beta : versionConfig.stable;
}

// Check if tag is beta version
function isBetaTag(tag) {
  return tag.includes("-");
}

// Validate tag format: v1.0.0 or v1.0.0-beta
function validateTag(tag) {
  const pattern = /^v\d+\.\d+\.\d+(-.*)?$/;
  return pattern.test(tag);
}

// Validate tag matches package.json version (ignore suffix like -beta.2)
function validateVersionMatch(tag, packageVersion) {
  // tag: v1.0.0-beta.2 -> 1.0.0
  const tagVersion = tag.replace(/^v/, "").replace(/-.*$/, "");
  // packageVersion: 1.0.0-beta -> 1.0.0
  const basePackageVersion = packageVersion.replace(/-.*$/, "");
  return tagVersion === basePackageVersion;
}

// Download file with redirect support
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    const request = (url) => {
      https
        .get(url, (response) => {
          // Handle redirects
          if (response.statusCode === 301 || response.statusCode === 302) {
            const redirectUrl = response.headers.location;
            console.log(`  Redirecting to: ${redirectUrl}`);
            request(redirectUrl);
            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
            return;
          }

          const totalSize = parseInt(response.headers["content-length"], 10);
          let downloadedSize = 0;

          response.on("data", (chunk) => {
            downloadedSize += chunk.length;
            if (totalSize) {
              const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
              process.stdout.write(`\r  Progress: ${percent}% (${(downloadedSize / 1024 / 1024).toFixed(2)} MB)`);
            }
          });

          response.pipe(file);

          file.on("finish", () => {
            file.close();
            console.log("");
            resolve();
          });
        })
        .on("error", (err) => {
          fs.unlink(destPath, () => {});
          reject(err);
        });
    };

    request(url);
  });
}

// Clean platform directory
function cleanPlatformDir(platformDir) {
  if (fs.existsSync(platformDir)) {
    const files = fs.readdirSync(platformDir);
    for (const file of files) {
      const filePath = path.join(platformDir, file);
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        fs.unlinkSync(filePath);
        console.log(`  Deleted: ${file}`);
      }
    }
  }
}

// Main function
async function main() {
  const { tag } = parseArgs();
  const packageVersion = getPackageVersion();

  // Validate tag
  if (!tag) {
    console.error("Error: --tag parameter is required");
    console.error("Usage: npm run update-backend -- --tag v1.0.0");
    process.exit(1);
  }

  if (!validateTag(tag)) {
    console.error(`Error: Invalid tag format "${tag}"`);
    console.error("Expected format: v1.0.0 or v1.0.0-suffix");
    process.exit(1);
  }

  // Validate version match
  if (!validateVersionMatch(tag, packageVersion)) {
    console.error(`Error: Tag version "${tag}" does not match package.json version "${packageVersion}"`);
    console.error(`Please ensure the tag matches the version in package.json (v${packageVersion})`);
    process.exit(1);
  }

  // Determine backend version based on tag type
  const isBeta = isBetaTag(tag);
  const backendVersion = getBackendVersion(isBeta);

  console.log(`\nFrontend tag: ${tag} (${isBeta ? "beta" : "stable"})`);
  console.log(`Backend version: ${backendVersion}`);
  console.log(`Package version: ${packageVersion}`);
  console.log(`Repository: ${CONFIG.repo}\n`);

  const resourcesDir = path.join(projectRoot, "resources");

  // Clean platform directories before download
  console.log("[Cleaning]");
  for (const platform of Object.keys(CONFIG.platforms)) {
    const platformDir = path.join(resourcesDir, platform);
    console.log(`  ${platform}/`);
    cleanPlatformDir(platformDir);
  }
  console.log("");

  // Download for each platform
  for (const [platform, config] of Object.entries(CONFIG.platforms)) {
    const platformDir = path.join(resourcesDir, platform);
    const sourceFileName = config.getSourceFileName(backendVersion);
    const targetPath = path.join(platformDir, config.targetFileName);

    console.log(`[${platform}]`);

    // Ensure directory exists
    if (!fs.existsSync(platformDir)) {
      fs.mkdirSync(platformDir, { recursive: true });
    }

    // Build download URL
    const downloadUrl = `https://github.com/${CONFIG.repo}/releases/download/${backendVersion}/${sourceFileName}`;
    console.log(`  URL: ${downloadUrl}`);

    try {
      await downloadFile(downloadUrl, targetPath);

      // Set executable permission on Unix
      if (platform === "darwin") {
        fs.chmodSync(targetPath, 0o755);
      }

      const stats = fs.statSync(targetPath);
      console.log(`  Saved: ${targetPath}`);
      console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`);
    } catch (err) {
      console.error(`  Failed: ${err.message}\n`);
      process.exit(1);
    }
  }

  console.log("Done! Backend binaries updated successfully.");
}

main();
