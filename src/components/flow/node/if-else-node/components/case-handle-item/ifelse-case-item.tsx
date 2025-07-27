import { Position } from "@xyflow/react";
import BaseHandle from "@/components/flow/base/BaseHandle";
import type {
	CaseItem,
	Condition,
	LogicalSymbol,
} from "@/types/node/if-else-node";
// import { Badge } from "@/components/ui/badge";
import {
	getCaseTypeLabel,
	getComparisonLabel,
	getLogicalLabel,
	getVariableLabel,
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
	return (
		<div className="flex items-center gap-1 flex-wrap">
			{/* 左变量 */}
			<span className="bg-blue-100 px-1 rounded text-xs">
				{getVariableLabel(condition.leftVariable)}
			</span>

			{/* 比较符号 */}
			{condition.comparisonSymbol && (
				<span className="text-orange-600 font-semibold">
					{getComparisonLabel(condition.comparisonSymbol)}
				</span>
			)}

			{/* 右变量 */}
			<span className="bg-green-100 px-1 rounded text-xs">
				{getVariableLabel(condition.rightVariable)}
			</span>

			{/* 逻辑符号 (不是最后一个条件时显示) */}
			{!isLast && logicalSymbol && (
				<span className="text-purple-600 font-semibold mx-1">
					{getLogicalLabel(logicalSymbol)}
				</span>
			)}
		</div>
	);
};

export function IfElseCaseItem({ caseItem, handleId }: IfElseCaseItemProps) {
	const caseTypeLabel = getCaseTypeLabel(caseItem.caseId);

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
								<div className="text-xs text-muted-foreground">未配置条件</div>
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
