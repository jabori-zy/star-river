import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
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
import type { BinanceAccount } from "@/types/account";
import { DragHandle } from "../account-table/drag-handle";

// 账户开关组件
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
		accessorKey: "accountName",
		header: "账户名称",
		cell: ({ row }) => (
			<div className="whitespace-nowrap">{row.getValue("accountName")}</div>
		),
	},
	{
		accessorKey: "apiKey",
		header: "API密钥",
		cell: ({ row }) => {
			const apiKey = row.getValue("apiKey") as string;
			return (
				<div className="whitespace-nowrap">{apiKey.substring(0, 8)}***</div>
			);
		},
	},
	{
		accessorKey: "permissions",
		header: "权限",
		cell: ({ row }) => {
			const permissions = row.getValue("permissions") as string[];
			return (
				<div className="flex flex-wrap gap-1">
					{permissions.map((permission, index) => (
						<Badge key={index} variant="outline">
							{permission}
						</Badge>
					))}
				</div>
			);
		},
	},
	{
		accessorKey: "balanceUSDT",
		header: "USDT余额",
		cell: ({ row }) => {
			const balance = parseFloat(row.getValue("balanceUSDT"));
			const formatted = new Intl.NumberFormat("zh-CN", {
				style: "currency",
				currency: "USD",
			}).format(balance);
			return <div className="whitespace-nowrap">{formatted}</div>;
		},
	},
	{
		accessorKey: "tradingAllowed",
		header: "交易许可",
		cell: ({ row }) => {
			const tradingAllowed = row.getValue("tradingAllowed") as boolean;
			return (
				<div className="whitespace-nowrap">
					<Badge variant={tradingAllowed ? "default" : "destructive"}>
						{tradingAllowed ? "允许" : "禁止"}
					</Badge>
				</div>
			);
		},
	},
	{
		accessorKey: "isAvailable",
		header: "账户开关",
		cell: ({ row }) => {
			const enabled = row.getValue("isAvailable") as boolean;
			// 使用API调用的处理函数
			const handleAccountToggle = (value: boolean) => {
				console.log(`账户 ${row.original.id} 状态被设置为: ${value}`);
				// 这里可以添加实际的API调用来更新账户状态
			};

			return (
				<div className="whitespace-nowrap">
					<AccountAvaliableSwitch
						enabled={enabled}
						onChange={handleAccountToggle}
					/>
				</div>
			);
		},
	},
	{
		accessorKey: "creatTime",
		header: "创建时间",
		cell: ({ row }) => (
			<div className="whitespace-nowrap">{row.getValue("creatTime")}</div>
		),
	},
	{
		id: "actions",
		header: "操作",
		cell: ({ row }) => {
			const account = row.original;

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
								className="flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
								onClick={() =>
									navigator.clipboard.writeText(String(account.id))
								}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 mr-2 text-slate-500"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
									<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
								</svg>
								<span>复制账户ID</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 mr-2 text-slate-500"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<circle cx="12" cy="12" r="10" />
									<line x1="12" y1="16" x2="12" y2="12" />
									<line x1="12" y1="8" x2="12.01" y2="8" />
								</svg>
								<span>查看账户详情</span>
							</DropdownMenuItem>
							<DropdownMenuItem className="flex items-center cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 mr-2 text-blue-500"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M21 2v6h-6"></path>
									<path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
									<path d="M3 12a9 9 0 0 0 15 6.7L21 16"></path>
									<path d="M21 22v-6h-6"></path>
								</svg>
								<span className="text-blue-600 dark:text-blue-400">
									刷新API密钥
								</span>
							</DropdownMenuItem>
							<DropdownMenuItem className="flex items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4 mr-2 text-slate-500"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M12 1v22"></path>
									<path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
								</svg>
								<span>编辑权限</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			);
		},
	},
];
