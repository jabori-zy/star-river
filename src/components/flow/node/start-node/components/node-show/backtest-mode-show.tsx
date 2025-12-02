import {
	ChevronDown,
	ChevronRight,
	PercentSquare,
	Play,
	TrendingUp,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StrategyBacktestConfig } from "@/types/strategy";
import {
	type CustomVariable,
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
} from "@/types/variable";
import { formatVariableValue } from "../utils";

interface BacktestModeShowProps {
	backtestConfig: StrategyBacktestConfig;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({
	backtestConfig,
}) => {
	const [isSettingsOpen, setIsSettingsOpen] = useState(true);
	const [isVariablesOpen, setIsVariablesOpen] = useState(true);
	const { t } = useTranslation();
	return (
		<div className="space-y-2">
			{/* 数据源展示 */}
			{backtestConfig.exchangeModeConfig?.selectedAccounts &&
				backtestConfig.exchangeModeConfig.selectedAccounts.length > 0 && (
					<div className="space-y-2">
						<div>
							<Label className="text-xm font-bold text-muted-foreground">
								{t("startNode.dataSource")}
							</Label>
							<div className="flex flex-col gap-2 mt-2">
								{backtestConfig.exchangeModeConfig.selectedAccounts.map(
									(account, index) => (
										<div
											key={index}
											className="flex items-center gap-2 bg-gray-100 p-2 rounded-md"
										>
											<span className="text-sm">
												{account.accountName} ({account.exchange})
											</span>
										</div>
									),
								)}
							</div>
						</div>
					</div>
				)}

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
							{t("startNode.backtestSettings")}
						</Label>
					</CollapsibleTrigger>
					<CollapsibleContent className="mt-2">
						<div className="flex flex-col gap-2 bg-gray-100 rounded-md p-2">
							{/* 初始资金 */}
							<div className="flex items-center justify-between gap-2 rounded-md ">
								<div className="flex items-center gap-2">
									<Wallet className="w-4 h-4 text-blue-500" />
									<span className="text-sm">
										{t("startNode.initialBalance")}:{" "}
									</span>
								</div>
								<span className="text-sm  font-bold">
									{backtestConfig.initialBalance}
								</span>
							</div>
							{/* 杠杆倍数 */}
							<div className="flex items-center justify-between gap-2 rounded-md ">
								<div className="flex items-center gap-2">
									<TrendingUp className="w-4 h-4 text-orange-500" />
									<span className="text-sm">{t("startNode.leverage")}: </span>
								</div>
								<span className="text-sm  font-bold">
									{backtestConfig.leverage}x
								</span>
							</div>
							{/* 手续费率 */}
							<div className="flex items-center justify-between gap-2 rounded-md ">
								<div className="flex items-center gap-2">
									<PercentSquare className="w-4 h-4 text-purple-500" />
									<span className="text-sm">{t("startNode.feeRate")}: </span>
								</div>
								<span className="text-sm  font-bold">
									{(backtestConfig.feeRate * 100).toFixed(2)}%
								</span>
							</div>
							{/* 播放速度 */}
							<div className="flex items-center justify-between gap-2 rounded-md ">
								<div className="flex items-center gap-2">
									<Play className="w-4 h-4 text-green-500" />
									<span className="text-sm">{t("startNode.playSpeed")}: </span>
								</div>
								<span className="text-sm  font-bold">
									{backtestConfig.playSpeed}x
								</span>
							</div>
						</div>
					</CollapsibleContent>
				</Collapsible>
			</div>

			{/* 回测时间范围展示 */}
			{backtestConfig.exchangeModeConfig?.timeRange && (
				<div className="space-y-2">
					<Collapsible defaultOpen={true}>
						<CollapsibleTrigger className="flex items-center gap-2 w-full">
							<ChevronDown className="w-4 h-4" />
							<Label className="text-xm font-bold text-muted-foreground">
								{t("startNode.timeRange")}
							</Label>
						</CollapsibleTrigger>
						<CollapsibleContent className="mt-2">
							<div className="flex flex-col gap-2 bg-gray-100 rounded-md p-2">
								<div className="flex flex-col gap-1 text-sm">
									<div className="flex items-center gap-2">
										<span className="text-gray-600">
											{t("startNode.startTime")}:
										</span>
										<span className="font-medium">
											{backtestConfig.exchangeModeConfig.timeRange.startDate}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-gray-600">
											{t("startNode.endTime")}:
										</span>
										<span className="font-medium">
											{backtestConfig.exchangeModeConfig.timeRange.endDate}
										</span>
									</div>
								</div>
							</div>
						</CollapsibleContent>
					</Collapsible>
				</div>
			)}

			{/* 变量展示 */}
			<div className="space-y-2">
				{!backtestConfig.customVariables ||
				backtestConfig.customVariables.length === 0 ? (
					<div className="flex items-center justify-between gap-2 rounded-md">
						<Label className="text-xm font-bold text-muted-foreground">
							{t("startNode.customVariables")}
						</Label>
						<span className="text-sm text-red-500">
							{" "}
							{t("startNode.noVariable")}{" "}
						</span>
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
								{t("startNode.customVariables")}
							</Label>
							<Badge className="h-4 min-w-4 rounded-full px-1 font-mono tabular-nums text-xs bg-gray-200 text-gray-500">
								{backtestConfig.customVariables.length}
							</Badge>
						</CollapsibleTrigger>
						<CollapsibleContent className="mt-2">
							<div className="space-y-2">
								{backtestConfig.customVariables.map(
									(variable: CustomVariable, index: number) => {
										const Icon = getVariableValueTypeIcon(
											variable.varValueType,
										);
										const iconColor = getVariableValueTypeIconColor(
											variable.varValueType,
										);
										const formattedInitialValue = formatVariableValue(
											variable.initialValue,
											variable.varValueType,
										);
										const formattedCurrentValue = formatVariableValue(
											variable.varValue,
											variable.varValueType,
										);

										return (
											<div
												key={index}
												className="flex flex-col bg-gray-100 p-2 rounded-md gap-1"
											>
												<TooltipProvider delayDuration={300}>
													<Tooltip>
														<TooltipTrigger asChild>
															<div className="flex items-center gap-2 cursor-pointer">
																<Icon className={`w-4 h-4 ${iconColor}`} />
																<span className="text-sm font-semibold">
																	{variable.varDisplayName}
																</span>
															</div>
														</TooltipTrigger>
														<TooltipContent side="top" align="start">
															<p className="text-xs">{variable.varName}</p>
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
												<div className="flex items-start gap-2 text-xs text-gray-600">
													<div className="w-4 shrink-0" />
													<div className="flex flex-wrap items-start gap-x-4 gap-y-1 min-w-0 flex-1">
														<div className="flex items-start gap-1">
															<span className="shrink-0">
																{t("startNode.initialValue")}:
															</span>
															<span className="font-medium break-all">
																{formattedInitialValue}
															</span>
														</div>
														<div className="flex items-start gap-1">
															<span className="shrink-0">
																{t("startNode.currentValue")}:
															</span>
															<span className="font-medium break-all">
																{formattedCurrentValue}
															</span>
														</div>
													</div>
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
