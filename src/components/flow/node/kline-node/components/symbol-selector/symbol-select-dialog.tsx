import { useEffect, useState, useCallback } from "react";
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
import { SelectWithSearch } from "@/components/select-components/select-with-search";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import type { SelectedSymbol } from "@/types/node/kline-node";
import type { MarketSymbol, ExchangeStatus } from "@/types/market";
import { getExchangeStatus } from "@/service/exchange";
import { INTERVAL_LABEL_MAP } from "@/types/kline";

interface SymbolSelectDialogProps {
    accountId: number | undefined;
	accountName: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	editingSymbol?: SelectedSymbol;
	symbolName: string;
	symbolInterval: string;
	nameError: string;
	onSymbolNameChange: (value: string) => void;
	onSymbolIntervalChange: (value: string) => void;
	onSave: () => void;
	// 添加原始保存的值，用于比较
	originalSymbolName?: string;
	originalSymbolInterval?: string;
	// 从父组件传入的数据
	symbolList: MarketSymbol[];
	supportKlineInterval: string[];
}

export const SymbolSelectDialog: React.FC<SymbolSelectDialogProps> = ({
    accountId,
	accountName,
	isOpen,
	onOpenChange,
	editingSymbol,
	symbolName,
	symbolInterval,
	nameError,
	onSymbolNameChange,
	onSymbolIntervalChange,
	onSave,
	originalSymbolName = '',
	originalSymbolInterval = '',
	symbolList,
	supportKlineInterval,
}) => {

	const [exchangeStatus, setExchangeStatus] = useState<ExchangeStatus | null>(null);

	// 获取交易所状态
	const fetchExchangeStatus = useCallback(async () => {
		if (!accountId) return;
		try {
			const status = await getExchangeStatus(accountId);
			setExchangeStatus(status);
			return status;
		} catch (error) {
			console.error("获取交易所状态失败:", error);
			return null;
		}
	}, [accountId]);

    useEffect(() => {
        if (accountId && isOpen) {
			// 获取交易所状态
			fetchExchangeStatus();
        }
    }, [accountId, isOpen, fetchExchangeStatus]);

    // 判断当前值是否与原始保存值相同
    // 如果是编辑模式，使用editingSymbol的值；否则使用传入的original值
    const savedSymbolName = editingSymbol?.symbol || originalSymbolName;
    const savedSymbolInterval = editingSymbol?.interval || originalSymbolInterval;

    const hasChanges = symbolName !== savedSymbolName ||
                       symbolInterval !== savedSymbolInterval;

	// 判断是否已连接
	const isConnected = exchangeStatus === "Connected";

    // Save按钮是否可用：没有错误 && 有变化 && 表单填写完整
    const isSaveDisabled = !!nameError || !hasChanges || !symbolName.trim();


	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange} modal={false}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{editingSymbol ? "Edit Symbol" : "Add Symbol"}
					</DialogTitle>
					<DialogDescription>
						Add trading symbols and time intervals to get kline data.
					</DialogDescription>
				</DialogHeader>

				{/* 交易所未连接警告 */}
				{exchangeStatus && exchangeStatus !== "Connected" && (
					<div className="">
						<p className="text-sm text-yellow-700">
							{accountName} 未连接.
						</p>
					</div>
				)}

				<div className="grid gap-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="symbol-name" className="text-right">
							Symbol
						</Label>
						<div className="col-span-3">
							<SelectWithSearch
								id="symbol-name"
								options={symbolList.map((symbol) => ({
									value: symbol.name,
									label: symbol.name,
								}))}
								value={symbolName}
								onValueChange={onSymbolNameChange}
								placeholder={isConnected ? "Select Symbol" : null}
								searchPlaceholder="Search symbol"
								emptyMessage="No symbol found."
								error={!!nameError}
								disabled={!isConnected}
							/>
							{nameError && (
								<p className="text-xs text-red-500">{nameError}</p>
							)}
						</div>
					</div>
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="symbol-interval" className="text-right">
							Interval
						</Label>
						<div className="col-span-3">
							<SelectInDialog
								id="symbol-interval"
								value={symbolInterval}
								onValueChange={onSymbolIntervalChange}
								placeholder="Select Interval"
								options={supportKlineInterval.map((interval) => ({
									value: interval,
									label: INTERVAL_LABEL_MAP[interval] || interval,
								}))}
								disabled={!isConnected}
							/>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={onSave} disabled={isSaveDisabled}>
						Save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};