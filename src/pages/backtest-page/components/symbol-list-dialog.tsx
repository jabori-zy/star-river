import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	Selector,
	type SelectorOption,
} from "@/components/select-components/select";
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
import { getStrategyCacheKeys } from "@/service/strategy";
import type { IndicatorKey, KlineKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";

interface SymbolListDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	strategyId: number;
	selectedKlineCacheKeyStr?: string;
	onKlineSelect: (klineCacheKeyStr: string) => void;
}

export default function SymbolListDialog({
	open,
	onOpenChange,
	strategyId,
	selectedKlineCacheKeyStr,
	onKlineSelect,
}: SymbolListDialogProps) {
	const { t } = useTranslation();
	const [klineOptions, setKlineOptions] = useState<
		{ key: string; data: KlineKey }[]
	>([]);
	const [loading, setLoading] = useState(false);
	const [selectedValue, setSelectedValue] = useState<string>("");

	// Get available kline data
	const fetchKlineOptions = useCallback(async () => {
		setLoading(true);
		try {
			const keys = await getStrategyCacheKeys(strategyId);
			const parsedKeyMap: Record<string, KlineKey | IndicatorKey> = {};

			keys.forEach((keyString) => {
				parsedKeyMap[keyString] = parseKey(keyString) as
					| KlineKey
					| IndicatorKey;
			});

			// Filter out kline options
			const options: { key: string; data: KlineKey }[] = [];
			Object.entries(parsedKeyMap).forEach(([key, value]) => {
				if (key.startsWith("kline|")) {
					options.push({
						key,
						data: value as KlineKey,
					});
				}
			});

			setKlineOptions(options);
		} catch (error) {
			console.error("Failed to fetch kline options:", error);
		} finally {
			setLoading(false);
		}
	}, [strategyId]);

	// Get kline data when dialog opens
	useEffect(() => {
		if (open) {
			fetchKlineOptions();
			// Reset selected value when dialog opens
			setSelectedValue(selectedKlineCacheKeyStr || "");
		}
	}, [open, fetchKlineOptions, selectedKlineCacheKeyStr]);

	// Handle confirm
	const handleConfirm = () => {
		if (selectedValue) {
			onKlineSelect(selectedValue);
			onOpenChange(false);
		}
	};

	// Handle cancel
	const handleCancel = () => {
		onOpenChange(false);
	};

	// Convert kline options to selector options
	const selectorOptions: SelectorOption[] = klineOptions.map((option) => ({
		value: option.key,
		label: (
			<div className="flex items-center gap-2">
				<Badge variant="outline">{option.data.exchange}</Badge>
				<span className="font-medium">{option.data.symbol}</span>
				<Badge variant="secondary">{option.data.interval}</Badge>
			</div>
		),
	}));

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={false}>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle>{t("desktop.backtestPage.selectKline")}</DialogTitle>
				</DialogHeader>
				<DialogDescription />
				<div className="grid gap-4 py-4">
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<div className="text-sm text-gray-500">
								{t("common.loading")}...
							</div>
						</div>
					) : klineOptions.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							{t("desktop.backtestPage.noKlineData")}
						</div>
					) : (
						<Selector
							options={selectorOptions}
							value={selectedValue}
							onValueChange={setSelectedValue}
							placeholder={t("desktop.backtestPage.selectKline")}
						/>
					)}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel}>
						{t("common.cancel")}
					</Button>
					<Button onClick={handleConfirm} disabled={!selectedValue || loading}>
						{t("common.confirm")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
