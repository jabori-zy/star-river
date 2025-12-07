import type { FormFieldConfig } from ".";

// MT5 account form configuration
export const mt5FormConfig = {
	title: "Add MT5 Account",
	description: "Please fill in the required information for MT5 account",
	fields: [
		{
			name: "accountName",
			label: "Account Name",
			type: "text",
			placeholder: "Enter custom account name",
			description: "Custom account name to distinguish different accounts",
			required: true,
		},
		{
			name: "login",
			label: "Account ID",
			type: "number",
			placeholder: "Enter MT5 account ID",
			description: "Account number assigned by MT5 platform, must be numeric",
			required: true,
		},
		{
			name: "password",
			label: "Password",
			type: "password",
			placeholder: "Enter MT5 account password",
			required: true,
		},
		{
			name: "server",
			label: "Server",
			type: "text", // Changed to text input
			placeholder: "Enter MT5 server address",
			description: "For example: MetaQuotes-Demo, ICMarkets-Live01",
			required: true,
		},
		{
			name: "terminalPath",
			label: "Terminal Path",
			type: "text",
			placeholder: "Enter MT5 client installation path",
			description: "For example: C:\\Program Files\\MetaTrader 5",
			required: false,
		},
	] as FormFieldConfig[],
	defaultValues: {
		login: "",
		password: "",
		server: "",
		terminalPath: "",
	},
};
