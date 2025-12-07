import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { SelectWithSearch } from "@/components/select-components/select-with-search";
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
import { getExchangeStatus } from "@/service/exchange";
import { INTERVAL_LABEL_MAP } from "@/types/kline";
import type { ExchangeStatus, Instrument } from "@/types/market";
import type { SelectedSymbol } from "@/types/node/kline-node";

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
	// Add original saved values for comparison
	originalSymbolName?: string;
	originalSymbolInterval?: string;
	// Data passed from parent component
	symbolList: Instrument[];
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
	originalSymbolName = "",
	originalSymbolInterval = "",
	symbolList,
	supportKlineInterval,
}) => {
	const { t } = useTranslation();
	const [exchangeStatus, setExchangeStatus] = useState<ExchangeStatus | null>(
		null,
	);

	// Fetch exchange status
	const fetchExchangeStatus = useCallback(async () => {
		if (!accountId) return;
		try {
			const status = await getExchangeStatus(accountId);
			setExchangeStatus(status);
			return status;
		} catch (error) {
			console.error("Failed to get exchange status:", error);
			return null;
		}
	}, [accountId]);

	useEffect(() => {
		if (accountId && isOpen) {
			// Fetch exchange status
			fetchExchangeStatus();
		}
	}, [accountId, isOpen, fetchExchangeStatus]);

	// Check if current value is same as original saved value
	// If in edit mode, use editingSymbol's value; otherwise use passed original value
	const savedSymbolName = editingSymbol?.symbol || originalSymbolName;
	const savedSymbolInterval = editingSymbol?.interval || originalSymbolInterval;

	const hasChanges =
		symbolName !== savedSymbolName || symbolInterval !== savedSymbolInterval;

	// Check if connected
	const isConnected = exchangeStatus === "Connected";

	// Save button enabled: no error && has changes && form filled
	const isSaveDisabled = !!nameError || !hasChanges || !symbolName.trim();

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange} modal={false}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{editingSymbol
							? t("klineNode.symbolDialog.editTitle")
							: t("klineNode.symbolDialog.addTitle")}
					</DialogTitle>
					<DialogDescription>
						{editingSymbol
							? t("klineNode.symbolDialog.editDescription")
							: t("klineNode.symbolDialog.addDescription")}
					</DialogDescription>
				</DialogHeader>

				{/* Exchange not connected warning */}
				{exchangeStatus && exchangeStatus !== "Connected" && (
					<div className="">
						<p className="text-sm text-yellow-700">
							{accountName} {t("klineNode.symbolDialog.notConnected")}.
						</p>
					</div>
				)}

				<div className="grid gap-4">
					<div className="space-y-2">
						<Label>{t("klineNode.symbolDialog.symbol")}</Label>
						<SelectWithSearch
							id="symbol-name"
							options={symbolList.map((symbol) => ({
								value: symbol.name,
								label: symbol.name,
							}))}
							value={symbolName}
							onValueChange={onSymbolNameChange}
							placeholder={
								isConnected ? t("klineNode.symbolDialog.placeholder") : null
							}
							searchPlaceholder={t("klineNode.symbolDialog.searchPlaceholder")}
							emptyMessage={t("klineNode.symbolDialog.emptyMessage")}
							error={!!nameError}
							disabled={!isConnected}
						/>
						{nameError && <p className="text-xs text-red-500">{nameError}</p>}
					</div>
					<div className="space-y-2">
						<Label>{t("klineNode.symbolDialog.interval")}</Label>
						<SelectInDialog
							id="symbol-interval"
							value={symbolInterval}
							onValueChange={onSymbolIntervalChange}
							placeholder={t("klineNode.symbolDialog.intervalPlaceholder")}
							options={supportKlineInterval.map((interval) => ({
								value: interval,
								label: INTERVAL_LABEL_MAP[interval] || interval,
							}))}
							disabled={!isConnected}
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("common.cancel")}
					</Button>
					<Button onClick={onSave} disabled={isSaveDisabled}>
						{t("common.save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
