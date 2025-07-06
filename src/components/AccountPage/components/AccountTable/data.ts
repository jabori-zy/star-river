import { MT5Account, BinanceAccount, OKXAccount } from "@/types/account"

// MT5账户基础模板数据
const mt5AccountsBase: MT5Account[] = [
  {
    id: "mt5-728ed52f",
    accountName: "王明 - MT5",
    account_id: "12345678",
    server: "MetaQuotes-Demo",
    leverage: 100,
    balance: 10000.50,
    equity: 10150.75,
    margin: 325.30,
    status: "normal",
    enabled: true,
    creatTime: "2023-01-10",
  },
  {
    id: "mt5-489e1d42",
    accountName: "李娜 - MT5",
    account_id: "23456789",
    server: "ICMarkets-Live01",
    leverage: 50,
    balance: 7500.25,
    equity: 7450.80,
    margin: 520.45,
    status: "warning",
    enabled: true,
    creatTime: "2023-01-12",
  },
  {
    id: "mt5-590a6f52",
    accountName: "张伟 - MT5",
    account_id: "34567890",
    server: "Exness-Live02",
    leverage: 200,
    balance: 15000.00,
    equity: 15300.50,
    margin: 750.25,
    status: "normal",
    enabled: true,
    creatTime: "2023-01-14",
  },
  {
    id: "mt5-a9f88fdc",
    accountName: "赵丽 - MT5",
    account_id: "45678901",
    server: "FxPro-Demo",
    leverage: 500,
    balance: 5000.75,
    equity: 4250.25,
    margin: 825.50,
    status: "error",
    enabled: false,
    creatTime: "2023-01-15",
  },
  {
    id: "mt5-28c6b570",
    accountName: "刘强 - MT5",
    account_id: "56789012",
    server: "XM-Real01",
    leverage: 30,
    balance: 8750.50,
    equity: 8900.00,
    margin: 450.25,
    status: "normal",
    enabled: true,
    creatTime: "2023-01-17",
  },
]

// Binance 账户基础模板数据
const binanceAccountsBase: BinanceAccount[] = [
  {
    id: "bnc-728ed52f",
    accountName: "王明 - Binance",
    apiKey: "t7ULzaklM9sdf8Gj",
    secretKey: "A2C4F6H8J0L2N4P6R8T0V2X4Z6B8D0F2H4",
    permissions: ["SPOT", "FUTURES", "MARGIN"],
    balanceUSDT: 25000.50,
    tradingAllowed: true,
    status: "normal",
    enabled: true,
    creatTime: "2023-02-10",
  },
  {
    id: "bnc-489e1d42",
    accountName: "李娜 - Binance",
    apiKey: "xB5r2PqL09sj5Kf",
    secretKey: "B3E5G7I9K1M3O5Q7S9U1W3Y5A7C9E1G3I5",
    permissions: ["SPOT", "EARN"],
    balanceUSDT: 12500.25,
    tradingAllowed: true,
    status: "warning",
    enabled: true,
    creatTime: "2023-02-12",
  },
  {
    id: "bnc-590a6f52",
    accountName: "张伟 - Binance",
    apiKey: "kM3nB7vF2pQ8rT0",
    secretKey: "J5L7N9P1R3T5V7X9Z1B3D5F7H9J1L3N5P7",
    permissions: ["SPOT", "FUTURES", "MARGIN", "EARN"],
    balanceUSDT: 30000.00,
    tradingAllowed: true,
    status: "normal",
    enabled: true,
    creatTime: "2023-02-14",
  },
  {
    id: "bnc-a9f88fdc",
    accountName: "赵丽 - Binance",
    apiKey: "pR7tY3vX1zL9mK4",
    secretKey: "Q7S9U1W3Y5A7C9E1G3I5K7M9O1Q3S5U7W9",
    permissions: ["SPOT"],
    balanceUSDT: 18500.75,
    tradingAllowed: false,
    status: "inactive",
    enabled: false,
    creatTime: "2023-02-15",
  },
]

// OKX 账户基础模板数据
const okxAccountsBase: OKXAccount[] = [
  {
    id: "okx-728ed52f",
    accountName: "王明 - OKX",
    accountId: "12345-67890",
    apiVersion: "v5",
    marginMode: "cross",
    totalAssets: 18000.50,
    availableBalance: 17800.25,
    status: "normal",
    enabled: true,
    creatTime: "2023-03-10",
  },
  {
    id: "okx-489e1d42",
    accountName: "李娜 - OKX",
    accountId: "23456-78901",
    apiVersion: "v5",
    marginMode: "isolated",
    totalAssets: 9500.75,
    availableBalance: 9200.50,
    status: "warning",
    enabled: true,
    creatTime: "2023-03-12",
  },
  {
    id: "okx-590a6f52",
    accountName: "张伟 - OKX",
    accountId: "34567-89012",
    apiVersion: "v5",
    marginMode: "cross",
    totalAssets: 22000.00,
    availableBalance: 21500.25,
    status: "error",
    enabled: false,
    creatTime: "2023-03-14",
  },
]

// 中文姓名列表，用于生成测试数据
const chineseNames = [
  "李明", "张伟", "王芳", "刘强", "陈静", "杨华", "赵燕", "周涛", "吴洁", "郑阳",
  "孙艳", "马超", "朱磊", "胡晓", "林峰", "高涛", "谢军", "黄勇", "梁红", "宋玲",
  "唐敏", "许刚", "韩冰", "邓浩", "冯雪", "曹明", "彭勇", "董芳", "袁华", "于洋",
  "徐静", "何超", "罗敏", "郝勇", "乔杰", "秦雪", "江涛", "崔健", "孔明", "邹静",
  "姜超", "石磊", "萧红", "钱伟", "章勇", "杜静", "阎王", "薛明", "贺芳", "倪强"
]

// 服务器列表，用于生成测试数据
const mt5Servers = [
  "MetaQuotes-Demo", "ICMarkets-Live01", "Exness-Live02", "FxPro-Demo", "XM-Real01",
  "Pepperstone-Live03", "FXCM-Demo", "Deriv-Live01", "OANDA-Real", "Tickmill-Live02"
]

// 状态列表
const statusOptions: Array<"normal" | "warning" | "error" | "inactive"> = ["normal", "warning", "error", "inactive"]

// 权限组合列表
const permissionCombinations = [
  ["SPOT"],
  ["SPOT", "EARN"],
  ["SPOT", "FUTURES"],
  ["SPOT", "FUTURES", "MARGIN"],
  ["SPOT", "FUTURES", "MARGIN", "EARN"]
]

// 生成随机日期字符串，格式为YYYY-MM-DD
function generateRandomDate(startYear = 2022, endYear = 2024) {
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear
  const month = Math.floor(Math.random() * 12) + 1
  const day = Math.floor(Math.random() * 28) + 1 // 避免月份天数问题，使用28天
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

// 生成随机的MT5账户
function generateMT5Accounts(count: number): MT5Account[] {
  const accounts: MT5Account[] = [...mt5AccountsBase]
  
  for (let i = 0; i < count - mt5AccountsBase.length; i++) {
    const randomName = chineseNames[Math.floor(Math.random() * chineseNames.length)]
    const randomServer = mt5Servers[Math.floor(Math.random() * mt5Servers.length)]
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)]
    const randomDate = generateRandomDate()
    const randomBalance = Math.floor(Math.random() * 50000) + 1000
    const randomEquity = randomBalance * (0.9 + Math.random() * 0.3) // 净值在余额的90%-120%之间
    const randomMargin = randomBalance * (Math.random() * 0.3) // 保证金在余额的0-30%之间
    
    accounts.push({
      id: `mt5-${Math.random().toString(36).substring(2, 10)}`,
      accountName: `${randomName} - MT5 ${i + 6}`,
      account_id: Math.floor(10000000 + Math.random() * 90000000).toString(),
      server: randomServer,
      leverage: [5, 10, 20, 50, 100, 200, 500][Math.floor(Math.random() * 7)],
      balance: parseFloat(randomBalance.toFixed(2)),
      equity: parseFloat(randomEquity.toFixed(2)),
      margin: parseFloat(randomMargin.toFixed(2)),
      status: randomStatus,
      enabled: Math.random() > 0.2, // 80%概率为true
      creatTime: randomDate,
    })
  }
  
  return accounts
}

// 生成随机的Binance账户
function generateBinanceAccounts(count: number): BinanceAccount[] {
  const accounts: BinanceAccount[] = [...binanceAccountsBase]
  
  for (let i = 0; i < count - binanceAccountsBase.length; i++) {
    const randomName = chineseNames[Math.floor(Math.random() * chineseNames.length)]
    const randomPermissions = permissionCombinations[Math.floor(Math.random() * permissionCombinations.length)]
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)]
    const randomDate = generateRandomDate()
    const randomBalance = Math.floor(Math.random() * 100000) + 5000
    
    accounts.push({
      id: `bnc-${Math.random().toString(36).substring(2, 10)}`,
      accountName: `${randomName} - Binance ${i + 5}`,
      apiKey: Math.random().toString(36).substring(2, 18),
      secretKey: Math.random().toString(36).substring(2, 40),
      permissions: randomPermissions,
      balanceUSDT: parseFloat(randomBalance.toFixed(2)),
      tradingAllowed: Math.random() > 0.1, // 90%概率为true
      status: randomStatus,
      enabled: Math.random() > 0.2, // 80%概率为true
      creatTime: randomDate,
    })
  }
  
  return accounts
}

// 生成随机的OKX账户
function generateOKXAccounts(count: number): OKXAccount[] {
  const accounts: OKXAccount[] = [...okxAccountsBase]
  
  for (let i = 0; i < count - okxAccountsBase.length; i++) {
    const randomName = chineseNames[Math.floor(Math.random() * chineseNames.length)]
    const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)]
    const randomDate = generateRandomDate()
    const randomTotalAssets = Math.floor(Math.random() * 80000) + 3000
    const randomAvailableBalance = randomTotalAssets * (0.7 + Math.random() * 0.25) // 可用余额在总资产的70%-95%之间
    
    accounts.push({
      id: `okx-${Math.random().toString(36).substring(2, 10)}`,
      accountName: `${randomName} - OKX ${i + 4}`,
      accountId: `${Math.floor(10000 + Math.random() * 90000)}-${Math.floor(10000 + Math.random() * 90000)}`,
      apiVersion: Math.random() > 0.3 ? "v5" : "v4",
      marginMode: Math.random() > 0.5 ? "cross" : "isolated",
      totalAssets: parseFloat(randomTotalAssets.toFixed(2)),
      availableBalance: parseFloat(randomAvailableBalance.toFixed(2)),
      status: randomStatus,
      enabled: Math.random() > 0.2, // 80%概率为true
      creatTime: randomDate,
    })
  }
  
  return accounts
}

// 生成大量测试数据
export const metatrader5Accounts = generateMT5Accounts(42) // 生成42个MT5账户
export const binanceAccounts = generateBinanceAccounts(30) // 生成30个Binance账户
export const okxAccounts = generateOKXAccounts(28) // 生成28个OKX账户

// 默认导出所有账户数据
export const accounts = [
  ...metatrader5Accounts,
  ...binanceAccounts,
  ...okxAccounts,
] // 总共100个账户 