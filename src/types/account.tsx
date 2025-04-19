// 定义账户公共属性
export interface BaseAccount {
  id: string
  accountName: string
  // 公共字段
  status: "normal" | "warning" | "error" | "inactive"
  enabled: boolean
  createdTime: string
}

// Metatrader5特有属性
export interface MT5Account extends BaseAccount {
  login: string
  server: string
  terminalPath: string
  leverage: number | null
  balance: number | null
  equity: number | null
  margin: number | null
}

// Binance特有属性
export interface BinanceAccount extends BaseAccount {
  apiKey: string
  secretKey: string
  permissions: string[]
  balanceUSDT: number
  tradingAllowed: boolean
}

// OKX特有属性
export interface OKXAccount extends BaseAccount {
  accountId: string
  apiVersion: string
  marginMode: "cross" | "isolated"
  totalAssets: number
  availableBalance: number
}

// 定义账户联合类型
export type Account = MT5Account | BinanceAccount | OKXAccount



