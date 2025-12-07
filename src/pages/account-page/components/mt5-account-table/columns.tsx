import type { ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { CirclePlay, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteAccountConfig, startMt5Terminal } from "@/service/account";
import type { MT5Account } from "@/types/account";
import { DragHandle } from "../account-table/drag-handle";

// Format date time
const formatDateTime = (dateTimeStr: string) => {
	if (!dateTimeStr) return "-";
	try {
		const date = new Date(dateTimeStr);
		return date
			.toLocaleString("zh-CN", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
				hour12: false,
			})
			.replace(/\//g, "-");
	} catch {
		return dateTimeStr;
	}
};

// Terminal status text
export const getTerminalStatus = (status: string) => {
	switch (status) {
		case "connected":
			return "已连接";
		case "disconnected":
			return "未连接";
	}
};

// Terminal status style
export const getTerminalStatusStyle = (status: string) => {
	switch (status) {
		case "connected":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "disconnected":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
		case "connecting":
			return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
	}
};

// EA status style
export const getEAStatusStyle = (status: string) => {
	switch (status) {
		case "open":
			return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
		case "close":
			return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
	}
};

// EA status text
export const getEAStatus = (status: string) => {
	switch (status) {
		case "open":
			return "已开启";
		case "close":
			return "已关闭";
	}
};

// Create a separate component for the switch button to correctly use useState
// Account switch
function AccountAvaliableSwitch({
	enabled,
	onChange,
}: {
	enabled: boolean;
	onChange?: (value: boolean) => void;
}) {
	const [isEnabled, setIsEnabled] = useState(enabled);

	const handleChange = (value: boolean) => {
		setIsEnabled(value);
		onChange?.(value);
	};

	return (
		<Switch
			checked={isEnabled}
			onCheckedChange={handleChange}
			aria-label="账户开关"
		/>
	);
}

// Metatrader5 account column definitions
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
		cell: ({ row }) => (
			<div className="whitespace-nowrap">{row.getValue("accountName")}</div>
		),
	},
	{
		accessorKey: "login",
		header: "登录账号",
		cell: ({ row }) => (
			<div className="whitespace-nowrap">{row.getValue("login")}</div>
		),
	},
	{
		accessorKey: "server",
		header: "服务器",
		cell: ({ row }) => (
			<div className="whitespace-nowrap">{row.getValue("server")}</div>
		),
	},
	{
		accessorKey: "terminalPath",
		header: "终端路径",
		cell: ({ row }) => {
			const path = row.getValue("terminalPath") as string;
			// Extract file name part
			const fileName = path.split("\\").pop()?.split("/").pop() || path;

			// Extract drive letter
			let driveLetter = "";
			if (path.match(/^[A-Za-z]:/)) {
				driveLetter = path.charAt(0).toUpperCase();
			}

			// Set Badge color
			const getDriveColor = (drive: string) => {
				switch (drive) {
					case "C":
						return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
					case "D":
						return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
					case "E":
						return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
					default:
						return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
				}
			};

			return (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center max-w-[200px] cursor-help">
								{driveLetter && (
									<Badge
										variant="outline"
										className={`mr-1.5 px-1.5 py-0 h-4 min-w-[1.2rem] text-[10px] rounded-sm ${getDriveColor(driveLetter)}`}
									>
										{driveLetter}
									</Badge>
								)}
								<span className="truncate" title={path}>
									{fileName}
								</span>
							</div>
						</TooltipTrigger>
						<TooltipContent side="top" className="max-w-sm">
							<p className="font-mono text-xs">{path}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			);
		},
	},
	{
		accessorKey: "leverage",
		header: "杠杆",
		cell: ({ row }) => {
			const leverage = row.getValue("leverage");
			return (
				<div className="whitespace-nowrap">
					{leverage ? `${leverage}:1` : "-"}
				</div>
			);
		},
	},
	{
		accessorKey: "balance",
		header: "余额",
		cell: ({ row }) => {
			const balance = row.getValue("balance");
			if (balance === null || balance === undefined)
				return <div className="whitespace-nowrap">-</div>;

			const formatted = new Intl.NumberFormat("zh-CN", {
				style: "currency",
				currency: "USD",
			}).format(Number(balance));
			return <div className="whitespace-nowrap">{formatted}</div>;
		},
	},
	{
		accessorKey: "equity",
		header: "净值",
		cell: ({ row }) => {
			const equity = row.getValue("equity");
			if (equity === null || equity === undefined)
				return <div className="whitespace-nowrap">-</div>;

			const formatted = new Intl.NumberFormat("zh-CN", {
				style: "currency",
				currency: "USD",
			}).format(Number(equity));
			return <div className="whitespace-nowrap">{formatted}</div>;
		},
	},
	{
		accessorKey: "margin",
		header: "保证金",
		cell: ({ row }) => {
			const margin = row.getValue("margin");
			if (margin === null || margin === undefined)
				return <div className="whitespace-nowrap">-</div>;

			const formatted = new Intl.NumberFormat("zh-CN", {
				style: "currency",
				currency: "USD",
			}).format(Number(margin));
			return <div className="whitespace-nowrap">{formatted}</div>;
		},
	},
	{
		accessorKey: "terminalStatus",
		header: "终端状态",
		cell: ({ row }) => {
			const status = row.getValue("terminalStatus") as string;

			return (
				<div className="whitespace-nowrap">
					<Badge className={`${getTerminalStatusStyle(status)}`}>
						{getTerminalStatus(status)}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "eaStatus",
		header: "EA交易状态",
		cell: ({ row }) => {
			const status = row.getValue("eaStatus") as string;

			return (
				<div className="whitespace-nowrap">
					<Badge className={`${getEAStatusStyle(status)}`}>
						{getEAStatus(status)}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "isAvailable",
		header: "账户开关",
		cell: ({ row }) => {
			const isAvailable = row.getValue("isAvailable") as boolean;
			// Handler function using API call
			const handleAccountToggle = async (value: boolean) => {
				console.log(`账户 ${row.original.id} 状态被设置为: ${value}`);
				row.original.isAvailable = value;
				console.log(row.original);
				// Call API to update account status
				const requestBody = {
					id: row.original.id,
					is_available: value,
				};
				// Send request via axios
				axios
					.post(
						"http://localhost:3100/update_mt5_account_config_is_available",
						requestBody,
						{
							headers: {
								"Content-Type": "application/json",
							},
						},
					)
					.then((res) => {
						// If successful, refresh account data
						if (res.data.code === 200) {
							window.location.reload();
						}
					})
					.catch((error) => {
						console.error("切换账户状态失败:", error);
					});
			};

			return (
				<div className="whitespace-nowrap">
					<AccountAvaliableSwitch
						enabled={isAvailable}
						onChange={handleAccountToggle}
					/>
				</div>
			);
		},
	},
	{
		accessorKey: "createdTime",
		header: "创建时间",
		cell: ({ row }) => (
			<div className="whitespace-nowrap">
				{formatDateTime(row.getValue("createdTime"))}
			</div>
		),
	},
	{
		id: "actions",
		header: "操作",
		cell: ({ row }) => {
			const account = row.original;
			// Start terminal
			const handleStartTerminal = async (account_id: number) => {
				startMt5Terminal(account_id);
			};
			// Delete account
			const handleDeleteAccount = async (id: number) => {
				console.log(`删除账户 ${id}`);
				// Call API to delete account
				const { data } = await deleteAccountConfig(id);
				console.log(data);
				// Refresh page after deletion
				window.location.reload();
			};

			return (
				<div className="whitespace-nowrap">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								className="h-8 w-8 p-0 hover:bg-muted rounded-full"
							>
								<span className="sr-only">打开菜单</span>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-48">
							<DropdownMenuLabel>账户操作</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="flex items-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950"
								onClick={() => handleStartTerminal(account.id)}
							>
								<CirclePlay className="h-4 w-4 mr-2 text-blue-500" />
								<span className="text-blue-600 dark:text-blue-400">
									启动客户端
								</span>
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
			);
		},
	},
];
