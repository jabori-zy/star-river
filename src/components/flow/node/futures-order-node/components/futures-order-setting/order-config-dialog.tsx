import React, { useEffect } from "react";
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
import OrderSideSelector from "./order-side-selector";
import OrderTypeSelector from "./order-type-selector";
import SymbolSelector from "./symbol-selector";

interface OrderConfigDialogProps {
	isOpen: boolean;
	isEditing: boolean;
	editingConfig?: FuturesOrderConfig;
	onOpenChange: (open: boolean) => void;
	onSave: (config: FuturesOrderConfig) => void;
}

const OrderConfigDialog: React.FC<OrderConfigDialogProps> = ({
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
			} else {
				resetForm();
			}
		}
	}, [isOpen, isEditing, editingConfig]);

	const resetForm = () => {
		setSymbol("");
		setOrderType(OrderType.LIMIT);
		setOrderSide(FuturesOrderSide.OPEN_LONG);
		setPrice(0);
		setQuantity(0);
		setTp(null);
		setSl(null);
	};

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
		};

		onSave(orderConfig);
		onOpenChange(false);
	};

	const isMarketOrder =
		orderType === OrderType.MARKET || orderType === OrderType.STOP_MARKET;

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
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
					<SymbolSelector value={symbol} onChange={setSymbol} />

					<OrderTypeSelector value={orderType} onChange={setOrderType} />

					<OrderSideSelector value={orderSide} onChange={setOrderSide} />

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
							止盈价
						</Label>
						<div className="col-span-3">
							<Input
								id="tp"
								type="number"
								value={tp || ""}
								onChange={(e) =>
									setTp(e.target.value ? Number(e.target.value) : null)
								}
								min={0}
								step={0.01}
								placeholder="输入止盈价 (可选)"
							/>
						</div>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="sl" className="text-right">
							止损价
						</Label>
						<div className="col-span-3">
							<Input
								id="sl"
								type="number"
								value={sl || ""}
								onChange={(e) =>
									setSl(e.target.value ? Number(e.target.value) : null)
								}
								min={0}
								step={0.01}
								placeholder="输入止损价 (可选)"
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
