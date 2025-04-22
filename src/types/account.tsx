// 定义账户公共属性
export interface BaseAccount {
  id: number
  accountName: string
  isAvailable: boolean
  createdTime: string
}

// Metatrader5特有属性
export interface MT5Account extends BaseAccount {
  login: number
  server: string
  terminalPath: string
  leverage: number | null
  balance: number | null
  equity: number | null
  margin: number | null
  terminalStatus: string
  eaStatus: string
  
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
  apiVersion: string
  marginMode: "cross" | "isolated"
  totalAssets: number
  availableBalance: number
}

// 定义账户联合类型
export type Account = MT5Account | BinanceAccount | OKXAccount



