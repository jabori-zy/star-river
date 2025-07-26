import { useState, useEffect, useCallback, useMemo } from "react";
import { parseKey } from "@/utils/parse-key";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	KlineKey,
	IndicatorKey,
	Key,
} from "@/types/symbol-key";
import { getStrategyCacheKeys } from "@/service/strategy";
import { IndicatorOption, getIndicatorConfigDisplay } from "./utils";

interface IndicatorSelectorProps {
	klineKeyStr: string; // K线指标的缓存键
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
	placeholder = "选择指标",
	className = "",
	disabled = false,
	strategyId,
}: IndicatorSelectorProps) {
	const [keys, setKeys] = useState<Record<string, Key>>({});
	const [loading, setLoading] = useState(false);
	const [isSelectOpen, setIsSelectOpen] = useState(false);

	// 解析K线指标键
	const klineConfig = useMemo(() => {
		try {
			return parseKey(klineKeyStr) as KlineKey;
		} catch {
			return null;
		}
	}, [klineKeyStr]);

	// 获取策略缓存键
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
			console.error("获取缓存键失败:", error);
		} finally {
			setLoading(false);
		}
	}, [strategyId]);

	// 计算可用的指标选项
	const availableIndicatorOptions = useMemo((): IndicatorOption[] => {
		if (!klineConfig || Object.keys(keys).length === 0) return [];
		console.log("keys", keys);

		const options: IndicatorOption[] = [];

		Object.entries(keys).forEach(([key, value]) => {
			if (key.startsWith("indicator|")) {
				const indicatorData = value as IndicatorKey;
				console.log("indicatorData", indicatorData);

				// 确保交易所、交易对和时间周期完全一致
				if (
					indicatorData.exchange === klineConfig.exchange &&
					indicatorData.symbol === klineConfig.symbol &&
					indicatorData.interval === klineConfig.interval
				) {
					const configDisplay = getIndicatorConfigDisplay(
						indicatorData.indicatorConfig,
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

		return options;
	}, [keys, klineConfig]);

	// 组件挂载时获取缓存数据
	useEffect(() => {
		if (strategyId && klineConfig) {
			fetchCacheKeys();
		}
	}, [strategyId, klineConfig, fetchCacheKeys]);

	// 渲染指标选项
	const renderIndicatorOption = (option: IndicatorOption) => {
		console.log(option);
		const configDisplay = getIndicatorConfigDisplay(option.indicatorConfig, option.indicatorType);
		console.log(configDisplay);
		return (
			<div className="flex items-center gap-2">
				<Badge variant="outline">{option.indicatorType.toUpperCase()}</Badge>
				<span className="font-medium">{configDisplay}</span>
			</div>
		);
	};

	// 获取选中的选项
	const selectedOption = selectedIndicatorKey
		? availableIndicatorOptions.find(
				(option) => option.key === selectedIndicatorKey,
			)
		: undefined;

	if (loading) {
		return (
			<div className="flex items-center justify-center py-2">
				<div className="text-sm text-gray-500">加载指标数据...</div>
			</div>
		);
	}

	if (!klineConfig) {
		return (
			<div className="flex items-center justify-center py-2">
				<div className="text-sm text-red-500">无效的指标键</div>
			</div>
		);
	}

	if (availableIndicatorOptions.length === 0) {
		return (
			<div className="flex items-center justify-center py-2">
				<div className="text-sm text-gray-500">暂无可用指标</div>
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
			<SelectTrigger className={`w-full ${className}`}>
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
