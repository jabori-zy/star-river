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
	caseIndex?: number; // Display index (1, 2, 3...), used for UI display
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
			{/* Left variable */}
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-start gap-1 px-1 py-1 bg-gray-50 rounded-md border hover:bg-gray-200 transition-colors cursor-default max-w-[200px]">
						{condition.left?.varValueType &&
							(() => {
								const IconComponent = getVariableValueTypeIcon(
									condition.left.varValueType,
								);
								const iconColorClass = getVariableValueTypeIconColor(
									condition.left.varValueType,
								);
								return (
									<IconComponent
										className={`text-sm shrink-0 ${iconColorClass} mt-0.5`}
									/>
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

			{/* Comparison symbol */}
			{condition.comparisonSymbol && (
				<Badge
					variant="secondary"
					className="bg-orange-100 text-orange-700 border-orange-200 text-xs shrink-0 font-bold"
				>
					{getComparisonLabel(condition.comparisonSymbol, t)}
				</Badge>
			)}

			{/* Right variable */}
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-start gap-1 px-1 py-1 bg-gray-50 rounded-md border hover:bg-gray-200 transition-colors cursor-default max-w-[200px]">
						{condition.right?.varValueType &&
							(() => {
								const IconComponent = getVariableValueTypeIcon(
									condition.right.varValueType,
								);
								const iconColorClass = getVariableValueTypeIconColor(
									condition.right.varValueType,
								);
								return (
									<IconComponent
										className={`text-sm shrink-0 ${iconColorClass} mt-0.5`}
									/>
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

			{/* Logical symbol (shown when not the last condition) */}
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

export function IfElseCaseItem({
	caseItem,
	caseIndex,
	handleId,
	handleColor,
}: IfElseCaseItemProps) {
	// Use caseIndex to determine display number and type label, fall back to caseId if not provided
	const displayIndex = caseIndex ?? caseItem.caseId;
	const caseTypeLabel = getCaseTypeLabel(displayIndex);
	const { t } = useTranslation();

	return (
		<div className="relative">
			{/* Title */}
			<div className="flex items-center justify-between gap-2 pr-2 pl-1 relative">
				<span className="text-xs font-bold text-muted-foreground">
					{t("ifElseNode.case")}-{displayIndex}
				</span>
				<span className="text-sm font-bold">{caseTypeLabel}</span>
				{/* Right handle - placed directly on the right side of content box */}
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
						{/* Condition type and ID */}

						{/* Condition list */}
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
