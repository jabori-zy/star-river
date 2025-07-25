import React from "react";
import { OrderType } from "@/types/order";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TrendingUp, ShoppingCart } from "lucide-react";

interface OrderTypeSelectorProps {
	value: OrderType;
	onChange: (value: OrderType) => void;
	disabled?: boolean;
}

// 订单类型选项
const ORDER_TYPE_OPTIONS = [
	{ value: OrderType.LIMIT, label: "限价单", icon: TrendingUp },
	{ value: OrderType.MARKET, label: "市价单", icon: ShoppingCart },
	{ value: OrderType.STOP_LIMIT, label: "止损限价单", icon: TrendingUp },
	{ value: OrderType.STOP_MARKET, label: "止损市价单", icon: ShoppingCart },
	{ value: OrderType.TAKE_PROFIT, label: "止盈单", icon: TrendingUp },
	{ value: OrderType.TAKE_PROFIT_LIMIT, label: "止盈限价单", icon: TrendingUp },
];

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({
	value,
	onChange,
	disabled = false,
}) => {
	return (
		<div className="grid grid-cols-4 items-center gap-4">
			<Label htmlFor="order-type" className="text-right">
				订单类型
			</Label>
			<div className="col-span-3">
				<Select
					value={value}
					onValueChange={(selectedValue: OrderType) => onChange(selectedValue)}
					disabled={disabled}
				>
					<SelectTrigger id="order-type">
						<SelectValue placeholder="选择订单类型" />
					</SelectTrigger>
					<SelectContent>
						{ORDER_TYPE_OPTIONS.map((option) => {
							const IconComponent = option.icon;
							return (
								<SelectItem key={option.value} value={option.value}>
									<div className="flex items-center">
										<IconComponent className="h-4 w-4 mr-2 text-blue-500" />
										<span>{option.label}</span>
									</div>
								</SelectItem>
							);
						})}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
};

export default OrderTypeSelector;
