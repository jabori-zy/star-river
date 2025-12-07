const fs = require("fs");
const path = require("path");

// Configuration
const BASE_LANG = "en-US";
const TARGET_LANGS = ["zh-CN"];
const I18N_DIR = path.join(__dirname);

/**
 * Parse nested object
 */
function parseNestedObject(objString, level = 0) {
	const result = {};
	let i = 0;

	while (i < objString.length) {
		// Skip whitespace characters
		while (i < objString.length && /\s/.test(objString[i])) {
			i++;
		}

		if (i >= objString.length || objString[i] === "}") {
			break;
		}

		// Match key name
		const keyMatch = objString.slice(i).match(/^(\w+)\s*:/);
		if (!keyMatch) {
			i++;
			continue;
		}

		const key = keyMatch[1];
		i += keyMatch[0].length;

		// Skip whitespace characters
		while (i < objString.length && /\s/.test(objString[i])) {
			i++;
		}

		if (i >= objString.length) break;

		// Check if it's a nested object
		if (objString[i] === "{") {
			// Find the matching closing brace
			let braceCount = 1;
			let j = i + 1;

			while (j < objString.length && braceCount > 0) {
				if (objString[j] === "{") braceCount++;
				else if (objString[j] === "}") braceCount--;
				j++;
			}

			if (braceCount === 0) {
				const nestedString = objString.slice(i + 1, j - 1);
				result[key] = parseNestedObject(nestedString, level + 1);
				i = j;
			} else {
				i++;
			}
		} else {
			// Match string value
			const valueMatch = objString.slice(i).match(/^["'`]([^"'`]*?)["'`]/);
			if (valueMatch) {
				result[key] = valueMatch[1];
				i += valueMatch[0].length;
			} else {
				i++;
			}
		}

		// Skip comma and whitespace characters
		while (i < objString.length && /[\s,]/.test(objString[i])) {
			i++;
		}
	}

	return result;
}

/**
 * Flatten object and get all key paths
 */
function flattenKeys(obj, prefix = "", result = {}) {
	for (const [key, value] of Object.entries(obj)) {
		const fullKey = prefix ? `${prefix}.${key}` : key;

		if (typeof value === "object" && value !== null && !Array.isArray(value)) {
			flattenKeys(value, fullKey, result);
		} else {
			result[fullKey] = value;
		}
	}

	return result;
}

/**
 * Create nested object from flattened keys
 */
function unflattenKeys(flatObj) {
	const result = {};

	for (const [path, value] of Object.entries(flatObj)) {
		const keys = path.split(".");
		let current = result;

		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			if (!(key in current)) {
				current[key] = {};
			}
			current = current[key];
		}

		current[keys[keys.length - 1]] = value;
	}

	return result;
}

/**
 * Parse exported object from TypeScript file
 */
function parseTranslationFile(filePath) {
	try {
		const content = fs.readFileSync(filePath, "utf8");

		// Match the content of const translation = { ... }
		const match = content.match(
			/const\s+translation\s*=\s*({[\s\S]*?})\s*;?\s*export/,
		);
		if (!match) {
			console.log(`Warning: Could not parse translation object in ${filePath}`);
			return {};
		}

		const objString = match[1].slice(1, -1); // Remove outer braces
		const parsedObj = parseNestedObject(objString);

		return parsedObj;
	} catch (error) {
		console.error(`Error parsing file ${filePath}:`, error.message);
		return {};
	}
}

/**
 * Generate translation file content
 */
function generateTranslationFile(translations) {
	function formatObject(obj, indent = 1) {
		const indentStr = "    ".repeat(indent);
		const entries = Object.entries(obj).map(([key, value]) => {
			if (
				typeof value === "object" &&
				value !== null &&
				!Array.isArray(value)
			) {
				const nestedObj = formatObject(value, indent + 1);
				return `${indentStr}${key}: {\n${nestedObj}\n${indentStr}},`;
			} else {
				return `${indentStr}${key}: "${value}",`;
			}
		});

		return entries.join("\n");
	}

	const content = formatObject(translations);

	return `const translation = {
${content}
}

export default translation;
`;
}

/**
 * Ensure directory exists
 */
function ensureDirectoryExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
		console.log(`Created directory: ${dirPath}`);
	}
}

/**
 * Process file generation for a single language
 */
function processLanguage(targetLang) {
	const baseLangDir = path.join(I18N_DIR, BASE_LANG);
	const targetLangDir = path.join(I18N_DIR, targetLang);

	// Ensure target language directory exists
	ensureDirectoryExists(targetLangDir);

	// Get all .ts files in the base language directory
	const baseFiles = fs
		.readdirSync(baseLangDir)
		.filter((file) => file.endsWith(".ts"));

	console.log(`\nProcessing language: ${targetLang}`);
	console.log(`Found ${baseFiles.length} files in ${BASE_LANG}:`, baseFiles);

	baseFiles.forEach((fileName) => {
		const baseFilePath = path.join(baseLangDir, fileName);
		const targetFilePath = path.join(targetLangDir, fileName);

		console.log(`\nProcessing file: ${fileName}`);

		// Parse base language file
		const baseTranslations = parseTranslationFile(baseFilePath);
		const baseFlatKeys = flattenKeys(baseTranslations);
		const baseKeyPaths = Object.keys(baseFlatKeys);

		console.log(`  Base file has ${baseKeyPaths.length} keys:`, baseKeyPaths);

		let targetTranslations = {};

		// If target file exists, parse existing translations
		if (fs.existsSync(targetFilePath)) {
			targetTranslations = parseTranslationFile(targetFilePath);
			const targetFlatKeys = flattenKeys(targetTranslations);
			const existingKeyPaths = Object.keys(targetFlatKeys);
			console.log(
				`  Target file exists with ${existingKeyPaths.length} keys:`,
				existingKeyPaths,
			);
		} else {
			console.log(`  Target file does not exist, will create new file`);
		}

		// Merge translations, set empty string for missing keys
		let hasChanges = false;
		const targetFlatKeys = flattenKeys(targetTranslations);
		const mergedFlatKeys = { ...targetFlatKeys };

		baseKeyPaths.forEach((keyPath) => {
			if (!(keyPath in mergedFlatKeys)) {
				mergedFlatKeys[keyPath] = "";
				hasChanges = true;
				console.log(`    Added missing key: ${keyPath}`);
			}
		});

		// Convert flattened keys back to nested object
		const mergedTranslations = unflattenKeys(mergedFlatKeys);

		// Write file if there are changes or file doesn't exist
		if (hasChanges || !fs.existsSync(targetFilePath)) {
			const content = generateTranslationFile(mergedTranslations);
			fs.writeFileSync(targetFilePath, content, "utf8");
			console.log(`  ✅ Updated: ${targetFilePath}`);
		} else {
			console.log(`  ⏭️  No changes needed for: ${targetFilePath}`);
		}
	});
}

/**
 * Main function
 */
function main() {
	console.log("🌍 Starting i18n generation...");
	console.log(`Base language: ${BASE_LANG}`);
	console.log(`Target languages: ${TARGET_LANGS.join(", ")}`);

	// Check if base language directory exists
	const baseLangDir = path.join(I18N_DIR, BASE_LANG);
	if (!fs.existsSync(baseLangDir)) {
		console.error(`❌ Base language directory not found: ${baseLangDir}`);
		process.exit(1);
	}

	// Process each target language
	TARGET_LANGS.forEach(processLanguage);

	console.log("\n✨ i18n generation completed!");
}

// Run script
main();
