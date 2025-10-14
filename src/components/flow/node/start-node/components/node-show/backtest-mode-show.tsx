import {
	ChevronDown,
	ChevronRight,
	PercentSquare,
	Play,
	TrendingUp,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
	type StrategyBacktestConfig,
} from "@/types/strategy";
import { type CustomVariable, getVariableTypeIcon, getVariableTypeIconColor } from "@/types/variable";


interface BacktestModeShowProps {
	backtestConfig: StrategyBacktestConfig;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({
	backtestConfig,
}) => {
	const [isSettingsOpen, setIsSettingsOpen] = useState(true);
	const [isVariablesOpen, setIsVariablesOpen] = useState(true);

	return (
		<div className="space-y-2">
			{/* 回测设置展示 */}
			<div className="space-y-2">
				<Collapsible open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
					<CollapsibleTrigger className="flex items-center gap-2 w-full">
						{isSettingsOpen ? (
							<ChevronDown className="w-4 h-4" />
						) : (
							<ChevronRight className="w-4 h-4" />
						)}
						<Label className="text-xm font-bold text-muted-foreground">
							回测设置
						</Label>
					</CollapsibleTrigger>
					<CollapsibleContent className="mt-2">
						<div className="flex flex-col gap-2 bg-gray-100 rounded-md p-2">
							{/* 初始资金 */}
							<div className="flex items-center justify-between gap-2 rounded-md ">
								<div className="flex items-center gap-2">
									<Wallet className="w-4 h-4 text-blue-500" />
									<span className="text-sm">初始资金: </span>
								</div>
								<span className="text-sm  font-bold">
									{backtestConfig.initialBalance}
								</span>
							</div>
							{/* 杠杆倍数 */}
							<div className="flex items-center justify-between gap-2 rounded-md ">
								<div className="flex items-center gap-2">
									<TrendingUp className="w-4 h-4 text-orange-500" />
									<span className="text-sm">杠杆倍数: </span>
								</div>
								<span className="text-sm  font-bold">
									{backtestConfig.leverage}x
								</span>
							</div>
							{/* 手续费率 */}
							<div className="flex items-center justify-between gap-2 rounded-md ">
								<div className="flex items-center gap-2">
									<PercentSquare className="w-4 h-4 text-purple-500" />
									<span className="text-sm">手续费率: </span>
								</div>
								<span className="text-sm  font-bold">
									{(backtestConfig.feeRate * 100).toFixed(2)}%
								</span>
							</div>
							{/* 播放速度 */}
							<div className="flex items-center justify-between gap-2 rounded-md ">
								<div className="flex items-center gap-2">
									<Play className="w-4 h-4 text-green-500" />
									<span className="text-sm">播放速度: </span>
								</div>
								<span className="text-sm  font-bold">
									{backtestConfig.playSpeed}x
								</span>
							</div>
						</div>
					</CollapsibleContent>
				</Collapsible>
			</div>

			{/* 变量展示 */}
			<div className="space-y-2">
				{!backtestConfig.customVariables || backtestConfig.customVariables.length === 0 ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-xm font-bold text-muted-foreground">
							变量
						</Label>
						<span className="text-sm text-red-500"> 未配置 </span>
					</div>
				) : (
					<Collapsible open={isVariablesOpen} onOpenChange={setIsVariablesOpen}>
						<CollapsibleTrigger className="flex items-center gap-2 w-full">
							{isVariablesOpen ? (
								<ChevronDown className="w-4 h-4" />
							) : (
								<ChevronRight className="w-4 h-4" />
							)}
							<Label className="text-xm font-bold text-muted-foreground">
								变量
							</Label>
							<Badge className="h-4 min-w-4 rounded-full px-1 font-mono tabular-nums text-xs bg-gray-200 text-gray-500">
								{backtestConfig.customVariables.length}
							</Badge>
						</CollapsibleTrigger>
						<CollapsibleContent className="mt-2">
							<div className="space-y-2">
								{backtestConfig.customVariables.map(
									(variable: CustomVariable, index: number) => {
										const Icon = getVariableTypeIcon(variable.varValueType);
										const iconColor = getVariableTypeIconColor(variable.varValueType);

										return (
											<div
												key={index}
												className="flex flex-col bg-gray-100 p-2 rounded-md"
											>
												<div
													className="flex items-center gap-2"
													title={variable.varName}
												>
													<Icon className={`w-4 h-4 ${iconColor}`} />
													<span className="text-sm">
														{variable.varDisplayName}
														<span className="text-muted-foreground">({variable.varName})</span>
														{" "}= {
															variable.varValueType === "string"
																? `"${variable.varValue}"`
																: variable.varValueType === "boolean"
																? (variable.varValue ? "true" : "false")
																: variable.varValue
														}
													</span>
												</div>
											</div>
										);
									},
								)}
							</div>
						</CollapsibleContent>
					</Collapsible>
				)}
			</div>
		</div>
	);
};

export default BacktestModeShow;
