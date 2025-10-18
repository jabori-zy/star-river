import { Position, useReactFlow } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import BaseHandle from "@/components/flow/base/BaseHandle";
import { Badge } from "@/components/ui/badge";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type {
	CaseItem,
	Condition,
	LogicalSymbol,
} from "@/types/node/if-else-node";
import {
	getVariableTypeIcon,
	getVariableTypeIconColor,
} from "@/types/variable";
import {
	getCaseTypeLabel,
	getComparisonLabel,
	getLogicalLabel,
	getVariableLabel,
	getVariableTooltipLabel,
} from "./utils";

interface IfElseCaseItemProps {
	caseItem: CaseItem;
	handleId: string;
}

const ConditionItem = ({
	condition,
	isLast,
	logicalSymbol,
}: {
	condition: Condition;
	isLast: boolean;
	logicalSymbol: LogicalSymbol | null;
}) => {
	const { getNodes } = useReactFlow();
	const nodes = getNodes();
	const { t } = useTranslation();

	return (
		<div className="flex items-center gap-1 flex-nowrap whitespace-nowrap">
		{/* 左变量 */}
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="flex items-center gap-1 px-1 py-1 bg-gray-50 rounded-md border hover:bg-gray-200 transition-colors cursor-default min-w-0">
					{condition.leftVariable?.varValueType && (() => {
						const IconComponent = getVariableTypeIcon(
							condition.leftVariable.varValueType,
						);
						const iconColorClass = getVariableTypeIconColor(
							condition.leftVariable.varValueType,
						);
						return (
							<IconComponent className={`text-sm shrink-0 ${iconColorClass}`} />
						);
					})()}
					<span className="text-xs font-medium text-gray-900 truncate">
						{getVariableLabel(condition.leftVariable, nodes, t)}
					</span>
				</div>
		</TooltipTrigger>
		<TooltipContent>
			<p>{getVariableTooltipLabel(condition.leftVariable, t)}</p>
		</TooltipContent>
	</Tooltip>

		{/* 比较符号 */}
		{condition.comparisonSymbol && (
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center justify-center min-w-[20px] min-h-[20px] max-w-[60px] px-1.5 py-1 bg-orange-100 rounded-full shrink overflow-hidden">
						<span className="text-orange-600 font-bold text-xs truncate">
							{getComparisonLabel(condition.comparisonSymbol)}
						</span>
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<p>{getComparisonLabel(condition.comparisonSymbol)}</p>
				</TooltipContent>
			</Tooltip>
		)}

		{/* 右变量 */}
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="flex items-center gap-1 px-1 py-1 bg-gray-50 rounded-md border hover:bg-gray-200 transition-colors cursor-default min-w-0">
					{condition.rightVariable?.varValueType && (() => {
						const IconComponent = getVariableTypeIcon(
							condition.rightVariable.varValueType,
						);
						const iconColorClass = getVariableTypeIconColor(
							condition.rightVariable.varValueType,
						);
						return (
							<IconComponent className={`text-sm shrink-0 ${iconColorClass}`} />
						);
					})()}
					<span className="text-xs font-medium text-gray-900 truncate">
						{getVariableLabel(condition.rightVariable, nodes, t)}
					</span>
				</div>
		</TooltipTrigger>
		<TooltipContent>
			<p>{getVariableTooltipLabel(condition.rightVariable, t)}</p>
		</TooltipContent>
	</Tooltip>

			{/* 逻辑符号 (不是最后一个条件时显示) */}
			{!isLast && logicalSymbol && (
				<Badge
					variant="secondary"
					className="bg-purple-100 text-purple-700 border-purple-200 text-xs shrink-0"
				>
					{getLogicalLabel(logicalSymbol)}
				</Badge>
			)}
		</div>
	);
};

export function IfElseCaseItem({ caseItem, handleId }: IfElseCaseItemProps) {
	const caseTypeLabel = getCaseTypeLabel(caseItem.caseId);
	const { t } = useTranslation();

	return (
		<div className="relative">
			{/* 标题 */}
			<div className="flex items-center justify-between gap-2 pr-2 pl-1 relative">
				<span className="text-xs font-bold text-muted-foreground">
					Case{caseItem.caseId}
				</span>
				<span className="text-sm font-bold">{caseTypeLabel}</span>
				{/* 右侧连接点 - 直接放在内容框右侧 */}
				<BaseHandle
					id={handleId}
					type="source"
					position={Position.Right}
					handleColor="!bg-blue-400"
					className="translate-x-2 -translate-y-2.5"
				/>
			</div>
			<div className="flex items-center justify-between px-2 py-2 bg-gray-100 rounded-md relative mb-2">
				<div className="flex items-center gap-2 justify-between w-full">
					<div className="flex flex-col gap-1 flex-1">
						{/* 条件类型和ID */}

						{/* 条件列表 */}
						<div className="text-xs text-muted-foreground space-y-1">
							{caseItem.conditions.length === 0 ? (
								<div className="text-xs text-muted-foreground">
									{t("IfElseNode.noConditions")}
								</div>
							) : (
								caseItem.conditions.map((condition, index) => (
									<ConditionItem
										key={condition.conditionId}
										condition={condition}
										isLast={index === caseItem.conditions.length - 1}
										logicalSymbol={caseItem.logicalSymbol}
									/>
								))
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
