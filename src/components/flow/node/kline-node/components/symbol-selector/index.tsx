import { useReactFlow } from "@xyflow/react";
import { Clock, PlusIcon, Settings, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NodeOpConfirmDialog } from "@/components/flow/node-op-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import useWorkflowUtils from "@/hooks/flow/use-workflow-utils";
import { INTERVAL_LABEL_MAP } from "@/types/kline";
import type { Instrument } from "@/types/market";
import type { SelectedSymbol } from "@/types/node/kline-node";
import type { SelectedAccount } from "@/types/strategy";
import { SymbolSelectDialog } from "./symbol-select-dialog";

interface SymbolSelectorProps {
	nodeId: string; // node id
	selectedSymbols: SelectedSymbol[]; // selected symbols
	selectedDataSource?: SelectedAccount | null; // selected data source
	onSymbolsChange: (symbols: SelectedSymbol[]) => void; // symbol change callback
	symbolList: Instrument[]; // Symbol list (passed from parent component)
	supportKlineInterval: string[]; // Supported kline intervals (passed from parent component)
}

// Trading symbol selector
const SymbolSelector: React.FC<SymbolSelectorProps> = ({
	nodeId,
	selectedSymbols,
	onSymbolsChange,
	selectedDataSource,
	symbolList,
	supportKlineInterval,
}) => {
	// Local state management
	const { t } = useTranslation();
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
	const [pendingDeleteSymbol, setPendingDeleteSymbol] =
		useState<SelectedSymbol | null>(null);

	const { getTargetNodeIds } = useStrategyWorkflow();
	const { deleteEdgeBySourceHandleId } = useWorkflowUtils();
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

	const getIntervalLabel = (interval: string) => {
		return INTERVAL_LABEL_MAP[interval] || interval;
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
		//     setNameError("Invalid symbol format, should be like BTC/USDT");
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
		const targetNodeNames = targetNodeIds.map(
			(id) => getNode(id)?.data.nodeName as string,
		);

		// If there are connected target nodes, show confirmation dialog
		if (targetNodeIds.length > 0) {
			setPendingDeleteSymbol(symbolToDelete);
			setPendingSymbolData({
				symbolName: symbolToDelete.symbol,
				symbolInterval: symbolToDelete.interval,
				targetNodeCount: targetNodeIds.length,
				targetNodeNames: targetNodeNames,
			});
			setIsConfirmDialogOpen(true);
			return;
		}

		// No connected nodes, delete directly
		performDelete(symbolToDelete);
	};

	// Perform delete
	const performDelete = (symbolToDelete?: SelectedSymbol) => {
		const targetSymbol = symbolToDelete || pendingDeleteSymbol;
		if (!targetSymbol) return;

		// Delete edge
		const sourceHandleId = targetSymbol.outputHandleId;
		if (sourceHandleId) {
			deleteEdgeBySourceHandleId(sourceHandleId);
		}

		const newSymbols = localSymbols.filter(
			(s) =>
				!(
					s.symbol === targetSymbol.symbol &&
					s.interval === targetSymbol.interval
				),
		);
		syncToParent(newSymbols);

		// Clean up delete related state
		setPendingDeleteSymbol(null);
		setIsConfirmDialogOpen(false);
		setPendingSymbolData(null);
	};

	const handleSave = () => {
		if (!validateSymbol(symbolName, symbolInterval)) {
			return;
		}

		// If adding new, save directly without confirmation dialog
		if (!editingSymbol) {
			performSave();
			return;
		}

		// If editing, check for connected target nodes
		const targetNodeIds = getTargetNodeIds(nodeId);
		const targetNodeNames = targetNodeIds.map(
			(id) => getNode(id)?.data.nodeName as string,
		);

		// If there are connected target nodes, close selection dialog first, then show confirmation dialog
		if (targetNodeIds.length > 0) {
			// Close selection dialog first
			setIsDialogOpen(false);

			// Save pending data
			setPendingSymbolData({
				symbolName,
				symbolInterval,
				targetNodeCount: targetNodeIds.length,
				targetNodeNames: targetNodeNames,
			});

			// Show confirmation dialog after brief delay to ensure selection dialog fully closed
			setTimeout(() => {
				setIsConfirmDialogOpen(true);
			}, 50);
			return;
		}

		// No connected nodes, save directly
		performSave();
	};

	// Perform save
	const performSave = () => {
		const currentSymbolName = pendingSymbolData?.symbolName || symbolName;
		const currentSymbolInterval =
			pendingSymbolData?.symbolInterval || symbolInterval;

		let newSymbols: SelectedSymbol[];

		if (editingSymbol) {
			// Edit existing symbol, keep original configId and outputHandleId
			const newSymbol: SelectedSymbol = {
				configId: editingSymbol.configId, // Keep original configId
				outputHandleId: editingSymbol.outputHandleId, // Keep original outputHandleId
				symbol: currentSymbolName,
				interval: currentSymbolInterval,
				klineValue: editingSymbol.klineValue, // Keep original klineValue
			};

			newSymbols = localSymbols.map((s) =>
				s.symbol === editingSymbol.symbol &&
				s.interval === editingSymbol.interval
					? newSymbol
					: s,
			);
		} else {
			// Calculate new configId only when adding new symbol
			const maxConfigId = localSymbols.reduce(
				(max, symbol) => Math.max(max, symbol.configId),
				0,
			);
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
			newSymbols = [...localSymbols, newSymbol];
		}

		syncToParent(newSymbols);
		setIsDialogOpen(false);
		setEditingSymbol(undefined);

		// Clean up confirmation dialog state
		setIsConfirmDialogOpen(false);
		setPendingSymbolData(null);

		// Reset form state
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
		// Close confirmation dialog
		setIsConfirmDialogOpen(false);

		// If delete operation, clean up state directly
		if (pendingDeleteSymbol) {
			setPendingDeleteSymbol(null);
			setPendingSymbolData(null);
			return;
		}

		// If save operation, reopen selection dialog after brief delay
		setTimeout(() => {
			setIsDialogOpen(true);
		}, 100);

		// Note: Don't clear pendingSymbolData and form state, keep user's selection
		// setPendingSymbolData(null); // Commented out to keep data
	};

	// Handle selection dialog close event
	const handleSelectDialogOpenChange = (open: boolean) => {
		setIsDialogOpen(open);

		// If user closes dialog directly (not triggered by save), clean up temporary data
		if (!open && !isConfirmDialogOpen) {
			setPendingSymbolData(null);
			setEditingSymbol(undefined);
		}
	};

	return (
		<div className="flex flex-col p-2">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-bold text-gray-700">
					{t("klineNode.symbol")}
				</Label>
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
						{hasDataSource
							? t("klineNode.addSymbol")
							: t("klineNode.selectDataSource")}
					</div>
				) : (
					localSymbols.map((symbol, index) => (
						<div
							key={`${symbol.symbol}-${symbol.interval}-${index}`}
							className="flex items-center justify-between p-2 border rounded-md bg-background group"
						>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="h-5 px-1">
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

			{/* Add/edit symbol dialog */}
			<SymbolSelectDialog
				accountId={selectedDataSource?.id ?? 0}
				accountName={selectedDataSource?.accountName || ""}
				isOpen={isDialogOpen}
				onOpenChange={handleSelectDialogOpenChange}
				editingSymbol={editingSymbol}
				symbolName={symbolName}
				symbolInterval={symbolInterval}
				nameError={nameError}
				onSymbolNameChange={handleSymbolNameChange}
				onSymbolIntervalChange={handleSymbolIntervalChange}
				onSave={handleSave}
				originalSymbolName={editingSymbol?.symbol || ""}
				originalSymbolInterval={editingSymbol?.interval || "1m"}
				symbolList={symbolList}
				supportKlineInterval={supportKlineInterval}
			/>

			{/* Confirm modification dialog */}
			<NodeOpConfirmDialog
				isOpen={isConfirmDialogOpen}
				onOpenChange={setIsConfirmDialogOpen}
				affectedNodeCount={pendingSymbolData?.targetNodeCount || 0}
				affectedNodeNames={pendingSymbolData?.targetNodeNames || []}
				onConfirm={handleConfirmSave}
				onCancel={handleCancelSave}
				operationType={pendingDeleteSymbol ? "delete" : "edit"}
			/>
		</div>
	);
};

export default SymbolSelector;
