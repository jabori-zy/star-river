import React from "react";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SymbolSelectorProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

// 常用交易对选项
const SYMBOL_OPTIONS = [
	{ value: "BTCUSDm", label: "BTC/USDm" },
	{ value: "ETHUSDm", label: "ETH/USDm" },
];

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
	value,
	onChange,
	disabled = false,
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
							<SelectItem key={option.value} value={option.value}>
								<div className="flex items-center justify-between w-full">
									<span className="font-medium">{option.label}</span>
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
