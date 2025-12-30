import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import type { Subscription } from "rxjs";
import {
	OperationResultTable,
	type OperationResultData,
} from "@/components/new-table/backtest/operation-result";
import {
	Selector,
	type SelectorOption,
} from "@/components/select-components/select";
import { createOperationGroupLatestResultStreamFromKey } from "@/hooks/obs/backtest-strategy-event-obs";
import { getStrategyDataApi } from "@/service/backtest-strategy/get-strategy-data";
import { getStrategyDatetimeApi } from "@/service/backtest-strategy/strategy-datetime";
import { getStrategyCacheKeys } from "@/service/strategy";
import type { OperationKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";

// Initial data limit
const INITIAL_DATA_LIMIT = 100;

interface OperationOption {
	key: string;
	name: string;
	nodeId: string;
	interval: string;
}

interface OperationResultProps {
	strategyId: number;
}

export interface OperationResultRef {
	clearResults: () => void;
}

const OperationResult = forwardRef<OperationResultRef, OperationResultProps>(
	({ strategyId }, ref) => {
		const { t } = useTranslation();
		const [resultData, setResultData] = useState<OperationResultData[]>([]);
		const [selectedOperationKey, setSelectedOperationKey] = useState<string>("");
		const [operationOptions, setOperationOptions] = useState<OperationOption[]>([]);
		const [loading, setLoading] = useState(false);
		const resultStreamSubscription = useRef<Subscription | null>(null);

		// Expose method for clearing results
		useImperativeHandle(
			ref,
			() => ({
				clearResults: () => {
					setResultData([]);
				},
			}),
			[],
		);

		// Fetch available operation keys
		const fetchOperationKeys = useCallback(async () => {
			setLoading(true);
			try {
				const keys = await getStrategyCacheKeys(strategyId);
				const options: OperationOption[] = [];

				for (const keyString of keys) {
					if (keyString.startsWith("operation|")) {
						const parsedKey = parseKey(keyString) as OperationKey;
						options.push({
							key: keyString,
							name: parsedKey.name,
							nodeId: parsedKey.nodeId,
							interval: parsedKey.interval,
						});
					}
				}

				setOperationOptions(options);

				// Auto-select first option if available
				if (options.length > 0 && !selectedOperationKey) {
					setSelectedOperationKey(options[0].key);
				}
			} catch (error) {
				console.error("Failed to fetch operation keys:", error);
			} finally {
				setLoading(false);
			}
		}, [strategyId, selectedOperationKey]);

		// Fetch operation keys on mount
		useEffect(() => {
			fetchOperationKeys();
		}, [fetchOperationKeys]);

		// Convert to selector options
		const selectorOptions: SelectorOption[] = useMemo(() => {
			return operationOptions.map((option) => ({
				value: option.key,
				label: `${option.name} (${option.interval})`,
			}));
		}, [operationOptions]);

		// Initialize data from API
		const getOperationData = useCallback(async () => {
			if (!selectedOperationKey) return;

			try {
				// Get strategy datetime
				const { strategyDatetime } =
					await getStrategyDatetimeApi(strategyId);

				// Fetch initial data
				const initialData = (await getStrategyDataApi({
					strategyId,
					keyStr: selectedOperationKey,
					datetime: strategyDatetime,
					limit: INITIAL_DATA_LIMIT,
				})) as OperationResultData[];

				if (initialData && Array.isArray(initialData) && initialData.length > 0) {
					// Reverse to show latest first
					setResultData(initialData.reverse());
				} else {
					setResultData([]);
				}
			} catch (error) {
				console.error("Failed to initialize operation data:", error);
			}
		}, [strategyId, selectedOperationKey]);

		// Initialize data when selected key changes
		useEffect(() => {
			getOperationData();
		}, [getOperationData]);

		// Subscribe to real-time updates
		useEffect(() => {
			// Unsubscribe previous subscription
			if (resultStreamSubscription.current) {
				resultStreamSubscription.current.unsubscribe();
				resultStreamSubscription.current = null;
			}

			if (!selectedOperationKey) return;

			const resultStream =
				createOperationGroupLatestResultStreamFromKey(selectedOperationKey);
			const subscription = resultStream.subscribe((result) => {
				// Insert in reverse order, later times come first
				setResultData((prev) => [result, ...prev]);
			});
			resultStreamSubscription.current = subscription;

			return () => {
				resultStreamSubscription.current?.unsubscribe();
				resultStreamSubscription.current = null;
			};
		}, [selectedOperationKey]);

		// Handle operation selection change
		const handleOperationChange = (value: string) => {
			setSelectedOperationKey(value);
			setResultData([]); // Clear data when switching
		};

		return (
			<div className="h-full w-full flex flex-col gap-2">
				<div className="flex flex-row items-center gap-2">

					<span className="text-sm font-semibold">{t("desktop.backtestPage.operation")}</span>
				{/* Operation selector */}
					<div className="w-64">
						<Selector
							options={selectorOptions}
							value={selectedOperationKey}
							onValueChange={handleOperationChange}
							placeholder={t("desktop.backtestPage.addOperationPlaceholder")}
							disabled={loading || selectorOptions.length === 0}
						/>
					</div>
				</div>

				{/* Table */}
				<div className="flex-1">
					<OperationResultTable data={resultData} />
				</div>
			</div>
		);
	},
);

OperationResult.displayName = "OperationResult";

export default OperationResult;
