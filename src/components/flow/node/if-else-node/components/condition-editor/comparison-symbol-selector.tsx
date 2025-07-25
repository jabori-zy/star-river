import { ComparisonSymbol } from "@/types/node/if-else-node";
import Selector from "@/components/flow/node/if-else-node/components/selector";
import { SelectItem } from "@/components/ui/select";
import { useState, useEffect } from "react";

interface ComparisonSymbolSelectorProps {
	className?: string;
	comparisonSymbol: ComparisonSymbol;
	onComparisonSymbolChange: (comparisonSymbol: ComparisonSymbol) => void;
}

const ComparisonSymbolSelector: React.FC<ComparisonSymbolSelectorProps> = ({
	className,
	comparisonSymbol,
	onComparisonSymbolChange,
}) => {
	const [localComparisonSymbol, setLocalComparisonSymbol] =
		useState<ComparisonSymbol>(comparisonSymbol);

	// 当传入的comparisonSymbol发生变化时，同步更新本地状态
	useEffect(() => {
		setLocalComparisonSymbol(comparisonSymbol);
	}, [comparisonSymbol]);

	const handleComparisonSymbolChange = (value: string) => {
		setLocalComparisonSymbol(value as ComparisonSymbol);
		onComparisonSymbolChange(value as ComparisonSymbol);
	};

	return (
		<Selector
			defaultValue={localComparisonSymbol}
			className={className}
			onValueChange={handleComparisonSymbolChange}
		>
			{Object.values(ComparisonSymbol).map((value) => (
				<SelectItem key={value} value={value}>
					{value}
				</SelectItem>
			))}
		</Selector>
	);
};

export default ComparisonSymbolSelector;
