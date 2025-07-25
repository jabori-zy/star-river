import React from "react";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";

interface SymbolSelectorProps {
	value: string;
	onChange: (value: string | null) => void;
	disabled?: boolean;
	allowEmpty?: boolean;
}

// 常用交易对选项
const SYMBOL_OPTIONS = [
	{ value: "BTCUSDT", label: "BTC/USDT" },
	{ value: "ETHUSDT", label: "ETH/USDT" },
	{ value: "BNBUSDT", label: "BNB/USDT" },
	{ value: "ADAUSDT", label: "ADA/USDT" },
	{ value: "SOLUSDT", label: "SOL/USDT" },
	{ value: "XRPUSDT", label: "XRP/USDT" },
	{ value: "DOTUSDT", label: "DOT/USDT" },
	{ value: "AVAXUSDT", label: "AVAX/USDT" },
	{ value: "MATICUSDT", label: "MATIC/USDT" },
	{ value: "LINKUSDT", label: "LINK/USDT" },
	{ value: "UNIUSDT", label: "UNI/USDT" },
	{ value: "AAVEUSDT", label: "AAVE/USDT" },
	{ value: "COMPUSDT", label: "COMP/USDT" },
	{ value: "MKRUSDT", label: "MKR/USDT" },
	{ value: "SUSHIUSDT", label: "SUSHI/USDT" },
];

const SymbolSelector: React.FC<SymbolSelectorProps> = ({
	value,
	onChange,
	disabled = false,
	allowEmpty = false,
}) => {
	return (
		<Select
			value={value || "__EMPTY__"}
			onValueChange={(selectedValue: string) => {
				if (selectedValue === "__EMPTY__" && allowEmpty) {
					onChange(null);
				} else {
					onChange(selectedValue);
				}
			}}
			disabled={disabled}
		>
			<SelectTrigger id="symbol">
				<SelectValue
					placeholder={allowEmpty ? "选择交易对 (可选)" : "选择交易对"}
				/>
			</SelectTrigger>
			<SelectContent>
				{allowEmpty && (
					<SelectItem value="__EMPTY__">
						<span className="text-muted-foreground">不限制交易对</span>
					</SelectItem>
				)}
				{SYMBOL_OPTIONS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						<div className="flex items-center justify-between w-full">
							<span className="font-medium">{option.label}</span>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export default SymbolSelector;
