import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { 
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MT5Account, 
  BinanceAccount, 
  OKXAccount 
} from "@/types/account"
import { DragHandle } from "./DragHandle"
import axios from "axios"
import { Trash2, CirclePlay } from 'lucide-react';

// 为开关按钮创建一个独立的组件，这样可以正确使用useState
// 账户开关
function AccountAvaliableSwitch({ enabled, onChange }: { enabled: boolean, onChange?: (value: boolean) => void }){
  const [isEnabled, setIsEnabled] = useState(enabled)
  
  const handleChange = (value: boolean) => {
    setIsEnabled(value)
    onChange?.(value)
  }
  
  return (
    <Switch
      checked={isEnabled}
      onCheckedChange={handleChange}
      aria-label="账户开关"
    />
  )
}

// 状态样式和文本的公共方法
const getStatusStyle = (status: string) => {
  switch (status) {
    case "normal":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "warning":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "error":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "inactive":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "normal": return "正常"
    case "warning": return "警告"
    case "error": return "错误"
    case "inactive": return "未激活"
    default: return "未知"
  }
}

// Metatrader5账户列定义
export const mt5Columns: ColumnDef<MT5Account>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "accountName",
    header: "账户名称",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("accountName")}</div>,
  },
  {
    accessorKey: "accountId",
    header: "登录账号",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("accountId")}</div>,
  },
  {
    accessorKey: "server",
    header: "服务器",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("server")}</div>,
  },
  {
    accessorKey: "terminalPath",
    header: "终端路径",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("terminalPath")}</div>,
  },
  {
    accessorKey: "leverage",
    header: "杠杆",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("leverage")}:1</div>,
  },
  {
    accessorKey: "balance",
    header: "余额",
    cell: ({ row }) => {
      const balance = parseFloat(row.getValue("balance"))
      const formatted = new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "USD",
      }).format(balance)
      return <div className="whitespace-nowrap">{formatted}</div>
    },
  },
  {
    accessorKey: "equity",
    header: "净值",
    cell: ({ row }) => {
      const equity = parseFloat(row.getValue("equity"))
      const formatted = new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "USD",
      }).format(equity)
      return <div className="whitespace-nowrap">{formatted}</div>
    },
  },
  {
    accessorKey: "margin",
    header: "保证金",
    cell: ({ row }) => {
      const margin = parseFloat(row.getValue("margin"))
      const formatted = new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "USD",
      }).format(margin)
      return <div className="whitespace-nowrap">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "账户状态",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      
      return (
        <div className="whitespace-nowrap">
          <Badge className={`${getStatusStyle(status)}`}>
            {getStatusText(status)}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "enabled",
    header: "账户开关",
    cell: ({ row }) => {
      const enabled = row.getValue("enabled") as boolean
      // 使用API调用的处理函数
      const handleAccountToggle = (value: boolean) => {
        console.log(`账户 ${row.original.id} 状态被设置为: ${value}`)
        row.original.enabled = value
        console.log(row.original)
        
      }
      
      return (
        <div className="whitespace-nowrap">
          <AccountAvaliableSwitch enabled={enabled} onChange={handleAccountToggle} />
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("createdAt")}</div>,
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const account = row.original
      // 启动客户端
      const handleStartTerminal = async (terminal_id: number,terminalPath: string) => {
        console.log(`启动客户端: ${terminalPath}`)
        // 调用API启动客户端
        const {data} = await axios.post(`http://localhost:3100/start_mt5_terminal?terminalPath=${terminalPath}`)
        console.log(data)
      }
      // 删除账户
      const handleDeleteAccount = async (id: string) => {
        console.log(`删除账户 ${id}`)
        // 调用API删除账户
        const {data} = await axios.delete(`http://localhost:3100/delete_mt5_account_config?id=${id}`)
        console.log(data)
        // 删除后刷新页面
        window.location.reload()
      }

      return (
        <div className="whitespace-nowrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-full">
                <span className="sr-only">打开菜单</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>账户操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
                onClick={() => handleStartTerminal(account.terminalPath)}
              >
                <CirclePlay className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-blue-600 dark:text-blue-400">启动客户端</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center cursor-pointer hover:bg-red-50 dark:hover:bg-red-950"
                onClick={() => handleDeleteAccount(account.id)}
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-red-500">删除账户</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

// Binance账户列定义
export const binanceColumns: ColumnDef<BinanceAccount>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "账户名称",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "apiKey",
    header: "API密钥",
    cell: ({ row }) => {
      const apiKey = row.getValue("apiKey") as string
      return <div className="whitespace-nowrap">{apiKey.substring(0, 8)}***</div>
    },
  },
  {
    accessorKey: "permissions",
    header: "权限",
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {permissions.map((permission, index) => (
            <Badge key={index} variant="outline">
              {permission}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    accessorKey: "balanceUSDT",
    header: "USDT余额",
    cell: ({ row }) => {
      const balance = parseFloat(row.getValue("balanceUSDT"))
      const formatted = new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "USD",
      }).format(balance)
      return <div className="whitespace-nowrap">{formatted}</div>
    },
  },
  {
    accessorKey: "tradingAllowed",
    header: "交易许可",
    cell: ({ row }) => {
      const tradingAllowed = row.getValue("tradingAllowed") as boolean
      return (
        <div className="whitespace-nowrap">
          <Badge variant={tradingAllowed ? "default" : "destructive"}>
            {tradingAllowed ? "允许" : "禁止"}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "账户状态",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      
      return (
        <div className="whitespace-nowrap">
          <Badge className={`${getStatusStyle(status)}`}>
            {getStatusText(status)}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "enabled",
    header: "账户开关",
    cell: ({ row }) => {
      const enabled = row.getValue("enabled") as boolean
      // 使用API调用的处理函数
      const handleAccountToggle = (value: boolean) => {
        console.log(`账户 ${row.original.id} 状态被设置为: ${value}`)
        // 这里可以添加实际的API调用来更新账户状态
      }
      
      return (
        <div className="whitespace-nowrap">
          <AccountAvaliableSwitch enabled={enabled} onChange={handleAccountToggle} />
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("createdAt")}</div>,
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const account = row.original

      return (
        <div className="whitespace-nowrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-full">
                <span className="sr-only">打开菜单</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>账户操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => navigator.clipboard.writeText(account.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>复制账户ID</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>查看账户详情</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 2v6h-6"></path>
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                  <path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
                  <path d="M21 22v-6h-6"></path>
                </svg>
                <span className="text-blue-600 dark:text-blue-400">刷新API密钥</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1v22"></path>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span>编辑权限</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]

// OKX账户列定义
export const okxColumns: ColumnDef<OKXAccount>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "账户名称",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "accountId",
    header: "账户ID",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("accountId")}</div>,
  },
  {
    accessorKey: "apiVersion",
    header: "API版本",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("apiVersion")}</div>,
  },
  {
    accessorKey: "marginMode",
    header: "保证金模式",
    cell: ({ row }) => {
      const marginMode = row.getValue("marginMode") as string
      return (
        <div className="whitespace-nowrap">
          <Badge variant="outline">
            {marginMode === "cross" ? "全仓" : "逐仓"}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "totalAssets",
    header: "总资产",
    cell: ({ row }) => {
      const assets = parseFloat(row.getValue("totalAssets"))
      const formatted = new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "USD",
      }).format(assets)
      return <div className="whitespace-nowrap">{formatted}</div>
    },
  },
  {
    accessorKey: "availableBalance",
    header: "可用余额",
    cell: ({ row }) => {
      const balance = parseFloat(row.getValue("availableBalance"))
      const formatted = new Intl.NumberFormat("zh-CN", {
        style: "currency",
        currency: "USD",
      }).format(balance)
      return <div className="whitespace-nowrap">{formatted}</div>
    },
  },
  {
    accessorKey: "status",
    header: "账户状态",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      
      return (
        <div className="whitespace-nowrap">
          <Badge className={`${getStatusStyle(status)}`}>
            {getStatusText(status)}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "enabled",
    header: "账户开关",
    cell: ({ row }) => {
      const enabled = row.getValue("enabled") as boolean
      // 使用API调用的处理函数
      const handleAccountToggle = (value: boolean) => {
        console.log(`账户 ${row.original.id} 状态被设置为: ${value}`)
        // 这里可以添加实际的API调用来更新账户状态
      }
      
      return (
        <div className="whitespace-nowrap">
          <AccountAvaliableSwitch enabled={enabled} onChange={handleAccountToggle} />
        </div>
      )
    },
  },
  {
    accessorKey: "createTime",
    header: "创建时间",
    cell: ({ row }) => <div className="whitespace-nowrap">{row.getValue("createTime")}</div>,
  },
  {
    id: "actions",
    header: "操作",
    cell: ({ row }) => {
      const account = row.original

      return (
        <div className="whitespace-nowrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted rounded-full">
                <span className="sr-only">打开菜单</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>账户操作</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                onClick={() => navigator.clipboard.writeText(account.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>复制账户ID</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>查看账户详情</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center cursor-pointer hover:bg-green-50 dark:hover:bg-green-950"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                  <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                </svg>
                <span className="text-green-600 dark:text-green-400">切换保证金模式</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20"></path>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span className="text-amber-600 dark:text-amber-400">提取资金</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
] 