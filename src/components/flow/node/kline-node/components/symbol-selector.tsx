import { Clock, PlusIcon, Settings, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { SelectedSymbol } from "@/types/node/kline-node";
import type { SelectedAccount } from "@/types/strategy";

interface SymbolSelectorProps {
	selectedSymbols: SelectedSymbol[]; // 已选择的交易对
	selectedDataSource?: SelectedAccount | null; // 已选择的数据源
	onSymbolsChange: (symbols: SelectedSymbol[]) => void; // 交易对变更回调
}

// 时间周期选项
const TIME_INTERVALS = [
	{ value: "1m", label: "1分钟" },
	{ value: "5m", label: "5分钟" },
	{ value: "15m", label: "15分钟" },
	{ value: "30m", label: "30分钟" },
	{ value: "1h", label: "1小时" },
	{ value: "4h", label: "4小时" },
	{ value: "1d", label: "1天" },
	{ value: "1w", label: "1周" },
];

const Symbols = [
	{
		value: "BTCUSDm",
		label: "BTC/USDm",
	},
	{
		value: "ETHUSDm",
		label: "ETH/USDm",
	},
];

// 交易品种选择器
const SymbolSelector: React.FC<SymbolSelectorProps> = ({
	selectedSymbols,
	onSymbolsChange,
	selectedDataSource,
}) => {
	// 本地状态管理
	const [localSymbols, setLocalSymbols] = useState<SelectedSymbol[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingSymbol, setEditingSymbol] = useState<
		SelectedSymbol | undefined
	>(undefined);
	const [symbolName, setSymbolName] = useState<string>("");
	const [symbolInterval, setSymbolInterval] = useState<string>("1m");
	const [nameError, setNameError] = useState<string>("");

	// 检查是否已选择数据源
	const hasDataSource = selectedDataSource?.id !== undefined;

	// 初始化时从props同步到本地状态
	useEffect(() => {
		if (selectedSymbols && selectedSymbols.length > 0) {
			setLocalSymbols([...selectedSymbols]);
		} else {
			setLocalSymbols([]);
		}
	}, [selectedSymbols]);

	// 每次对话框打开时重置状态
	useEffect(() => {
		if (isDialogOpen) {
			if (editingSymbol) {
				setSymbolName(editingSymbol.symbol);
				setSymbolInterval(editingSymbol.interval);
			} else {
				resetForm();
			}
			setNameError("");
		}
	}, [isDialogOpen, editingSymbol]);

	const resetForm = () => {
		setSymbolName("");
		setSymbolInterval("1m");
		setNameError("");
	};

	// 同步数据到父组件
	const syncToParent = (newSymbols: SelectedSymbol[]) => {
		setLocalSymbols(newSymbols);
		onSymbolsChange(newSymbols);
	};

	// 检查交易对是否已存在
	const validateSymbol = (symbol: string, interval: string): boolean => {
		if (!symbol.trim()) {
			setNameError("交易对不能为空");
			return false;
		}

		// const symbolRegex = /^[A-Z0-9]+\/[A-Z0-9]+$/;
		// if (!symbolRegex.test(symbol.toUpperCase())) {
		//     setNameError("交易对格式不正确，应为 BTC/USDT 格式");
		//     return false;
		// }

		const exists = localSymbols.some(
			(s) =>
				s.symbol === symbol &&
				s.interval === interval &&
				!(
					editingSymbol &&
					editingSymbol.symbol === symbol &&
					editingSymbol.interval === interval
				),
		);

		if (exists) {
			setNameError("该交易对和时间周期组合已存在");
			return false;
		}

		setNameError("");
		return true;
	};

	const handleAddSymbol = () => {
		if (!hasDataSource) return; // 如果没有数据源，不执行添加操作
		setEditingSymbol(undefined);
		setIsDialogOpen(true);
	};

	const handleEditSymbol = (symbol: SelectedSymbol) => {
		setEditingSymbol(symbol);
		setIsDialogOpen(true);
	};

	const handleDeleteSymbol = (symbolToDelete: SelectedSymbol) => {
		const newSymbols = localSymbols.filter(
			(s) =>
				!(
					s.symbol === symbolToDelete.symbol &&
					s.interval === symbolToDelete.interval
				),
		);
		syncToParent(newSymbols);
	};

	const handleSave = () => {
		if (!validateSymbol(symbolName, symbolInterval)) {
			return;
		}

		// 列表长度
		const listLength = localSymbols.length;

		const newSymbol: SelectedSymbol = {
			symbolId: listLength + 1, // 使用时间戳作为临时ID
			outputHandleId: `kline_node_output_${listLength + 1}`, // handleId 将由 hooks 自动生成
			symbol: symbolName,
			interval: symbolInterval,
			klineValue: {
				timestamp: 0,
				open: 0,
				high: 0,
				low: 0,
				close: 0,
				volume: 0,
			},
		};

		let newSymbols: SelectedSymbol[];

		if (editingSymbol) {
			// 编辑现有交易对
			newSymbols = localSymbols.map((s) =>
				s.symbol === editingSymbol.symbol &&
				s.interval === editingSymbol.interval
					? newSymbol
					: s,
			);
		} else {
			// 添加新交易对
			newSymbols = [...localSymbols, newSymbol];
		}

		syncToParent(newSymbols);
		setIsDialogOpen(false);
		setEditingSymbol(undefined);
	};

	const getIntervalLabel = (interval: string) => {
		return (
			TIME_INTERVALS.find((item) => item.value === interval)?.label || interval
		);
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<label className="text-sm font-bold text-gray-700">交易品种</label>
				<Button
					variant="ghost"
					size="icon"
					onClick={handleAddSymbol}
					disabled={!hasDataSource}
					className={!hasDataSource ? "opacity-50 cursor-not-allowed" : ""}
				>
					<PlusIcon className="w-4 h-4" />
				</Button>
			</div>

			<div className="space-y-2">
				{localSymbols.length === 0 ? (
					<div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
						{hasDataSource ? "点击+号添加交易对" : "请选择数据源"}
					</div>
				) : (
					localSymbols.map((symbol, index) => (
						<div
							key={`${symbol.symbol}-${symbol.interval}-${index}`}
							className="flex items-center justify-between p-2 border rounded-md bg-background group"
						>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="h-5 px-1">
									<TrendingUp className="h-3 w-3 mr-1 text-blue-500" />
									{symbol.symbol}
								</Badge>
								<div className="flex items-center gap-1">
									<Clock className="h-3 w-3 text-muted-foreground" />
									<span className="text-sm">
										{getIntervalLabel(symbol.interval)}
									</span>
								</div>
							</div>
							<div className="flex items-center gap-1">
								<div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6"
										onClick={() => handleEditSymbol(symbol)}
									>
										<Settings className="h-3 w-3" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 text-destructive"
										onClick={() => handleDeleteSymbol(symbol)}
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							</div>
						</div>
					))
				)}
			</div>

			{/* 添加/编辑交易对对话框 */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent
					className="sm:max-w-[425px]"
					onOpenAutoFocus={(e) => e.preventDefault()}
				>
					<DialogHeader>
						<DialogTitle>
							{editingSymbol ? "编辑交易对" : "添加交易对"}
						</DialogTitle>
						<DialogDescription>
							添加需要获取K线数据的交易对和对应的时间周期。
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="symbol-name" className="text-right">
								交易对
							</Label>
							<div className="col-span-3 space-y-1">
								<Select
									value={symbolName}
									onValueChange={(value) => {
										setSymbolName(value);
										if (value.trim()) {
											validateSymbol(value, symbolInterval);
										}
									}}
								>
									<SelectTrigger
										id="symbol-name"
										className={nameError ? "border-red-500" : ""}
									>
										<SelectValue placeholder="选择交易对" />
									</SelectTrigger>
									<SelectContent>
										{Symbols.map((symbol) => (
											<SelectItem key={symbol.value} value={symbol.value}>
												<div className="flex items-center">
													<span>{symbol.label}</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{nameError && (
									<p className="text-xs text-red-500">{nameError}</p>
								)}
							</div>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="symbol-interval" className="text-right">
								时间周期
							</Label>
							<div className="col-span-3">
								<Select
									value={symbolInterval}
									onValueChange={(value) => {
										setSymbolInterval(value);
										if (symbolName.trim()) {
											validateSymbol(symbolName.toUpperCase(), value);
										}
									}}
								>
									<SelectTrigger id="symbol-interval">
										<SelectValue placeholder="选择时间周期" />
									</SelectTrigger>
									<SelectContent>
										{TIME_INTERVALS.map((interval) => (
											<SelectItem key={interval.value} value={interval.value}>
												<div className="flex items-center">
													<span>{interval.label}</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDialogOpen(false)}>
							取消
						</Button>
						<Button onClick={handleSave}>保存</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default SymbolSelector;
