import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { SupportLanguage } from "@/types/system";
import enUSIndicator from "./en-US/indicator";
import enUSMarket from "./en-US/market";
import enUSNode from "./en-US/node";
import enUSSetting from "./en-US/setting";
import enUSStrategy from "./en-US/strategy";
import zhCNIndicator from "./zh-CN/indicator";
import zhCNMarket from "./zh-CN/market";
import zhCNNode from "./zh-CN/node";
// 导入所有语言模块
import zhCNSetting from "./zh-CN/setting";
import zhCNStrategy from "./zh-CN/strategy";

// 语言模块映射
const languageModules = {
	[SupportLanguage.ZH_CN]: {
		setting: zhCNSetting,
		strategy: zhCNStrategy,
		indicator: zhCNIndicator,
		market: zhCNMarket,
		node: zhCNNode,
	},
	[SupportLanguage.EN_US]: {
		setting: enUSSetting,
		strategy: enUSStrategy,
		indicator: enUSIndicator,
		market: enUSMarket,
		node: enUSNode,
	},
};

// 构建语言资源的函数
const buildLanguageResource = (
	modules: Record<string, Record<string, any>>,
) => ({
	translation: {
		...Object.values(modules).reduce(
			(acc, module) => ({ ...acc, ...module }),
			{},
		),
	},
});

// 构建所有语言资源
const resources = Object.entries(languageModules).reduce(
	(acc, [lang, modules]) => {
		acc[lang] = buildLanguageResource(modules);
		return acc;
	},
	{} as Record<string, { translation: Record<string, any> }>,
);

i18n.use(initReactI18next).init({
	resources,
	lng: undefined, // 不设置初始语言，等待从数据库加载
	fallbackLng: SupportLanguage.ZH_CN,
	interpolation: {
		escapeValue: false,
	},
});

export const changeLanguage = i18n.changeLanguage;

export default i18n;
