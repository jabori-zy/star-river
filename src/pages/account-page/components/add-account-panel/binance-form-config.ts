import type { FormFieldConfig } from ".";

// Binance账户表单配置
export const binanceFormConfig = {
	title: "添加Binance账户",
	description: "请填写Binance账户的必要信息",
	fields: [
		{
			name: "accountName",
			label: "账户名称",
			type: "text",
			placeholder: "请输入账户自定义名称",
			description: "账户自定义名称,用于区分不同账户",
			required: true,
		},
		{
			name: "apiKey",
			label: "API Key",
			type: "text",
			placeholder: "请输入Binance API Key",
			description: "在Binance账户设置中生成的API密钥",
			required: true,
		},
		{
			name: "apiSecret",
			label: "API Secret",
			type: "password",
			placeholder: "请输入Binance API Secret",
			description: "API密钥对应的密钥",
			required: true,
		},
	] as FormFieldConfig[],
	defaultValues: {
		accountName: "",
		apiKey: "",
		apiSecret: "",
	},
};
