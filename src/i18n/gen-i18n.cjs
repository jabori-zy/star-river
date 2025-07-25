const fs = require("fs");
const path = require("path");

// 配置
const BASE_LANG = "en-US";
const TARGET_LANGS = ["zh-CN"];
const I18N_DIR = path.join(__dirname);

/**
 * 解析嵌套对象
 */
function parseNestedObject(objString, level = 0) {
	const result = {};
	let i = 0;

	while (i < objString.length) {
		// 跳过空白字符
		while (i < objString.length && /\s/.test(objString[i])) {
			i++;
		}

		if (i >= objString.length || objString[i] === "}") {
			break;
		}

		// 匹配键名
		const keyMatch = objString.slice(i).match(/^(\w+)\s*:/);
		if (!keyMatch) {
			i++;
			continue;
		}

		const key = keyMatch[1];
		i += keyMatch[0].length;

		// 跳过空白字符
		while (i < objString.length && /\s/.test(objString[i])) {
			i++;
		}

		if (i >= objString.length) break;

		// 检查是否是嵌套对象
		if (objString[i] === "{") {
			// 找到匹配的右大括号
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
			// 匹配字符串值
			const valueMatch = objString.slice(i).match(/^["'`]([^"'`]*?)["'`]/);
			if (valueMatch) {
				result[key] = valueMatch[1];
				i += valueMatch[0].length;
			} else {
				i++;
			}
		}

		// 跳过逗号和空白字符
		while (i < objString.length && /[\s,]/.test(objString[i])) {
			i++;
		}
	}

	return result;
}

/**
 * 扁平化对象，获取所有键的路径
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
 * 从扁平化的键创建嵌套对象
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
 * 解析 TypeScript 文件中导出的对象
 */
function parseTranslationFile(filePath) {
	try {
		const content = fs.readFileSync(filePath, "utf8");

		// 匹配 const translation = { ... } 的内容
		const match = content.match(
			/const\s+translation\s*=\s*({[\s\S]*?})\s*;?\s*export/,
		);
		if (!match) {
			console.log(`Warning: Could not parse translation object in ${filePath}`);
			return {};
		}

		const objString = match[1].slice(1, -1); // 去掉外层大括号
		const parsedObj = parseNestedObject(objString);

		return parsedObj;
	} catch (error) {
		console.error(`Error parsing file ${filePath}:`, error.message);
		return {};
	}
}

/**
 * 生成翻译文件内容
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
 * 确保目录存在
 */
function ensureDirectoryExists(dirPath) {
	if (!fs.existsSync(dirPath)) {
		fs.mkdirSync(dirPath, { recursive: true });
		console.log(`Created directory: ${dirPath}`);
	}
}

/**
 * 处理单个语言的文件生成
 */
function processLanguage(targetLang) {
	const baseLangDir = path.join(I18N_DIR, BASE_LANG);
	const targetLangDir = path.join(I18N_DIR, targetLang);

	// 确保目标语言目录存在
	ensureDirectoryExists(targetLangDir);

	// 获取基础语言目录下的所有 .ts 文件
	const baseFiles = fs
		.readdirSync(baseLangDir)
		.filter((file) => file.endsWith(".ts"));

	console.log(`\nProcessing language: ${targetLang}`);
	console.log(`Found ${baseFiles.length} files in ${BASE_LANG}:`, baseFiles);

	baseFiles.forEach((fileName) => {
		const baseFilePath = path.join(baseLangDir, fileName);
		const targetFilePath = path.join(targetLangDir, fileName);

		console.log(`\nProcessing file: ${fileName}`);

		// 解析基础语言文件
		const baseTranslations = parseTranslationFile(baseFilePath);
		const baseFlatKeys = flattenKeys(baseTranslations);
		const baseKeyPaths = Object.keys(baseFlatKeys);

		console.log(`  Base file has ${baseKeyPaths.length} keys:`, baseKeyPaths);

		let targetTranslations = {};

		// 如果目标文件存在，解析现有的翻译
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

		// 合并翻译，对于缺失的 key 设置为空字符串
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

		// 将扁平化的键转换回嵌套对象
		const mergedTranslations = unflattenKeys(mergedFlatKeys);

		// 如果有变化或文件不存在，写入文件
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
 * 主函数
 */
function main() {
	console.log("🌍 Starting i18n generation...");
	console.log(`Base language: ${BASE_LANG}`);
	console.log(`Target languages: ${TARGET_LANGS.join(", ")}`);

	// 检查基础语言目录是否存在
	const baseLangDir = path.join(I18N_DIR, BASE_LANG);
	if (!fs.existsSync(baseLangDir)) {
		console.error(`❌ Base language directory not found: ${baseLangDir}`);
		process.exit(1);
	}

	// 处理每个目标语言
	TARGET_LANGS.forEach(processLanguage);

	console.log("\n✨ i18n generation completed!");
}

// 运行脚本
main();
