import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { getStrategyCacheKeys } from "@/service/strategy";
import type { Key, KlineKey, OperationKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";

interface OperationOption {
	key: string;
	name: string;
	nodeId: string;
	interval: string;
}

interface OperationSelectorProps {
	klineKeyStr: string;
	onOperationSelect?: (operationKey: string) => void;
	selectedOperationKey?: string;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	strategyId: number;
}

export default function OperationSelector({
	klineKeyStr,
	onOperationSelect,
	selectedOperationKey,
	placeholder = "Select operation",
	className = "",
	disabled = false,
	strategyId,
}: OperationSelectorProps) {
	const [keys, setKeys] = useState<Record<string, Key>>({});
	const [loading, setLoading] = useState(false);
	const [isSelectOpen, setIsSelectOpen] = useState(false);

	// Parse K-line key to get interval
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

			for (const keyString of keys) {
				parsedKeyMap[keyString] = parseKey(keyString) as Key;
			}

			setKeys(parsedKeyMap);
		} catch (error) {
			console.error("Failed to get cache keys:", error);
		} finally {
			setLoading(false);
		}
	}, [strategyId]);

	// Calculate available operation options (filter by interval)
	const availableOperationOptions = useMemo((): OperationOption[] => {
		if (!klineConfig || Object.keys(keys).length === 0) return [];

		const options: OperationOption[] = [];

		for (const [key, value] of Object.entries(keys)) {
			if (key.startsWith("operation|")) {
				const operationData = value as OperationKey;

				// Only show operations with matching interval
				if (operationData.interval === klineConfig.interval) {
					options.push({
						key,
						name: operationData.name,
						nodeId: operationData.nodeId,
						interval: operationData.interval,
					});
				}
			}
		}

		return options;
	}, [keys, klineConfig]);

	// Get cache data when component mounts
	useEffect(() => {
		if (strategyId && klineConfig) {
			fetchCacheKeys();
		}
	}, [strategyId, klineConfig, fetchCacheKeys]);

	// Get selected option
	const selectedOption = selectedOperationKey
		? availableOperationOptions.find(
				(option) => option.key === selectedOperationKey,
			)
		: undefined;

	if (loading) {
		return (
			<div className="flex items-center justify-center py-2">
				<div className="text-sm text-gray-500">Loading operation data...</div>
			</div>
		);
	}

	if (!klineConfig) {
		return (
			<div className="flex items-center justify-center py-2">
				<div className="text-sm text-red-500">Invalid kline key</div>
			</div>
		);
	}

	if (availableOperationOptions.length === 0) {
		return (
			<div className="flex items-center justify-center py-2">
				<div className="text-sm text-gray-500">No available operations</div>
			</div>
		);
	}

	return (
		<Select
			value={selectedOperationKey || ""}
			onValueChange={(value) => {
				setIsSelectOpen(false);
				onOperationSelect?.(value);
			}}
			open={isSelectOpen}
			onOpenChange={(open) => {
				setIsSelectOpen(open);
			}}
			disabled={disabled}
		>
			<SelectTrigger className={`w-full ${className}`}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent
				className="max-h-[200px] overflow-y-auto"
				onCloseAutoFocus={(e) => {
					e.preventDefault();
				}}
				onPointerDownOutside={() => {
					setIsSelectOpen(false);
				}}
			>
				{availableOperationOptions.map((option) => (
					<SelectItem key={option.key} value={option.key}>
						{option.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
