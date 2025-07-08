import React from "react";
import { FuturesOrderSide } from "@/types/order";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface OrderSideSelectorProps {
    value: FuturesOrderSide;
    onChange: (value: FuturesOrderSide) => void;
    disabled?: boolean;
}

// 订单方向选项
const ORDER_SIDE_OPTIONS = [
    { value: FuturesOrderSide.OPEN_LONG, label: '开多', color: 'text-green-600' },
    { value: FuturesOrderSide.OPEN_SHORT, label: '开空', color: 'text-red-600' },
    { value: FuturesOrderSide.CLOSE_LONG, label: '平多', color: 'text-red-600' },
    { value: FuturesOrderSide.CLOSE_SHORT, label: '平空', color: 'text-green-600' },
];

const OrderSideSelector: React.FC<OrderSideSelectorProps> = ({
    value,
    onChange,
    disabled = false
}) => {
    return (
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order-side" className="text-right">
                买卖方向
            </Label>
            <div className="col-span-3">
                <Select 
                    value={value} 
                    onValueChange={(selectedValue: FuturesOrderSide) => onChange(selectedValue)}
                    disabled={disabled}
                >
                    <SelectTrigger id="order-side">
                        <SelectValue placeholder="选择买卖方向" />
                    </SelectTrigger>
                    <SelectContent>
                        {ORDER_SIDE_OPTIONS.map((option) => (
                            <SelectItem 
                                key={option.value} 
                                value={option.value}
                            >
                                <span className={option.color}>
                                    {option.label}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default OrderSideSelector;
