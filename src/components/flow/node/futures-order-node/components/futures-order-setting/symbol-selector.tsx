import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface SymbolSelectorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

// 常用交易对选项
const SYMBOL_OPTIONS = [
    { value: 'BTCUSDT', label: 'BTC/USDT', category: '主流币' },
    { value: 'ETHUSDT', label: 'ETH/USDT', category: '主流币' },
    { value: 'BNBUSDT', label: 'BNB/USDT', category: '主流币' },
    { value: 'ADAUSDT', label: 'ADA/USDT', category: '主流币' },
    { value: 'SOLUSDT', label: 'SOL/USDT', category: '主流币' },
    { value: 'XRPUSDT', label: 'XRP/USDT', category: '主流币' },
    { value: 'DOTUSDT', label: 'DOT/USDT', category: '主流币' },
    { value: 'AVAXUSDT', label: 'AVAX/USDT', category: '主流币' },
    { value: 'MATICUSDT', label: 'MATIC/USDT', category: '主流币' },
    { value: 'LINKUSDT', label: 'LINK/USDT', category: '主流币' },
    { value: 'UNIUSDT', label: 'UNI/USDT', category: 'DeFi' },
    { value: 'AAVEUSDT', label: 'AAVE/USDT', category: 'DeFi' },
    { value: 'COMPUSDT', label: 'COMP/USDT', category: 'DeFi' },
    { value: 'MKRUSDT', label: 'MKR/USDT', category: 'DeFi' },
    { value: 'SUSHIUSDT', label: 'SUSHI/USDT', category: 'DeFi' },
];

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
    value,
    onChange,
    disabled = false
}) => {
    return (
        <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="symbol" className="text-right">
                交易对
            </Label>
            <div className="col-span-3">
                <Select 
                    value={value} 
                    onValueChange={(selectedValue: string) => onChange(selectedValue)}
                    disabled={disabled}
                >
                    <SelectTrigger id="symbol">
                        <SelectValue placeholder="选择交易对" />
                    </SelectTrigger>
                    <SelectContent>
                        {SYMBOL_OPTIONS.map((option) => (
                            <SelectItem 
                                key={option.value} 
                                value={option.value}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-medium">{option.label}</span>
                                    <Badge variant="outline" className="text-xs text-gray-500 ml-2">
                                        {option.category}
                                    </Badge>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default SymbolSelector;
