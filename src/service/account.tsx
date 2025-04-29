import axios from "axios"
import { MT5Account } from "../types/account"
// MT5账户配置数据
// 根据交易所，获取账户配置数据
export async function getAccountConfigByExchange(exchange: string): Promise<MT5Account[]> {
    // 根据交易所，映射账户配置数据
    if (exchange === "metatrader5") {
      try {
        const {data} = await axios.get(`http://localhost:3100/get_account_config?exchange=${exchange}`)
        const configData = data.data || []
        console.log("获取到的MT5账户配置:", configData)
        const mt5Accounts: MT5Account[] = []
        configData.forEach((item: {
            id: number,
            account_name: string,
            config: {
                login: number,
                password: string,
                server: string,
                terminal_path: string,
            }
            is_available: boolean,
            created_time: string
        }) => {
            mt5Accounts.push({
              id: item.id,  // 转换为数字类型
              accountName: item.account_name,
              login: item.config.login,  // 转换为数字类型
              server: item.config.server,
              terminalPath: item.config.terminal_path,
              isAvailable: item.is_available,
              createdTime: item.created_time,
              leverage: 0,
              balance: 0,
              equity: 0,
              margin: 0,
              terminalStatus: "disconnected",
              eaStatus: "close",
            })
          })
        
        // 设置账户数据
        return mt5Accounts
      } catch (error) {
        console.error("获取MT5账户数据失败:", error)
        return []
      }
    }
    
    // 默认返回空数组
    return []
}