import { Check, X } from "lucide-react";
import { memo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Strategy } from "@/types/strategy";
import { StrategyControl } from "./strategy-control";

interface HeaderProps {
	strategy: Strategy | undefined;
	setStrategy: (strategy: Strategy) => void;
}

function HeaderComponent({ strategy, setStrategy }: HeaderProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [tempName, setTempName] = useState(strategy?.name || "");

	// 保存策略名称
	const handleSaveStrategyName = () => {
		// setDisplayName(tempName);
		setIsEditing(false);
		// 实际的保存操作由 SaveStrategyButton 处理

		if (strategy) {
			setStrategy({
				...strategy,
				name: tempName,
			});
		}
	};

	const handleCancel = () => {
		if (strategy) {
			setTempName(strategy.name);
			setIsEditing(false);
		}
	};

	return (
		<div className="shadow-sm">
			<div className="flex h-16 items-center px-6 justify-between">
				<div className="flex items-center gap-4">
					{isEditing ? (
						<div className="flex items-center gap-2">
							<Input
								autoFocus
								value={tempName}
								onChange={(e) => setTempName(e.target.value)}
								className="h-8 w-[300px] text-lg font-semibold"
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSaveStrategyName();
									if (e.key === "Escape") handleCancel();
								}}
							/>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleSaveStrategyName}
								className="h-8 w-8 p-0 border border-border/50 hover:border-green-500 hover:text-green-500 transition-colors"
							>
								<Check className="h-4 w-4 text-green-500" />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleCancel}
								className="h-8 w-8 p-0 border border-border/50 hover:border-red-500 hover:text-red-500 transition-colors"
							>
								<X className="h-4 w-4 text-red-500" />
							</Button>
						</div>
					) : (
						<div className="flex items-center gap-3">
							<div
								onClick={() => setIsEditing(true)}
								className="text-lg font-semibold hover:text-primary cursor-pointer px-3 py-1.5 rounded hover:bg-accent transition-colors"
							>
								{strategy?.name}
							</div>
							<Badge variant="secondary" className="bg-primary/10 text-primary">
								编辑中
							</Badge>
						</div>
					)}
				</div>

				<div className="flex items-center gap-3">
					{strategy && (
						<StrategyControl strategy={strategy} setStrategy={setStrategy} />
					)}
				</div>
			</div>
		</div>
	);
}

// 使用 memo 包装组件，允许 strategy 名称或子组件变化时重新渲染
export const Header = memo(HeaderComponent, (prevProps, nextProps) => {
	// 如果 strategy 名称变化，需要重新渲染
	const strategyNameChanged =
		prevProps.strategy?.name !== nextProps.strategy?.name;

	// 如果 children 变化（例如 tab 变化），需要重新渲染
	// 由于 children 可能是复杂的 React 节点，无法直接比较，我们让它始终触发重新渲染

	// 返回 true 表示相等（不需要重新渲染），返回 false 表示需要重新渲染
	// 如果 strategy 名称没有变化且没有 children，则不需要重新渲染
	return !strategyNameChanged;
});
