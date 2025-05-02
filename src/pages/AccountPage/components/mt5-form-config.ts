import { FormFieldConfig } from "./AddAccountPanel"

// MT5账户表单配置
export const mt5FormConfig = {
  title: "添加MT5账户",
  description: "请填写MT5账户的必要信息",
  fields: [
    {
      name: "accountName",
      label: "账户名称",
      type: "text",
      placeholder: "请输入账户自定义名称",
      description: "账户自定义名称，用于区分不同账户",
      required: true,
    },
    {
      name: "login",
      label: "账户ID",
      type: "number",
      placeholder: "请输入MT5账户ID",
      description: "MT5平台分配的账号，必须是数字",
      required: true,
    },
    {
      name: "password",
      label: "密码",
      type: "password",
      placeholder: "请输入MT5账户密码",
      required: true,
    },
    {
      name: "server",
      label: "服务器",
      type: "text", // 改为文本输入框
      placeholder: "请输入MT5服务器地址",
      description: "例如：MetaQuotes-Demo、ICMarkets-Live01",
      required: true,
    },
    {
      name: "terminalPath",
      label: "客户端路径",
      type: "text",
      placeholder: "请输入MT5客户端安装路径",
      description: "例如：C:\\Program Files\\MetaTrader 5",
      required: false,
    },
  ] as FormFieldConfig[],
  defaultValues: {
    login: "",
    password: "",
    server: "",
    terminalPath: "",
  },
} 