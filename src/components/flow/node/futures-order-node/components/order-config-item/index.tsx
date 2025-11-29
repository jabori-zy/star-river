import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { getSymbolInfo } from "@/service/market";
import type { Instrument } from "@/types/market";
import {
	type FuturesOrderConfig,
	FuturesOrderSide,
	OrderType,
	getOrderTypeLabel,
	getFuturesOrderSideLabel,
	getFuturesOrderSideColor,
	getTpSlTypeLabel,
} from "@/types/order";


interface OrderConfigFormProps {
	accountId: number | undefined;
	nodeId: string;
	config?: FuturesOrderConfig;
	orderConfigId: number;
	symbolList: Instrument[];
	onChange: (config: FuturesOrderConfig) => void;
	onDelete: () => void;
}

const OrderConfigForm: React.FC<OrderConfigFormProps> = ({
	accountId,
	nodeId,
	config,
	orderConfigId,
	symbolList,
	onChange,
	onDelete,
}) => {
	const { t } = useTranslation();

	// 使用 useMemo 生成多语言选项
	const ORDER_TYPE_OPTIONS = useMemo(
		() => [
			{ value: OrderType.LIMIT, label: getOrderTypeLabel(OrderType.LIMIT, t) },
			{ value: OrderType.MARKET, label: getOrderTypeLabel(OrderType.MARKET, t) },
			{ value: OrderType.STOP_MARKET, label: getOrderTypeLabel(OrderType.STOP_MARKET, t) },
			{ value: OrderType.TAKE_PROFIT_MARKET, label: getOrderTypeLabel(OrderType.TAKE_PROFIT_MARKET, t) },
		],
		[t],
	);

	const ORDER_SIDE_OPTIONS = useMemo(
		() => [
			{ value: FuturesOrderSide.LONG, label: getFuturesOrderSideLabel(FuturesOrderSide.LONG, t) },
			{ value: FuturesOrderSide.SHORT, label: getFuturesOrderSideLabel(FuturesOrderSide.SHORT, t) },
		],
		[t],
	);

	const TP_SL_TYPE_OPTIONS = useMemo(
		() => [
			{ value: "price" as const, label: getTpSlTypeLabel("price", t) },
			{ value: "percentage" as const, label: getTpSlTypeLabel("percentage", t) },
			{ value: "point" as const, label: getTpSlTypeLabel("point", t) },
		],
		[t],
	);

	// 折叠状态
	const [isOpen, setIsOpen] = useState(true);

	// 表单状态
	const [symbol, setSymbol] = useState<string>(config?.symbol || "");
	const [orderType, setOrderType] = useState<OrderType>(
		config?.orderType || OrderType.LIMIT,
	);
	const [orderSide, setOrderSide] = useState<FuturesOrderSide>(
		config?.orderSide || FuturesOrderSide.LONG,
	);
	// 使用字符串状态处理输入，避免数字输入问题
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

	// 获取symbol信息
	const [symbolInfo, setSymbolInfo] = useState<Instrument | null>(null);

	// 获取symbol信息的函数
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
				console.error("获取symbol信息失败:", error);
				setSymbolInfo(null);
			}
		},
		[accountId],
	);

	// 当symbol变化时获取symbol信息
	useEffect(() => {
		if (symbol && accountId) {
			loadSymbolInfo(symbol);
		} else {
			setSymbolInfo(null);
		}
	}, [symbol, accountId, loadSymbolInfo]);

	// 保存配置 - 在字段变化时调用
	const saveConfig = useCallback(
		(updates: Partial<FuturesOrderConfig>) => {
			const currentPrice = parseFloat(priceStr) || 0;
			const currentQuantity = parseFloat(quantityStr) || 0;
			const newConfig: FuturesOrderConfig = {
				orderConfigId,
				inputHandleId: `${nodeId}_input_${orderConfigId}`,
				symbol: updates.symbol ?? symbol,
				orderType: updates.orderType ?? orderType,
				orderSide: updates.orderSide ?? orderSide,
				price: updates.price ?? currentPrice,
				quantity: updates.quantity ?? currentQuantity,
				tp: updates.tp !== undefined ? updates.tp : tp,
				sl: updates.sl !== undefined ? updates.sl : sl,
				tpType: updates.tpType ?? tpType,
				slType: updates.slType ?? slType,
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
			onChange,
		],
	);

	// 字段变化处理函数
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

	// 价格输入处理 - 只更新字符串状态
	const handlePriceInputChange = (value: string) => {
		setPriceStr(value);
	};

	// 价格失焦时保存
	const handlePriceBlur = () => {
		const numValue = parseFloat(priceStr) || 0;
		saveConfig({ price: numValue });
	};

	// 数量输入处理 - 只更新字符串状态
	const handleQuantityInputChange = (value: string) => {
		setQuantityStr(value);
	};

	// 数量失焦时保存
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

	const isMarketOrder =
		orderType === OrderType.MARKET || orderType === OrderType.STOP_MARKET;

	return (
		<div className="group flex-1 space-y-1 p-2 rounded-md border bg-slate-50/50">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				{/* 标题行 */}
				<div className="flex items-center justify-between gap-2">
					<CollapsibleTrigger asChild>
						<div className="flex items-center gap-2 cursor-pointer">
							{isOpen ? (
								<ChevronDown className="h-4 w-4 flex-shrink-0" />
							) : (
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							)}
							{isOpen ? (
								<span className="text-sm font-medium">
									{t("futuresOrderNode.create")} {getOrderTypeLabel(orderType, t)}
								</span>
							) : (
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium">{symbol || t("common.notSelected")}</span>
									<Badge
										variant="outline"
										style={{ color: getFuturesOrderSideColor(orderSide), borderColor: getFuturesOrderSideColor(orderSide) }}
									>
										{getFuturesOrderSideLabel(orderSide, t)}
									</Badge>
									<span className="text-sm text-muted-foreground">
										{t("futuresOrderNode.orderConfig.quantity")}: {quantityStr || "0"}
									</span>
								</div>
							)}
						</div>
					</CollapsibleTrigger>

					{/* 删除按钮 */}
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
						onClick={onDelete}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>

				{/* 表单内容 */}
				<CollapsibleContent>
					<div className="flex flex-col gap-4 mt-3">
						{/* 订单类型 */}
						<div className="flex flex-col gap-1.5">
							<Label className="text-sm font-medium">{t("futuresOrderNode.orderConfig.orderType")}</Label>
							<Selector
								value={orderType}
								onValueChange={(value) =>
									handleOrderTypeChange(value as OrderType)
								}
								placeholder={t("market.orderType.placeholder")}
								options={ORDER_TYPE_OPTIONS}
                                className="cursor-pointer hover:bg-gray-100"
							/>
						</div>

						{/* 交易对 */}
						<div className="flex flex-col gap-1.5">
							<Label className="text-sm font-medium">{t("futuresOrderNode.orderConfig.symbol")}</Label>
							<SelectWithSearch
								options={symbolList.map((s) => ({
									value: s.name,
									label: s.name,
								}))}
								value={symbol}
								onValueChange={handleSymbolChange}
								placeholder={t("futuresOrderNode.orderConfig.symbolPlaceholder")}
								searchPlaceholder={t("futuresOrderNode.orderConfig.symbolSearchPlaceholder")}
								emptyMessage={t("futuresOrderNode.orderConfig.symbolEmptyMessage")}
                                className="cursor-pointer hover:!bg-gray-100 !bg-transparent"
							/>
						</div>

						{/* 买卖方向 */}
						<div className="flex flex-col gap-1.5">
							<Label className="text-sm font-medium">{t("futuresOrderNode.orderConfig.orderSide")}</Label>
							<Selector
								value={orderSide}
								onValueChange={(value) =>
									handleOrderSideChange(value as FuturesOrderSide)
								}
								placeholder={t("futuresOrderNode.orderConfig.orderSidePlaceholder")}
								options={ORDER_SIDE_OPTIONS}
                                className="cursor-pointer hover:!bg-gray-100"
							/>
						</div>

						{/* 价格 - 仅限价单显示 */}
						{!isMarketOrder && (
							<div className="flex flex-col gap-1.5">
								<Label className="text-sm font-medium">{t("futuresOrderNode.orderConfig.price")}</Label>
								<Input
									type="text"
									inputMode="decimal"
									value={priceStr}
									onChange={(e) => handlePriceInputChange(e.target.value)}
									onBlur={handlePriceBlur}
									placeholder={t("futuresOrderNode.orderConfig.pricePlaceholder")}
								/>
							</div>
						)}

						{/* 数量 */}
						<div className="flex flex-col gap-1.5">
							<Label className="text-sm font-medium">{t("futuresOrderNode.orderConfig.quantity")}</Label>
							<InputWithDropdown
								type="text"
								value={quantityStr}
								onChange={handleQuantityInputChange}
								onBlur={handleQuantityBlur}
								placeholder={t("futuresOrderNode.orderConfig.quantityPlaceholder")}
								dropdownValue="USDT"
								dropdownOptions={[{ value: "USDT", label: "USDT" }]}
								onDropdownChange={() => {}}
							/>
						</div>

						{/* 止盈 */}
						<div className="flex flex-col gap-1.5">
							<Label className="text-sm font-medium">{t("futuresOrderNode.orderConfig.takeProfit")}</Label>
							<InputWithDropdown
								type="number"
								value={tp}
								onChange={(v) => handleTpChange(v ? Number(v) : null)}
								min={0}
								step={0.01}
								placeholder={
									tpType === "price"
										? t("futuresOrderNode.orderConfig.takeProfitPricePlaceholder")
										: tpType === "percentage"
											? t("futuresOrderNode.orderConfig.takeProfitPercentagePlaceholder")
											: `${t("futuresOrderNode.orderConfig.takeProfitPointPlaceholder", { point: symbolInfo?.point || "N/A" })}`
								}
								dropdownValue={tpType}
								dropdownOptions={TP_SL_TYPE_OPTIONS}
								onDropdownChange={(v) =>
									handleTpTypeChange(v as "price" | "percentage" | "point")
								}
							/>
						</div>

						{/* 止损 */}
						<div className="flex flex-col gap-1.5">
							<Label className="text-sm font-medium">{t("futuresOrderNode.orderConfig.stopLoss")}</Label>
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
											? t("futuresOrderNode.orderConfig.stopLossPercentagePlaceholder")
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
