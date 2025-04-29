"use client"

import { useState, useEffect, useCallback } from "react"
import { AccountTable } from "./components/AccountTable"
import { mt5Columns, binanceColumns, okxColumns } from "./components/AccountTable/columns"
import { metatrader5Accounts, binanceAccounts, okxAccounts } from "./components/AccountTable/data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AccountsHeader } from "./components/AccountsHeader"
import { Toaster } from "sonner"
import axios from "axios"
import { MT5Account } from "@/types/account"
import useAccountSSE, { AccountInfo } from "@/hooks/use-accountSSE"
import React from "react"
import { getAccountConfigByExchange } from "@/service/account"

// 定义账户类型
type AccountType = {
  id: string
  name: string
  count: number
}

// 账户类型数据
const accountTypes: AccountType[] = [
  {
    id: "metatrader5",
    name: "Metatrader5",
    count: metatrader5Accounts.length,
  },
  {
    id: "binance",
    name: "Binance",
    count: binanceAccounts.length,
  },
  {
    id: "okx",
    name: "OKX",
    count: okxAccounts.length,
  },
]

// 定义SSE数据类型
interface AccountSSEData {
  type?: string;
  data?: Array<{
    account_id: number,
    account_name: string,
    login: string,
    server: string,
    terminal_path: string,
    status: "normal" | "warning" | "error" | "inactive",
    is_available: boolean,
    created_time: string
  }>;
  message?: string;
}

export default function AccountPage() {
  // 当前选中的标签页
  const [activeTab, setActiveTab] = useState("metatrader5")
  // 账户数据，要么存储MT5账户数据，要么存储Binance账户数据，要么存储OKX账户数据
  const [mt5AccountData, setMt5AccountData] = useState<MT5Account[]>([])
  // 获取SSE实时数据
  const accountUpdateMessage = useAccountSSE()

  // 获取账户数据
  const getAccountConfig = useCallback(async (exchange: string) => {
    const accountData = await getAccountConfigByExchange(exchange)
    if (exchange === "metatrader5") {
      setMt5AccountData(accountData)
    }
  }, [])

  // 处理页面首次加载和Tab切换时获取数据
  useEffect(() => {
    // 获取账户数据
    getAccountConfig(activeTab)
  }, [activeTab, getAccountConfig])
  
  // 处理SSE实时数据更新
  useEffect(() => {
    if (accountUpdateMessage && accountUpdateMessage.event_name === "account-updated") {
      // console.log("收到MT5账户实时数据:", accountUpdateMessage);
      
      // 更新MT5账户数据
      setMt5AccountData(prevData => {
        // 根据terminal_id与id匹配，更新账户数据
        const updatedData = prevData.map(account => {
          // 如果account_info为null，则将客户端设置为断开，EA设置为关闭
          if (!accountUpdateMessage.account_info && accountUpdateMessage.account_config.id === account.id) {
            return {
              ...account,
              terminalStatus: "disconnected",
              eaStatus: "close",
            };
          }
          
          // 如果account_info.account_id与account.id匹配，则更新账户数据
          if (accountUpdateMessage.account_config.id === account.id && accountUpdateMessage.account_info) {
            
            // 更新账户数据
            return {
              ...account,
              // 更新指定字段
              leverage: accountUpdateMessage.account_info.info.leverage,
              balance: accountUpdateMessage.account_info.info.balance,
              equity: accountUpdateMessage.account_info.info.equity,
              margin: accountUpdateMessage.account_info.info.margin,
              terminalStatus: accountUpdateMessage.account_info.info.terminal_connected ? "connected" : "disconnected",
              eaStatus: accountUpdateMessage.account_info.info.trade_allowed ? "open" : "close",
              createdTime: accountUpdateMessage.account_info.create_time,
              // 其他字段保持不变
            };
          }
          // 如果不匹配，保持原有数据不变
          return account;
        });
        
        // console.log("更新后的数据:", updatedData);
        return updatedData;
      });
    }
  }, [accountUpdateMessage]);
  
  // 处理标签页切换
  const handleTabChange = (value: string) => {
    // 根据选中的标签页，获取对应的账户数据
    setActiveTab(value)
    // 根据选中的标签页，获取对应的账户数据
    getAccountConfigByExchange(value)
  }
  
  // 处理添加账户
  const handleAddMt5Account = (accountData: {
    accountName: string,
    exchange: string,
    login: string,
    password: string,
    server: string,
    clientPath: string
  }) => {
    console.log("添加MT5账户数据:", accountData)
    
    // 构建请求数据，格式化为正确的 JSON 格式
    const requestData = {
      account_name: accountData.accountName,
      exchange: accountData.exchange,
      login: accountData.login,
      password: accountData.password,
      server: accountData.server,
      terminal_path: accountData.clientPath
      
    }
    
    console.log("发送请求数据:", requestData)
   
    // 发送 POST 请求，指定 Content-Type 为 application/json
    axios.post("http://localhost:3100/add_mt5_account_config", requestData, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((res) => {
      // 如果添加成功，则刷新账户数据
      if (res.data.code === 200) {
        getAccountConfigByExchange(activeTab)
        // 刷新页面
        window.location.reload()
      }
    }).catch(error => {
      console.error("添加账户失败:", error)
    })
  }

  // // 映射mt5账户的数据
  // const handleMapMT5AccountsConfig = (data: Array<{
  //   id: number,
  //   account_name: string,
  //   login: number,
  //   server: string,
  //   terminal_path: string,
  //   is_available: boolean,
  //   created_time: string
  // }>) => {
  //   const mt5Accounts: MT5Account[] = []
  //   data.forEach((item) => {
  //     mt5Accounts.push({
  //       id: item.id,  // 转换为数字类型
  //       accountName: item.account_name,
  //       login: item.login,  // 转换为数字类型
  //       server: item.server,
  //       terminalPath: item.terminal_path,
  //       isAvailable: item.is_available,
  //       createdTime: item.created_time,
  //       leverage: 0,
  //       balance: 0,
  //       equity: 0,
  //       margin: 0,
  //       terminalStatus: "disconnected",
  //       eaStatus: "close",
  //     })
  //   })
  //   return mt5Accounts
  // }
    
  
  
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Tabs 
          defaultValue="metatrader5" 
          className="w-full"
          onValueChange={handleTabChange}
        >
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              {accountTypes.map((type) => (
                <TabsTrigger key={type.id} value={type.id} className="gap-1">
                  {type.name}{" "}
                  <Badge
                    variant="secondary"
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30"
                  >
                    {type.count}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {/* 添加账户按钮 */}
            <AccountsHeader
              activeTab={activeTab}
              onAddAccount={handleAddMt5Account}
            />
          </div>
          
          <TabsContent value="metatrader5">
            <AccountTable 
              tableData={mt5AccountData}
              columns={mt5Columns} 
              title="Metatrader5 账户" 
            />
          </TabsContent>
          
          <TabsContent value="binance">
            <AccountTable 
              tableData={binanceAccounts} 
              columns={binanceColumns} 
              title="Binance 账户" 
            />
          </TabsContent>
          
          <TabsContent value="okx">
            <AccountTable 
              tableData={okxAccounts} 
              columns={okxColumns} 
              title="OKX 账户" 
            />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster richColors position="top-center" />
    </div>
  )
}



