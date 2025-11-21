import i18n from "i18next";
import { camelCase } from "lodash-es";
import { initReactI18next } from "react-i18next";
import { SupportLanguage } from "@/types/system";

// 静态导入 en-US 资源作为默认
import enUSCommon from "./en-US/common";
import enUSStrategy from "./en-US/strategy";
import enUSNode from "./en-US/node";
import enUSIfElseNode from "./en-US/if-else-node";
import enUSVariableNode from "./en-US/variable-node";
import enUSIndicator from "./en-US/indicator";
import enUSMarket from "./en-US/market";
import enUSSetting from "./en-US/setting";
import enUSDektop from "./en-US/desktop";
import enUSApiMessage from "./en-US/api-message";
import enUSStartNode from "./en-US/start-node";
// 定义所有命名空间(模块名)
const NAMESPACES = [
	"common",
	"desktop",
	"api-message",
	"strategy",
	"node",
	"if-else-node",
	"variable-node",
	"indicator",
	"market",
	"setting",
	"start-node",
];

// 动态导入语言资源,带容错机制
const requireSilent = async (lang: string, namespace: string) => {
	let res;
	try {
		res = (await import(`./${lang}/${namespace}.ts`)).default;
	} catch {
		// 如果目标语言不存在,回退到 en-US
		res = (await import(`./en-US/${namespace}.ts`)).default;
	}
	return res;
};

// 异步加载指定语言的所有资源
export const loadLangResources = async (lang: string) => {
	const modules = await Promise.all(
		NAMESPACES.map((ns) => requireSilent(lang, ns)),
	);
	const resources = modules.reduce((acc, mod, index) => {
		acc[camelCase(NAMESPACES[index])] = mod;
		return acc;
	}, {} as Record<string, any>);
	return resources;
};

// 初始化时使用静态导入的 en-US 资源
const getInitialTranslations = () => {
	return {
		[SupportLanguage.EN_US]: {
			translation: {
				common: enUSCommon,
				desktop: enUSDektop,
				apiMessage: enUSApiMessage,
				strategy: enUSStrategy,
				node: enUSNode,
				ifElseNode: enUSIfElseNode,
				variableNode: enUSVariableNode,
				indicator: enUSIndicator,
				market: enUSMarket,
				setting: enUSSetting,
				startNode: enUSStartNode,
			},
		},
	};
};

// 初始化 i18n
if (!i18n.isInitialized) {
	i18n.use(initReactI18next).init({
		lng: undefined, // 不设置初始语言,等待从数据库加载
		fallbackLng: SupportLanguage.EN_US,
		resources: getInitialTranslations(),
		interpolation: {
			escapeValue: false,
		},
	});
}

// 切换语言(按需加载)
export const changeLanguage = async (lng?: string) => {
	if (!lng) return;
	if (!i18n.hasResourceBundle(lng, "translation")) {
		const resource = await loadLangResources(lng);
		i18n.addResourceBundle(lng, "translation", resource, true, true);
	}
	await i18n.changeLanguage(lng);
};

export default i18n;
