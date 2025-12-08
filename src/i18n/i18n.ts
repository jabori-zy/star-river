import i18n from "i18next";
import { camelCase } from "lodash-es";
import { initReactI18next } from "react-i18next";
import { SupportLanguage } from "@/types/system";
import enUSApiMessage from "./en-US/api-message";
// Statically import en-US resources as default
import enUSCommon from "./en-US/common";
import enUSComponent from "./en-US/component";
import enUSDektop from "./en-US/desktop";
import enUSFuturesOrderNode from "./en-US/futures-order-node";
import enUSIfElseNode from "./en-US/if-else-node";
import enUSIndicator from "./en-US/indicator";
import enUSIndicatorNode from "./en-US/indicator-node";
import enUSKlineNode from "./en-US/kline-node";
import enUSMarket from "./en-US/market";
import enUSNode from "./en-US/node";
import enUSPositionNode from "./en-US/position-node";
import enUSSetting from "./en-US/setting";
import enUSStartNode from "./en-US/start-node";
import enUSStrategy from "./en-US/strategy";
import enUSVariableNode from "./en-US/variable-node";

// Define all namespaces (module names)
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
	"futures-order-node",
	"position-node",
	"kline-node",
	"indicator-node",
	"component",
];

// Dynamically import language resources with fallback mechanism
const requireSilent = async (lang: string, namespace: string) => {
	let res: Record<string, any>;
	try {
		res = (await import(`./${lang}/${namespace}.ts`)).default;
	} catch {
		// If target language doesn't exist, fallback to en-US
		res = (await import(`./en-US/${namespace}.ts`)).default;
	}
	return res;
};

// Asynchronously load all resources for specified language
export const loadLangResources = async (lang: string) => {
	const modules = await Promise.all(
		NAMESPACES.map((ns) => requireSilent(lang, ns)),
	);
	const resources = modules.reduce(
		(acc, mod, index) => {
			acc[camelCase(NAMESPACES[index])] = mod;
			return acc;
		},
		{} as Record<string, any>,
	);
	return resources;
};

// Use statically imported en-US resources during initialization
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
				futuresOrderNode: enUSFuturesOrderNode,
				positionNode: enUSPositionNode,
				klineNode: enUSKlineNode,
				indicatorNode: enUSIndicatorNode,
				component: enUSComponent,
			},
		},
	};
};

// Initialize i18n
if (!i18n.isInitialized) {
	i18n.use(initReactI18next).init({
		lng: undefined, // Don't set initial language, wait for database load
		fallbackLng: SupportLanguage.EN_US,
		resources: getInitialTranslations(),
		interpolation: {
			escapeValue: false,
		},
	});
}

// Switch language (lazy loading)
export const changeLanguage = async (lng?: string) => {
	if (!lng) return;
	if (!i18n.hasResourceBundle(lng, "translation")) {
		const resource = await loadLangResources(lng);
		i18n.addResourceBundle(lng, "translation", resource, true, true);
	}
	await i18n.changeLanguage(lng);
};

export default i18n;
