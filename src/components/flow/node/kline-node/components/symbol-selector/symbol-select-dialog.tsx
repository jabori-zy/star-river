import { useEffect, useState } from "react";
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
import { getSymbolList, getSupportKlineInterval } from "@/service/market";
import type { MarketSymbol } from "@/types/market";



// Time interval value to label mapping
const INTERVAL_LABEL_MAP: Record<string, string> = {
	"1m": "1 Minute",
	"2m": "2 Minutes",
	"3m": "3 Minutes",
	"4m": "4 Minutes",
	"5m": "5 Minutes",
	"6m": "6 Minutes",
	"10m": "10 Minutes",
	"12m": "12 Minutes",
	"15m": "15 Minutes",
	"20m": "20 Minutes",
	"30m": "30 Minutes",
	"1h": "1 Hour",
	"2h": "2 Hours",
	"3h": "3 Hours",
	"4h": "4 Hours",
	"6h": "6 Hours",
	"8h": "8 Hours",
	"12h": "12 Hours",
	"1d": "1 Day",
	"1w": "1 Week",
	"1M": "1 Month",
};

interface SymbolSelectDialogProps {
    accountId: number | undefined;
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
}

export const SymbolSelectDialog: React.FC<SymbolSelectDialogProps> = ({
    accountId,
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
}) => {

    const [symbolList, setSymbolList] = useState<MarketSymbol[]>([]);
    const [supportKlineInterval, setSupportKlineInterval] = useState<string[]>([]);

    useEffect(() => {
        if (accountId && isOpen) {
            getSymbolList(accountId).then((data) => {
                setSymbolList(data);
            });
            getSupportKlineInterval(accountId).then((data) => {
                setSupportKlineInterval(data);
            });
        }
    }, [accountId, isOpen]);

    // 判断当前值是否与原始保存值相同
    // 如果是编辑模式，使用editingSymbol的值；否则使用传入的original值
    const savedSymbolName = editingSymbol?.symbol || originalSymbolName;
    const savedSymbolInterval = editingSymbol?.interval || originalSymbolInterval;

    const hasChanges = symbolName !== savedSymbolName ||
                       symbolInterval !== savedSymbolInterval;

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
						Add trading symbols and their corresponding time intervals to get K-line data.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
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
								placeholder="Select Symbol"
								searchPlaceholder="Search symbol"
								emptyMessage="No symbol found."
								error={!!nameError}
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