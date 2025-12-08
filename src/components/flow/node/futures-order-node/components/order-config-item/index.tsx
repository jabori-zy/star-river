import { useNodeConnections } from "@xyflow/react";
import {
	ArrowUpCircle,
	ChevronDown,
	ChevronRight,
	Coins,
	GitBranch,
	Hash,
	Settings2,
	Trash2,
	TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CaseItemInfo } from "@/components/flow/case-selector";
import CaseSelector from "@/components/flow/case-selector";
import { getOutputHandleIds } from "@/components/flow/node/futures-order-node/utils";
import { InputWithDropdown } from "@/components/input-components/input-with-dropdown";
import { Selector } from "@/components/select-components/select";
import { SelectWithSearch } from "@/components/select-components/select-with-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { cn } from "@/lib/utils";
import { getSymbolInfo } from "@/service/market";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type { ConditionTrigger } from "@/types/condition-trigger";
import type { Instrument } from "@/types/market";
import {
	type FuturesOrderConfig,
	FuturesOrderSide,
	getFuturesOrderSideColor,
	getFuturesOrderSideLabel,
	getOrderTypeLabel,
	getTpSlTypeLabel,
	OrderType,
} from "@/types/order";
import type { TradeMode } from "@/types/strategy";

interface OrderConfigFormProps {
	id: string;
	accountId: number | undefined;
	nodeId: string;
	config: FuturesOrderConfig;
	orderConfigId: number;
	symbolList: Instrument[];
	onChange: (config: FuturesOrderConfig) => void;
	onDelete: () => void;
}

const OrderConfigForm: React.FC<OrderConfigFormProps> = ({
	id,
	accountId,
	nodeId,
	config,
	orderConfigId,
	symbolList,
	onChange,
	onDelete,
}) => {
	const { t } = useTranslation();
	const { getIfElseNodeCases } = useStrategyWorkflow();
	const { tradingMode } = useTradingModeStore();
	const connections = useNodeConnections({ id: nodeId, handleType: "target" });

	// Use useMemo to generate i18n options
	const ORDER_TYPE_OPTIONS = useMemo(
		() => [
			{ value: OrderType.LIMIT, label: getOrderTypeLabel(OrderType.LIMIT, t) },
			{
				value: OrderType.MARKET,
				label: getOrderTypeLabel(OrderType.MARKET, t),
			},
			{
				value: OrderType.STOP_MARKET,
				label: getOrderTypeLabel(OrderType.STOP_MARKET, t),
			},
			{
				value: OrderType.TAKE_PROFIT_MARKET,
				label: getOrderTypeLabel(OrderType.TAKE_PROFIT_MARKET, t),
			},
		],
		[t],
	);

	const ORDER_SIDE_OPTIONS = useMemo(
		() => [
			{
				value: FuturesOrderSide.LONG,
				label: getFuturesOrderSideLabel(FuturesOrderSide.LONG, t),
			},
			{
				value: FuturesOrderSide.SHORT,
				label: getFuturesOrderSideLabel(FuturesOrderSide.SHORT, t),
			},
		],
		[t],
	);

	const TP_SL_TYPE_OPTIONS = useMemo(
		() => [
			{ value: "price" as const, label: getTpSlTypeLabel("price", t) },
			{
				value: "percentage" as const,
				label: getTpSlTypeLabel("percentage", t),
			},
			{ value: "point" as const, label: getTpSlTypeLabel("point", t) },
		],
		[t],
	);

	// Collapse state
	const [isOpen, setIsOpen] = useState(true);

	// Form state
	const [symbol, setSymbol] = useState<string>(config?.symbol || "");
	const [orderType, setOrderType] = useState<OrderType>(
		config?.orderType || OrderType.LIMIT,
	);
	const [orderSide, setOrderSide] = useState<FuturesOrderSide>(
		config?.orderSide || FuturesOrderSide.LONG,
	);
	// Use string state to handle input, avoiding number input issues
	const [priceStr, setPriceStr] = useState<string>(
		config?.price ? String(config.price) : "",
	);
	const [quantityStr, setQuantityStr] = useState<string>(
		config?.quantity ? String(config.quantity) : "",
	);
	const [tp, setTp] = useState<number | null>(config?.tp ?? null);
	const [sl, setSl] = useState<number | null>(config?.sl ?? null);
	const [tpType, setTpType] = useState<"price" | "percentage" | "point">(
		config?.tpType || "price",
	);
	const [slType, setSlType] = useState<"price" | "percentage" | "point">(
		config?.slType || "price",
	);
	const [triggerConfig, setTriggerConfig] = useState<ConditionTrigger | null>(
		config?.triggerConfig ?? null,
	);

	// Store case list from upstream nodes
	const [caseItemList, setCaseItemList] = useState<CaseItemInfo[]>([]);
	// Get symbol info
	const [symbolInfo, setSymbolInfo] = useState<Instrument | null>(null);

	useEffect(() => {
		// filter default input handle connection
		const conn = connections.filter(
			(connection) =>
				connection.targetHandle === `${id}_default_input` ||
				connection.targetHandle === config.inputHandleId,
		);
		const cases = getIfElseNodeCases(conn, tradingMode as TradeMode);

		setCaseItemList(cases);
	}, [connections, getIfElseNodeCases, id, tradingMode, config.inputHandleId]);

	// Function to get symbol info
	const loadSymbolInfo = useCallback(
		async (symbolName: string) => {
			if (!accountId || !symbolName.trim()) {
				setSymbolInfo(null);
				return;
			}

			try {
				const info = await getSymbolInfo(accountId, symbolName);
				setSymbolInfo(info);
			} catch (error) {
				console.error("Failed to get symbol info:", error);
				setSymbolInfo(null);
			}
		},
		[accountId],
	);

	// Get symbol info when symbol changes
	useEffect(() => {
		if (symbol && accountId) {
			loadSymbolInfo(symbol);
		} else {
			setSymbolInfo(null);
		}
	}, [symbol, accountId, loadSymbolInfo]);

	// Save config - called when fields change
	const saveConfig = useCallback(
		(updates: Partial<FuturesOrderConfig>) => {
			const currentPrice = parseFloat(priceStr) || 0;
			const currentQuantity = parseFloat(quantityStr) || 0;
			const newConfig: FuturesOrderConfig = {
				orderConfigId,
				inputHandleId: `${nodeId}_input_${orderConfigId}`,
				outputHandleIds: getOutputHandleIds(nodeId, orderConfigId, orderType),
				symbol: updates.symbol ?? symbol,
				orderType: updates.orderType ?? orderType,
				orderSide: updates.orderSide ?? orderSide,
				price: updates.price ?? currentPrice,
				quantity: updates.quantity ?? currentQuantity,
				tp: updates.tp !== undefined ? updates.tp : tp,
				sl: updates.sl !== undefined ? updates.sl : sl,
				tpType: updates.tpType ?? tpType,
				slType: updates.slType ?? slType,
				triggerConfig: updates.triggerConfig ?? triggerConfig,
			};
			onChange(newConfig);
		},
		[
			symbol,
			orderType,
			orderSide,
			priceStr,
			quantityStr,
			tp,
			sl,
			tpType,
			slType,
			orderConfigId,
			nodeId,
			triggerConfig,
			onChange,
		],
	);

	// Field change handler functions
	const handleSymbolChange = (value: string) => {
		setSymbol(value);
		saveConfig({ symbol: value });
	};

	const handleOrderTypeChange = (value: OrderType) => {
		setOrderType(value);
		saveConfig({ orderType: value });
	};

	const handleOrderSideChange = (value: FuturesOrderSide) => {
		setOrderSide(value);
		saveConfig({ orderSide: value });
	};

	// Price input handling - only update string state
	const handlePriceInputChange = (value: string) => {
		setPriceStr(value);
	};

	// Save on price blur
	const handlePriceBlur = () => {
		const numValue = parseFloat(priceStr) || 0;
		saveConfig({ price: numValue });
	};

	// Quantity input handling - only update string state
	const handleQuantityInputChange = (value: string) => {
		setQuantityStr(value);
	};

	// Save on quantity blur
	const handleQuantityBlur = () => {
		const numValue = parseFloat(quantityStr) || 0;
		saveConfig({ quantity: numValue });
	};

	const handleTpChange = (value: number | null) => {
		setTp(value);
		saveConfig({ tp: value });
	};

	const handleSlChange = (value: number | null) => {
		setSl(value);
		saveConfig({ sl: value });
	};

	const handleTpTypeChange = (value: "price" | "percentage" | "point") => {
		setTpType(value);
		saveConfig({ tpType: value });
	};

	const handleSlTypeChange = (value: "price" | "percentage" | "point") => {
		setSlType(value);
		saveConfig({ slType: value });
	};

	const handleTriggerConfigChange = (triggerCase: ConditionTrigger | null) => {
		setTriggerConfig(triggerCase);
		saveConfig({ triggerConfig: triggerCase });
	};

	const isMarketOrder =
		orderType === OrderType.MARKET || orderType === OrderType.STOP_MARKET;

	return (
		<div className="group flex-1 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				{/* Title row */}
				<div className="flex items-center justify-between p-2">
					<CollapsibleTrigger asChild>
						<div className="flex flex-1 items-center gap-2 cursor-pointer select-none">
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 shrink-0 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
							>
								{isOpen ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronRight className="h-4 w-4" />
								)}
							</Button>
							<div className="flex items-center gap-3 overflow-hidden">
								{isOpen ? (
									<div className="flex items-center gap-2 text-sm font-medium text-slate-700">
										<Settings2 className="h-4 w-4 text-blue-500" />
										<span>
											{t("futuresOrderNode.create")}{" "}
											{getOrderTypeLabel(orderType, t)}
										</span>
									</div>
								) : (
									<div className="flex items-center gap-2 min-w-0">
										<span className="text-sm font-medium truncate">
											{symbol || t("common.notSelected")}
										</span>
										<Badge
											variant="outline"
											className={cn(
												"shrink-0 border-opacity-50",
												getFuturesOrderSideColor(orderSide),
											)}
										>
											{getFuturesOrderSideLabel(orderSide, t)}
										</Badge>
										<span className="text-sm text-slate-500 truncate">
											{quantityStr || "0"}
										</span>
									</div>
								)}
							</div>
						</div>
					</CollapsibleTrigger>

					{/* Delete button */}
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-2 shrink-0"
						onClick={onDelete}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>

				{/* Form content */}
				<CollapsibleContent>
					<div className="px-4 pb-4 pt-1 grid gap-4">
						{/* Trigger condition */}
						<div className="grid gap-2">
							<Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
								<GitBranch className="h-3.5 w-3.5 text-indigo-500" />
								{t("futuresOrderNode.orderConfig.triggerCondition")}
							</Label>
							<CaseSelector
								caseList={caseItemList}
								selectedTriggerCase={triggerConfig}
								onTriggerCaseChange={handleTriggerConfigChange}
							/>
							{!triggerConfig && (
								<p className="text-xs text-red-500 mt-1">
									{t("futuresOrderNode.validation.noTriggerCondition")}
								</p>
							)}
						</div>

						{/* Order type */}
						<div className="grid gap-2">
							<Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
								<Settings2 className="h-3.5 w-3.5 text-blue-500" />
								{t("futuresOrderNode.orderConfig.orderType")}
							</Label>
							<Selector
								value={orderType}
								onValueChange={(value) =>
									handleOrderTypeChange(value as OrderType)
								}
								placeholder={t("market.orderType.placeholder")}
								options={ORDER_TYPE_OPTIONS}
								className="w-full hover:bg-slate-100 cursor-pointer"
							/>
						</div>

						{/* Symbol */}
						<div className="grid gap-2">
							<Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
								<Hash className="h-3.5 w-3.5 text-orange-500" />
								{t("futuresOrderNode.orderConfig.symbol")}
							</Label>
							<SelectWithSearch
								options={symbolList.map((s) => ({
									value: s.name,
									label: s.name,
								}))}
								value={symbol}
								onValueChange={handleSymbolChange}
								placeholder={t(
									"futuresOrderNode.orderConfig.symbolPlaceholder",
								)}
								searchPlaceholder={t(
									"futuresOrderNode.orderConfig.symbolSearchPlaceholder",
								)}
								emptyMessage={t(
									"futuresOrderNode.orderConfig.symbolEmptyMessage",
								)}
								className="w-full bg-slate-50/50 hover:bg-slate-100 cursor-pointer"
							/>
							{!symbol && (
								<p className="text-xs text-red-500 mt-1">
									{t("futuresOrderNode.validation.noSymbol")}
								</p>
							)}
						</div>

						{/* Order side */}
						<div className="grid gap-2">
							<Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
								<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
								{t("futuresOrderNode.orderConfig.orderSide")}
							</Label>
							<Selector
								value={orderSide}
								onValueChange={(value) =>
									handleOrderSideChange(value as FuturesOrderSide)
								}
								placeholder={t(
									"futuresOrderNode.orderConfig.orderSidePlaceholder",
								)}
								options={ORDER_SIDE_OPTIONS}
								className="w-full hover:bg-slate-100 cursor-pointer"
							/>
						</div>

						{/* Price - only shown for limit orders */}
						{!isMarketOrder && (
							<div className="grid gap-2">
								<Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
									<Coins className="h-3.5 w-3.5 text-yellow-500" />
									{t("futuresOrderNode.orderConfig.price")}
								</Label>
								<Input
									type="text"
									inputMode="decimal"
									value={priceStr}
									onChange={(e) => handlePriceInputChange(e.target.value)}
									onBlur={handlePriceBlur}
									placeholder={t(
										"futuresOrderNode.orderConfig.pricePlaceholder",
									)}
								/>
								{!priceStr && (
									<p className="text-xs text-red-500 mt-1">
										{t("futuresOrderNode.validation.noPrice")}
									</p>
								)}
							</div>
						)}

						{/* Quantity */}
						<div className="grid gap-2">
							<Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
								<Coins className="h-3.5 w-3.5 text-purple-500" />
								{t("futuresOrderNode.orderConfig.quantity")}
							</Label>
							{/* <InputWithDropdown
								type="text"
								value={quantityStr}
								onChange={handleQuantityInputChange}
								onBlur={handleQuantityBlur}
								placeholder={t(
									"futuresOrderNode.orderConfig.quantityPlaceholder",
								)}
								dropdownValue="USDT"
								dropdownOptions={[{ value: "USDT", label: "USDT" }]}
								onDropdownChange={() => {}}

							/> */}
							<Input
								type="number"
								value={quantityStr}
								onChange={(e) => handleQuantityInputChange(e.target.value)}
								onBlur={handleQuantityBlur}
								min={0}
								step={0.01}
								placeholder={t(
									"futuresOrderNode.orderConfig.quantityPlaceholder",
								)}
							/>
							{!quantityStr && (
								<p className="text-xs text-red-500 mt-1">
									{t("futuresOrderNode.validation.noQuantity")}
								</p>
							)}
						</div>

						{/* Take Profit */}
						<div className="grid gap-2">
							<Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
								<ArrowUpCircle className="h-3.5 w-3.5 text-green-500" />
								{t("futuresOrderNode.orderConfig.takeProfit")}
							</Label>
							<InputWithDropdown
								type="number"
								value={tp}
								onChange={(v) => handleTpChange(v ? Number(v) : null)}
								min={0}
								step={0.01}
								placeholder={
									tpType === "price"
										? t(
												"futuresOrderNode.orderConfig.takeProfitPricePlaceholder",
											)
										: tpType === "percentage"
											? t(
													"futuresOrderNode.orderConfig.takeProfitPercentagePlaceholder",
												)
											: `${t("futuresOrderNode.orderConfig.takeProfitPointPlaceholder", { point: symbolInfo?.point || "N/A" })}`
								}
								dropdownValue={tpType}
								dropdownOptions={TP_SL_TYPE_OPTIONS}
								onDropdownChange={(v) =>
									handleTpTypeChange(v as "price" | "percentage" | "point")
								}
							/>
						</div>

						{/* Stop Loss */}
						<div className="grid gap-2">
							<Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
								<ArrowUpCircle className="h-3.5 w-3.5 text-red-500 rotate-180" />
								{t("futuresOrderNode.orderConfig.stopLoss")}
							</Label>
							<InputWithDropdown
								type="number"
								value={sl}
								onChange={(v) => handleSlChange(v ? Number(v) : null)}
								min={0}
								step={0.01}
								placeholder={
									slType === "price"
										? t("futuresOrderNode.orderConfig.stopLossPricePlaceholder")
										: slType === "percentage"
											? t(
													"futuresOrderNode.orderConfig.stopLossPercentagePlaceholder",
												)
											: `${t("futuresOrderNode.orderConfig.stopLossPointPlaceholder", { point: symbolInfo?.point || "N/A" })}`
								}
								dropdownValue={slType}
								dropdownOptions={TP_SL_TYPE_OPTIONS}
								onDropdownChange={(v) =>
									handleSlTypeChange(v as "price" | "percentage" | "point")
								}
							/>
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
};

export default OrderConfigForm;
