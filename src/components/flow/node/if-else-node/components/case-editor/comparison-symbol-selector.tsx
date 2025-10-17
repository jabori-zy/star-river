import { useEffect, useRef, useState } from "react";
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

	// 使用 ref 跟踪上一次的左变量类型
	const prevLeftVarValueType = useRef<VariableValueType | null | undefined>(
		undefined,
	);

	// 当传入的comparisonSymbol发生变化时，同步更新本地状态
	useEffect(() => {
		setLocalComparisonSymbol(comparisonSymbol);
	}, [comparisonSymbol]);

	// 根据左变量类型获取可用的比较运算符
	const availableSymbols = leftVarValueType
		? getAvailableComparisonSymbols(leftVarValueType)
		: Object.values(ComparisonSymbol);

	// 当左变量类型改变时，自动填充或切换运算符
	useEffect(() => {
		// 检查左变量类型是否发生了变化
		const hasVarTypeChanged = prevLeftVarValueType.current !== leftVarValueType;

		if (leftVarValueType && hasVarTypeChanged) {
			// 更新 ref
			prevLeftVarValueType.current = leftVarValueType;

			const isCurrentSymbolAvailable =
				localComparisonSymbol &&
				availableSymbols.includes(localComparisonSymbol);

			// 如果当前运算符不可用或为空，自动切换到第一个可用运算符
			if (!isCurrentSymbolAvailable) {
				const firstAvailable = availableSymbols[0];
				if (firstAvailable) {
					setLocalComparisonSymbol(firstAvailable);
					onComparisonSymbolChange(firstAvailable);
				}
			}
		}

		// 首次渲染时也更新 ref
		if (prevLeftVarValueType.current === undefined && leftVarValueType) {
			prevLeftVarValueType.current = leftVarValueType;

			// 如果初始状态没有选中的运算符，设置第一个
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
					{getComparisonSymbolLabel(symbol)}
				</SelectItem>
			))}
		</Selector>
	);
};

export default ComparisonSymbolSelector;
