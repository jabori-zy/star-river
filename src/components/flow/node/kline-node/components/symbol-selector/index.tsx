import { Clock, PlusIcon, Settings, TrendingUp, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { SelectedSymbol } from "@/types/node/kline-node";
import type { SelectedAccount } from "@/types/strategy";
import { SymbolSelectDialog } from "./symbol-select-dialog";
// import { ConfirmDialog } from "./confirm-dialog";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import useWorkflowUtils from "@/hooks/flow/use-workflow-utils";
import { useReactFlow } from "@xyflow/react";
import { NodeOpConfirmDialog } from "@/components/node-op-confirm-dialog";
interface SymbolSelectorProps {
	nodeId: string; // node id
	selectedSymbols: SelectedSymbol[]; // selected symbols
	selectedDataSource?: SelectedAccount | null; // selected data source
	onSymbolsChange: (symbols: SelectedSymbol[]) => void; // symbol change callback
}


// Trading symbol selector
const SymbolSelector: React.FC<SymbolSelectorProps> = ({
	nodeId,
	selectedSymbols,
	onSymbolsChange,
	selectedDataSource,
}) => {
	// Local state management
	const [localSymbols, setLocalSymbols] = useState<SelectedSymbol[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingSymbol, setEditingSymbol] = useState<
		SelectedSymbol | undefined
	>(undefined);
	const [symbolName, setSymbolName] = useState<string>("");
	const [symbolInterval, setSymbolInterval] = useState<string>("1m");
	const [nameError, setNameError] = useState<string>("");
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [pendingSymbolData, setPendingSymbolData] = useState<{
		symbolName: string;
		symbolInterval: string;
		targetNodeCount: number;
		targetNodeNames: string[];
	} | null>(null);
	const [pendingDeleteSymbol, setPendingDeleteSymbol] = useState<SelectedSymbol | null>(null);

	const { getTargetNodeIds } = useStrategyWorkflow();
	const { deleteSourceHandleEdges } = useWorkflowUtils();
	const { getNode } = useReactFlow();

	// Check if data source is selected
	const hasDataSource = selectedDataSource?.id !== undefined;

	// Sync from props to local state on initialization
	useEffect(() => {
		if (selectedSymbols && selectedSymbols.length > 0) {
			setLocalSymbols([...selectedSymbols]);
		} else {
			setLocalSymbols([]);
		}
	}, [selectedSymbols]);

	const resetForm = useCallback(() => {
		setSymbolName("");
		setSymbolInterval("1m");
		setNameError("");
	}, []);

	// Reset state when dialog opens
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
	}, [isDialogOpen, editingSymbol, resetForm]);

	// Time interval options
	const TIME_INTERVALS = [
		{ value: "1m", label: "1 Minute" },
		{ value: "5m", label: "5 Minutes" },
		{ value: "15m", label: "15 Minutes" },
		{ value: "30m", label: "30 Minutes" },
		{ value: "1h", label: "1 Hour" },
		{ value: "4h", label: "4 Hours" },
		{ value: "1d", label: "1 Day" },
		{ value: "1w", label: "1 Week" },
	];

	const getIntervalLabel = (interval: string) => {
		return (
			TIME_INTERVALS.find((item) => item.value === interval)?.label || interval
		);
	};

	const handleSymbolNameChange = (value: string) => {
		setSymbolName(value);
		if (value.trim()) {
			validateSymbol(value, symbolInterval);
		}
	};

	const handleSymbolIntervalChange = (value: string) => {
		setSymbolInterval(value);
		if (symbolName.trim()) {
			validateSymbol(symbolName.toUpperCase(), value);
		}
	};

	// Sync data to parent component
	const syncToParent = (newSymbols: SelectedSymbol[]) => {
		setLocalSymbols(newSymbols);
		onSymbolsChange(newSymbols);
	};

	// Check if symbol already exists
	const validateSymbol = (symbol: string, interval: string): boolean => {
		if (!symbol.trim()) {
			setNameError("Symbol cannot be empty");
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
			setNameError("This symbol and interval combination already exists");
			return false;
		}

		setNameError("");
		return true;
	};

	const handleAddSymbol = () => {
		if (!hasDataSource) return; // If no data source, don't perform add operation
		setEditingSymbol(undefined);
		setIsDialogOpen(true);
	};

	const handleEditSymbol = (symbol: SelectedSymbol) => {
		setEditingSymbol(symbol);
		setIsDialogOpen(true);
	};

	const handleDeleteSymbol = (symbolToDelete: SelectedSymbol) => {
		const targetNodeIds = getTargetNodeIds(nodeId);
		const targetNodeNames = targetNodeIds.map((id) => getNode(id)?.data.nodeName as string);

		// 如果有连接的目标节点，显示确认对话框
		if (targetNodeIds.length > 0) {
			setPendingDeleteSymbol(symbolToDelete);
			setPendingSymbolData({
				symbolName: symbolToDelete.symbol,
				symbolInterval: symbolToDelete.interval,
				targetNodeCount: targetNodeIds.length,
				targetNodeNames: targetNodeNames
			});
			setIsConfirmDialogOpen(true);
			return;
		}

		// 没有连接节点，直接删除
		performDelete(symbolToDelete);
	};

	// 执行删除
	const performDelete = (symbolToDelete?: SelectedSymbol) => {
		const targetSymbol = symbolToDelete || pendingDeleteSymbol;
		if (!targetSymbol) return;

		// 删除边
		const sourceHandleId = targetSymbol.outputHandleId;
		if (sourceHandleId) {
			deleteSourceHandleEdges(sourceHandleId);
		}

		const newSymbols = localSymbols.filter(
			(s) =>
				!(
					s.symbol === targetSymbol.symbol &&
					s.interval === targetSymbol.interval
				),
		);
		syncToParent(newSymbols);

		// 清理删除相关状态
		setPendingDeleteSymbol(null);
		setIsConfirmDialogOpen(false);
		setPendingSymbolData(null);
	};

	const handleSave = () => {
		if (!validateSymbol(symbolName, symbolInterval)) {
			return;
		}

		// 如果是新增操作，直接保存，不弹出确认对话框
		if (!editingSymbol) {
			performSave();
			return;
		}

		// 如果是编辑操作，检查是否有连接的目标节点
		const targetNodeIds = getTargetNodeIds(nodeId);
		const targetNodeNames = targetNodeIds.map((id) => getNode(id)?.data.nodeName as string);

		// 如果有连接的目标节点，先关闭选择对话框，然后显示确认对话框
		if (targetNodeIds.length > 0) {
			// 先关闭选择对话框
			setIsDialogOpen(false);

			// 保存待处理的数据
			setPendingSymbolData({
				symbolName,
				symbolInterval,
				targetNodeCount: targetNodeIds.length,
				targetNodeNames: targetNodeNames
			});

			// 短暂延迟后显示确认对话框，确保选择对话框完全关闭
			setTimeout(() => {
				setIsConfirmDialogOpen(true);
			}, 50);
			return;
		}

		// 没有连接节点，直接保存
		performSave();
	};

	// 执行保存
	const performSave = () => {
		// List length
		const maxConfigId = localSymbols.reduce((max, symbol) => Math.max(max, symbol.configId), 0);

		const currentSymbolName = pendingSymbolData?.symbolName || symbolName;
		const currentSymbolInterval = pendingSymbolData?.symbolInterval || symbolInterval;

		const newSymbol: SelectedSymbol = {
			configId: maxConfigId + 1, // config id
			outputHandleId: `${nodeId}_output_${maxConfigId + 1}`, // handleId will be auto-generated by hooks
			symbol: currentSymbolName,
			interval: currentSymbolInterval,
			klineValue: {
				datetime: "",
				open: 0,
				high: 0,
				low: 0,
				close: 0,
				volume: 0,
			},
		};

		let newSymbols: SelectedSymbol[];

		if (editingSymbol) {
			// Edit existing symbol
			newSymbols = localSymbols.map((s) =>
				s.symbol === editingSymbol.symbol &&
				s.interval === editingSymbol.interval
					? newSymbol
					: s,
			);
		} else {
			// Add new symbol
			newSymbols = [...localSymbols, newSymbol];
		}

		syncToParent(newSymbols);
		setIsDialogOpen(false);
		setEditingSymbol(undefined);

		// 清理确认对话框状态
		setIsConfirmDialogOpen(false);
		setPendingSymbolData(null);

		// 重置表单状态
		resetForm();
	};

	const handleConfirmSave = () => {
		if (pendingDeleteSymbol) {
			performDelete();
		} else {
			performSave();
		}
	};

	const handleCancelSave = () => {
		// 关闭确认对话框
		setIsConfirmDialogOpen(false);

		// 如果是删除操作，直接清理状态
		if (pendingDeleteSymbol) {
			setPendingDeleteSymbol(null);
			setPendingSymbolData(null);
			return;
		}

		// 如果是保存操作，短暂延迟后重新打开选择对话框
		setTimeout(() => {
			setIsDialogOpen(true);
		}, 100);

		// 注意：不清空 pendingSymbolData 和表单状态，保持用户的选择
		// setPendingSymbolData(null); // 注释掉这行，保持数据
	};

	// 处理选择对话框关闭事件
	const handleSelectDialogOpenChange = (open: boolean) => {
		setIsDialogOpen(open);

		// 如果用户直接关闭对话框（不是通过保存触发），清理临时数据
		if (!open && !isConfirmDialogOpen) {
			setPendingSymbolData(null);
			setEditingSymbol(undefined);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-bold text-gray-700">交易品种</Label>
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
			<SymbolSelectDialog
				accountId={selectedDataSource?.id ?? 0}
				isOpen={isDialogOpen}
				onOpenChange={handleSelectDialogOpenChange}
				editingSymbol={editingSymbol}
				symbolName={symbolName}
				symbolInterval={symbolInterval}
				nameError={nameError}
				onSymbolNameChange={handleSymbolNameChange}
				onSymbolIntervalChange={handleSymbolIntervalChange}
				onSave={handleSave}
				originalSymbolName={editingSymbol?.symbol || ''}
				originalSymbolInterval={editingSymbol?.interval || '1m'}
			/>

			{/* 确认修改对话框 */}
			<NodeOpConfirmDialog
				isOpen={isConfirmDialogOpen}
				onOpenChange={setIsConfirmDialogOpen}
				affectedNodeCount={pendingSymbolData?.targetNodeCount || 0}
				affectedNodeNames={pendingSymbolData?.targetNodeNames || []}
				onConfirm={handleConfirmSave}
				onCancel={handleCancelSave}
				operationType={pendingDeleteSymbol ? 'delete' : 'edit'}
			/>
		</div>
	);
};

export default SymbolSelector;
