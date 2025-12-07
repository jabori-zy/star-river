import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getStrategyCacheKeys } from "@/service/strategy";
import type { IndicatorKey, Key, KlineKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import { getIndicatorConfigDisplay, type IndicatorOption } from "./utils";

interface IndicatorSelectorProps {
	klineKeyStr: string; // K-line indicator cache key
	onIndicatorSelect?: (indicatorKey: string) => void;
	selectedIndicatorKey?: string;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	strategyId: number;
}

export default function IndicatorSelector({
	klineKeyStr,
	onIndicatorSelect,
	selectedIndicatorKey,
	placeholder = "Select indicator",
	className = "",
	disabled = false,
	strategyId,
}: IndicatorSelectorProps) {
	const { t } = useTranslation();
	const [keys, setKeys] = useState<Record<string, Key>>({});
	const [loading, setLoading] = useState(false);
	const [isSelectOpen, setIsSelectOpen] = useState(false);

	// Parse K-line indicator key
	const klineConfig = useMemo(() => {
		try {
			return parseKey(klineKeyStr) as KlineKey;
		} catch {
			return null;
		}
	}, [klineKeyStr]);

	// Get strategy cache keys
	const fetchCacheKeys = useCallback(async () => {
		setLoading(true);
		try {
			const keys = await getStrategyCacheKeys(strategyId);
			const parsedKeyMap: Record<string, Key> = {};

			keys.forEach((keyString) => {
				parsedKeyMap[keyString] = parseKey(keyString) as Key;
			});

			setKeys(parsedKeyMap);
		} catch (error) {
			console.error("Failed to get cache keys:", error);
		} finally {
			setLoading(false);
		}
	}, [strategyId]);

	// Calculate available indicator options
	const availableIndicatorOptions = useMemo((): IndicatorOption[] => {
		if (!klineConfig || Object.keys(keys).length === 0) return [];

		const options: IndicatorOption[] = [];
		// console.log("keys", keys);

		Object.entries(keys).forEach(([key, value]) => {
			if (key.startsWith("indicator|")) {
				const indicatorData = value as IndicatorKey;

				// Ensure exchange, symbol, and interval are completely consistent
				if (
					indicatorData.exchange === klineConfig.exchange &&
					indicatorData.symbol === klineConfig.symbol &&
					indicatorData.interval === klineConfig.interval
				) {
					const configDisplay = getIndicatorConfigDisplay(
						indicatorData.indicatorConfig,
						t,
						indicatorData.indicatorType,
					);
					const label = `${indicatorData.indicatorType.toUpperCase()} (${configDisplay})`;
					options.push({
						key,
						label,
						indicatorType: indicatorData.indicatorType,
						indicatorConfig: indicatorData.indicatorConfig,
					});
				}
			}
		});
		// console.log("options", options);

		return options;
	}, [keys, klineConfig, t]);

	// Get cache data when component mounts
	useEffect(() => {
		if (strategyId && klineConfig) {
			fetchCacheKeys();
		}
	}, [strategyId, klineConfig, fetchCacheKeys]);

	// Render indicator option
	const renderIndicatorOption = (option: IndicatorOption) => {
		const configDisplay = getIndicatorConfigDisplay(
			option.indicatorConfig,
			t,
			option.indicatorType,
		);
		return (
			<div className="flex items-center gap-2">
				<Badge variant="outline" className="shrink-0 min-w-16">
					{option.indicatorType.toUpperCase()}
				</Badge>
				<span className="font-medium flex-1">{configDisplay}</span>
			</div>
		);
	};

	// Get selected option
	const selectedOption = selectedIndicatorKey
		? availableIndicatorOptions.find(
				(option) => option.key === selectedIndicatorKey,
			)
		: undefined;

	if (loading) {
		return (
			<div className="flex items-center justify-center py-2">
				<div className="text-sm text-gray-500">Loading indicator data...</div>
			</div>
		);
	}

	if (!klineConfig) {
		return (
			<div className="flex items-center justify-center py-2">
				<div className="text-sm text-red-500">Invalid indicator key</div>
			</div>
		);
	}

	if (availableIndicatorOptions.length === 0) {
		return (
			<div className="flex items-center justify-center py-2">
				<div className="text-sm text-gray-500">No available indicators</div>
			</div>
		);
	}

	return (
		<Select
			value={selectedIndicatorKey || ""}
			onValueChange={(value) => {
				setIsSelectOpen(false);
				onIndicatorSelect?.(value);
			}}
			open={isSelectOpen}
			onOpenChange={(open) => {
				setIsSelectOpen(open);
			}}
			disabled={disabled}
		>
			<SelectTrigger className={`w-full overflow-hidden ${className}`}>
				<SelectValue placeholder={placeholder}>
					{selectedOption && renderIndicatorOption(selectedOption)}
				</SelectValue>
			</SelectTrigger>
			<SelectContent
				className="max-h-[200px] overflow-y-auto min-w-[300px] max-w-[400px]"
				onCloseAutoFocus={(e) => {
					e.preventDefault();
				}}
				onPointerDownOutside={() => {
					setIsSelectOpen(false);
				}}
			>
				{availableIndicatorOptions.map((option) => (
					<SelectItem key={option.key} value={option.key}>
						{renderIndicatorOption(option)}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
