import React, { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	type FuturesOrderConfig,
	FuturesOrderSide,
	OrderType,
} from "@/types/order";
import SymbolSelector from "./symbol-selector";
import type { MarketSymbol } from "@/types/market";
import { getSymbolInfo } from "@/service/market";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { ShoppingCart, TrendingUp } from "lucide-react";

// 订单类型选项
const ORDER_TYPE_OPTIONS = [
	{ value: OrderType.LIMIT, label: "限价单" },
	{ value: OrderType.MARKET, label: "市价单" },
];

// 订单方向选项
const ORDER_SIDE_OPTIONS = [
	{ value: FuturesOrderSide.OPEN_LONG, label: "开多" },
	{ value: FuturesOrderSide.OPEN_SHORT, label: "开空" },
];

// 止盈止损类型选项
const TP_SL_TYPE_OPTIONS = [
	{ value: "price", label: "price" },
	{ value: "percentage", label: "percent" },
	{ value: "point", label: "point" },
];

interface OrderConfigDialogProps {
	accountId: number | undefined;
	isOpen: boolean;
	isEditing: boolean;
	editingConfig?: FuturesOrderConfig;
	onOpenChange: (open: boolean) => void;
	onSave: (config: FuturesOrderConfig) => void;
}

const OrderConfigDialog: React.FC<OrderConfigDialogProps> = ({
	accountId,
	isOpen,
	isEditing,
	editingConfig,
	onOpenChange,
	onSave,
}) => {
	// 表单状态
	const [symbol, setSymbol] = React.useState<string>("");
	const [orderType, setOrderType] = React.useState<OrderType>(OrderType.LIMIT);
	const [orderSide, setOrderSide] = React.useState<FuturesOrderSide>(
		FuturesOrderSide.OPEN_LONG,
	);
	const [price, setPrice] = React.useState<number>(0);
	const [quantity, setQuantity] = React.useState<number>(0);
	const [tp, setTp] = React.useState<number | null>(null);
	const [sl, setSl] = React.useState<number | null>(null);
	const [tpType, setTpType] = React.useState<"price" | "percentage" | "point">("price");
	const [slType, setSlType] = React.useState<"price" | "percentage" | "point">("price");

	// 获取symbol信息
	const [symbolInfo, setSymbolInfo] = React.useState<MarketSymbol | null>(null);

	// 获取symbol信息的函数
	const loadSymbolInfo = useCallback(async (symbolName: string) => {
		if (!accountId || !symbolName.trim()) {
			setSymbolInfo(null);
			return;
		}

		try {
			const info = await getSymbolInfo(accountId, symbolName);
			console.log("symbolInfo", info);
			setSymbolInfo(info);
		} catch (error) {
			console.error("获取symbol信息失败:", error);
			setSymbolInfo(null);
		}
	}, [accountId]);

	// 当symbol变化时获取symbol信息
	useEffect(() => {
		if (symbol && accountId) {
			loadSymbolInfo(symbol);
		} else {
			setSymbolInfo(null);
		}
	}, [symbol, accountId, loadSymbolInfo]);

	const resetForm = useCallback(() => {
		setSymbol("");
		setOrderType(OrderType.LIMIT);
		setOrderSide(FuturesOrderSide.OPEN_LONG);
		setPrice(0);
		setQuantity(0);
		setTp(null);
		setSl(null);
		setTpType("price");
		setSlType("price");
		setSymbolInfo(null);
	}, []);

	// 当对话框打开时重置或恢复状态
	useEffect(() => {
		if (isOpen) {
			if (isEditing && editingConfig) {
				setSymbol(editingConfig.symbol);
				setOrderType(editingConfig.orderType);
				setOrderSide(editingConfig.orderSide);
				setPrice(editingConfig.price);
				setQuantity(editingConfig.quantity);
				setTp(editingConfig.tp);
				setSl(editingConfig.sl);
				// 从编辑配置中恢复止盈止损类型，如果没有则默认为价格
				setTpType(editingConfig.tpType || "price");
				setSlType(editingConfig.slType || "price");
				// 如果有symbol，立即加载symbol信息
				if (editingConfig.symbol && accountId) {
					loadSymbolInfo(editingConfig.symbol);
				}
			} else {
				resetForm();
			}
		}
	}, [isOpen, isEditing, editingConfig, resetForm, accountId, loadSymbolInfo]);

	

	const handleSave = () => {
		if (!symbol.trim() || quantity <= 0) {
			return;
		}

		if (
			(orderType === OrderType.LIMIT ||
				orderType === OrderType.STOP_LIMIT ||
				orderType === OrderType.TAKE_PROFIT_LIMIT) &&
			price <= 0
		) {
			return;
		}

		const orderConfig: FuturesOrderConfig = {
			orderConfigId: editingConfig?.orderConfigId || 0, // 编辑时保持原有id，新增时由主组件设置为正确的值
			inputHandleId: editingConfig?.inputHandleId || "", // 编辑时保持原有inputHandleId，新增时由主组件设置
			symbol: symbol.trim(),
			orderType,
			orderSide,
			price,
			quantity,
			tp,
			sl,
			tpType,
			slType,
		};

		onSave(orderConfig);
		onOpenChange(false);
	};

	const isMarketOrder =
		orderType === OrderType.MARKET || orderType === OrderType.STOP_MARKET;

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange} modal={false}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "配置期货订单" : "添加期货订单"}
					</DialogTitle>
					<DialogDescription>
						配置期货订单的交易参数，包括交易对、订单类型、价格和止盈止损等。
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<SymbolSelector value={symbol} onChange={setSymbol} accountId={accountId} />

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="order-type" className="text-right">
							订单类型
						</Label>
						<div className="col-span-3">
							<SelectInDialog
								id="order-type"
								value={orderType}
								onValueChange={(value) => setOrderType(value as OrderType)}
								placeholder="选择订单类型"
								options={ORDER_TYPE_OPTIONS}
							/>
						</div>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="order-side" className="text-right">
							买卖方向
						</Label>
						<div className="col-span-3">
							<SelectInDialog
								id="order-side"
								value={orderSide}
								onValueChange={(value) => setOrderSide(value as FuturesOrderSide)}
								placeholder="选择买卖方向"
								options={ORDER_SIDE_OPTIONS}
							/>
						</div>
					</div>

					{!isMarketOrder && (
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="price" className="text-right">
								价格
							</Label>
							<div className="col-span-3">
								<Input
									id="price"
									type="number"
									value={price}
									onChange={(e) => setPrice(Number(e.target.value))}
									min={0}
									step={0.01}
									placeholder="输入价格"
								/>
							</div>
						</div>
					)}

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="quantity" className="text-right">
							数量
						</Label>
						<div className="col-span-3">
							<Input
								id="quantity"
								type="number"
								value={quantity}
								onChange={(e) => setQuantity(Number(e.target.value))}
								min={0}
								step={0.001}
								placeholder="输入数量"
							/>
						</div>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="tp" className="text-right">
							止盈
						</Label>
						<div className="col-span-3 flex gap-2">
							<div className="flex-1 relative">
								<Input
									id="tp"
									type="number"
									value={tp || ""}
									onChange={(e) =>
										setTp(e.target.value ? Number(e.target.value) : null)
									}
									min={0}
									step={tpType === "percentage" ? 0.1 : tpType === "point" ? 1 : 0.01}
									placeholder={tpType === "price" ? "输入止盈价 (可选)" : tpType === "percentage" ? "输入止盈百分比 (可选)" : `point is ${symbolInfo?.point || 'N/A'}`}
									className={tpType === "percentage" ? "pr-6" : ""}
								/>
							</div>
							<SelectInDialog
								value={tpType}
								onValueChange={(value) => setTpType(value as "price" | "percentage" | "point")}
								options={TP_SL_TYPE_OPTIONS}
								className="w-26"
							/>
						</div>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="sl" className="text-right">
							止损
						</Label>
						<div className="col-span-3 flex gap-2">
							<div className="flex-1 relative">
								<Input
									id="sl"
									type="number"
									value={sl || ""}
									onChange={(e) =>
										setSl(e.target.value ? Number(e.target.value) : null)
									}
									min={0}
									step={slType === "percentage" ? 0.1 : slType === "point" ? 1 : 0.01}
									placeholder={slType === "price" ? "输入止损价 (可选)" : slType === "percentage" ? "输入止损百分比 (可选)" : `point is ${symbolInfo?.point || 'N/A'}`}
									className={slType === "percentage" ? "pr-6" : ""}
								/>
							</div>
							<SelectInDialog
								value={slType}
								onValueChange={(value) => setSlType(value as "price" | "percentage" | "point")}
								options={TP_SL_TYPE_OPTIONS}
								className="w-26"
							/>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						取消
					</Button>
					<Button
						onClick={handleSave}
						disabled={
							!symbol.trim() || quantity <= 0 || (!isMarketOrder && price <= 0)
						}
					>
						保存
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default OrderConfigDialog;
