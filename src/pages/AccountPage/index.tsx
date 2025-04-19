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
import useAccountSSE from "@/hooks/use-accountSSE"
import React from "react"

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
    id: string,
    account_name: string,
    account_id: string,
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
  const accountData = useAccountSSE() as AccountSSEData | null;

  // 根据交易所，从接口获取账户数据
  const getAccountConfigByExchange = useCallback(async (exchange: string) => {
    // 根据交易所，映射账户配置数据
    if (exchange === "metatrader5") {
      try {
        const {data} = await axios.get(`http://localhost:3100/get_mt5_account_config`)
        const configData = data.data || []
        const mt5Accounts = handleMapMT5Accounts(configData)
        // 设置账户数据
        setMt5AccountData(mt5Accounts)
        // 打印新的数据（只用于调试）
        console.log("获取到的MT5账户数据:", configData)
      } catch (error) {
        console.error("获取MT5账户数据失败:", error)
      }
    }
  }, [])

  // 处理页面首次加载和Tab切换时获取数据
  useEffect(() => {
    // 获取账户数据
    getAccountConfigByExchange(activeTab)
  }, [activeTab, getAccountConfigByExchange])
  
  // 单独处理SSE推送的数据更新
  useEffect(() => {
    if (accountData) {
      // 如果是当前选中的账户类型，则直接使用SSE推送的数据更新UI
      console.log("收到账户更新SSE:", accountData);
      
      // 如果SSE推送的是完整数据，可以直接使用，无需重新调用API
      if (activeTab === "metatrader5" && accountData.data && Array.isArray(accountData.data)) {
        try {
          // 假设SSE推送了完整的账户数据列表
          const mt5Accounts = handleMapMT5Accounts(accountData.data);
          setMt5AccountData(mt5Accounts);
        } catch (error) {
          console.error("处理SSE推送数据失败:", error);
          // 如果处理失败，回退到API请求
          getAccountConfigByExchange(activeTab);
        }
      }
    }
  }, [accountData, activeTab, getAccountConfigByExchange]);
  
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
      account_id: accountData.login,
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
      console.log("响应数据:", res)

      // 如果添加成功，则刷新账户数据
      if (res.data.code === 200) {
        getAccountConfigByExchange(activeTab)
      }
    }).catch(error => {
      console.error("添加账户失败:", error)
    })
  }

  // 映射mt5账户的数据
  const handleMapMT5Accounts = (data: Array<{
    id: string,
    account_name: string,
    account_id: string,
    server: string,
    terminal_path: string,
    status: "normal" | "warning" | "error" | "inactive",
    is_available: boolean,
    created_time: string
  }>) => {
    const mt5Accounts: MT5Account[] = []
    data.forEach((item) => {
      mt5Accounts.push({
        id: item.id,
        accountName: item.account_name,
        login: item.account_id,
        server: item.server,
        terminalPath: item.terminal_path,
        status: item.status,
        enabled: item.is_available,
        createdTime: item.created_time,
        leverage: 0,
        balance: 0,
        equity: 0,
        margin: 0,
      })
    })
    return mt5Accounts
  }
    
  
  
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



