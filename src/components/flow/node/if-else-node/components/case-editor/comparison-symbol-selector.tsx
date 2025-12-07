import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Selector from "@/components/flow/node/if-else-node/components/selector";
import { SelectItem } from "@/components/ui/select";
import {
	ComparisonSymbol,
	getAvailableComparisonSymbols,
	getComparisonSymbolLabel,
} from "@/types/node/if-else-node";
import type { VariableValueType } from "@/types/variable";

interface ComparisonSymbolSelectorProps {
	className?: string;
	comparisonSymbol: ComparisonSymbol;
	onComparisonSymbolChange: (comparisonSymbol: ComparisonSymbol) => void;
	leftVarValueType?: VariableValueType | null;
}

const ComparisonSymbolSelector: React.FC<ComparisonSymbolSelectorProps> = ({
	className,
	comparisonSymbol,
	onComparisonSymbolChange,
	leftVarValueType,
}) => {
	const [localComparisonSymbol, setLocalComparisonSymbol] =
		useState<ComparisonSymbol>(comparisonSymbol);
	const { t } = useTranslation();
	// Use ref to track the previous left variable type
	const prevLeftVarValueType = useRef<VariableValueType | null | undefined>(
		undefined,
	);

	// Synchronize local state when the incoming comparisonSymbol changes
	useEffect(() => {
		setLocalComparisonSymbol(comparisonSymbol);
	}, [comparisonSymbol]);

	// Get available comparison operators based on left variable type
	const availableSymbols = leftVarValueType
		? getAvailableComparisonSymbols(leftVarValueType)
		: Object.values(ComparisonSymbol);

	// Auto-fill or switch operator when left variable type changes
	useEffect(() => {
		// Check if left variable type has changed
		const hasVarTypeChanged = prevLeftVarValueType.current !== leftVarValueType;

		if (leftVarValueType && hasVarTypeChanged) {
			// Update ref
			prevLeftVarValueType.current = leftVarValueType;

			const isCurrentSymbolAvailable =
				localComparisonSymbol &&
				availableSymbols.includes(localComparisonSymbol);

			// If current operator is not available or empty, auto-switch to first available operator
			if (!isCurrentSymbolAvailable) {
				const firstAvailable = availableSymbols[0];
				if (firstAvailable) {
					setLocalComparisonSymbol(firstAvailable);
					onComparisonSymbolChange(firstAvailable);
				}
			}
		}

		// Also update ref on first render
		if (prevLeftVarValueType.current === undefined && leftVarValueType) {
			prevLeftVarValueType.current = leftVarValueType;

			// If no operator is selected in initial state, set the first one
			if (!localComparisonSymbol && availableSymbols.length > 0) {
				const firstAvailable = availableSymbols[0];
				setLocalComparisonSymbol(firstAvailable);
				onComparisonSymbolChange(firstAvailable);
			}
		}
	}, [
		leftVarValueType,
		availableSymbols,
		localComparisonSymbol,
		onComparisonSymbolChange,
	]);

	const handleComparisonSymbolChange = (value: string) => {
		setLocalComparisonSymbol(value as ComparisonSymbol);
		onComparisonSymbolChange(value as ComparisonSymbol);
	};

	return (
		<Selector
			value={localComparisonSymbol}
			className={className}
			onValueChange={handleComparisonSymbolChange}
		>
			{availableSymbols.map((symbol) => (
				<SelectItem key={symbol} value={symbol}>
					{getComparisonSymbolLabel(symbol, t)}
				</SelectItem>
			))}
		</Selector>
	);
};

export default ComparisonSymbolSelector;
