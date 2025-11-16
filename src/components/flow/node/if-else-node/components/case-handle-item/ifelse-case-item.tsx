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
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
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
	caseIndex?: number; // 显示用的顺序索引（1, 2, 3...），用于 UI 显示
	handleId: string;
	handleColor: string;
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
		<div className="flex items-center gap-1 flex-wrap">
		{/* 左变量 */}
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="flex items-start gap-1 px-1 py-1 bg-gray-50 rounded-md border hover:bg-gray-200 transition-colors cursor-default max-w-[200px]">
					{condition.left?.varValueType && (() => {
						const IconComponent = getVariableValueTypeIcon(
							condition.left.varValueType,
						);
						const iconColorClass = getVariableValueTypeIconColor(
							condition.left.varValueType,
						);
						return (
							<IconComponent className={`text-sm shrink-0 ${iconColorClass} mt-0.5`} />
						);
					})()}
					<span className="text-xs font-medium text-gray-900 break-words break-all">
						{getVariableLabel(condition.left, nodes, t)}
					</span>
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p>{getVariableTooltipLabel(condition.left, t)}</p>
			</TooltipContent>
		</Tooltip>

		{/* 比较符号 */}
		{condition.comparisonSymbol && (
			<Badge
				variant="secondary"
				className="bg-orange-100 text-orange-700 border-orange-200 text-xs shrink-0 font-bold"
			>
				{getComparisonLabel(condition.comparisonSymbol, t)}
			</Badge>

		)}

		{/* 右变量 */}
		<Tooltip>
			<TooltipTrigger asChild>
				<div className="flex items-start gap-1 px-1 py-1 bg-gray-50 rounded-md border hover:bg-gray-200 transition-colors cursor-default max-w-[200px]">
					{condition.right?.varValueType && (() => {
						const IconComponent = getVariableValueTypeIcon(
							condition.right.varValueType,
						);
						const iconColorClass = getVariableValueTypeIconColor(
							condition.right.varValueType,
						);
						return (
							<IconComponent className={`text-sm shrink-0 ${iconColorClass} mt-0.5`} />
						);
					})()}
					<span className="text-xs font-medium text-gray-900 break-words break-all">
						{getVariableLabel(condition.right, nodes, t)}
					</span>
				</div>
		</TooltipTrigger>
		<TooltipContent>
			<p>{getVariableTooltipLabel(condition.right, t)}</p>
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

export function IfElseCaseItem({ caseItem, caseIndex, handleId, handleColor }: IfElseCaseItemProps) {
	// 使用 caseIndex 来确定显示的编号和类型标签，如果没有则回退到 caseId
	const displayIndex = caseIndex ?? caseItem.caseId;
	const caseTypeLabel = getCaseTypeLabel(displayIndex);
	const { t } = useTranslation();

	return (
		<div className="relative">
			{/* 标题 */}
			<div className="flex items-center justify-between gap-2 pr-2 pl-1 relative">
				<span className="text-xs font-bold text-muted-foreground">
					Case{displayIndex}
				</span>
				<span className="text-sm font-bold">{caseTypeLabel}</span>
				{/* 右侧连接点 - 直接放在内容框右侧 */}
				<BaseHandle
					id={handleId}
					type="source"
					position={Position.Right}
					handleColor={handleColor}
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
									{t("ifElseNode.noConditions")}
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
