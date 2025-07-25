export enum SupportLanguage {
	ZH_CN = "zh-CN",
	EN_US = "en-US",
}

export interface SystemConfig {
	id: number;
	localization: SupportLanguage;
}
