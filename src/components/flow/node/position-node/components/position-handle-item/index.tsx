import { Position } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import BaseHandle from "@/components/flow/base/BaseHandle";
import {
	type PositionOperationConfig,
	getPositionOperationLabel,
	shouldSelectSymbol,
} from "@/types/node/position-node";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GitBranch, Hash, Settings2, Tag } from "lucide-react";

interface PositionHandleItemProps {
	id: string;
	operationConfig: PositionOperationConfig;
	handleColor: string;
}

export function PositionHandleItem({
	id,
	operationConfig,
	handleColor,
}: PositionHandleItemProps) {
	const { t } = useTranslation();

	const operationLabel = getPositionOperationLabel(
		operationConfig.positionOperation,
		t,
	);

	const showSymbol = shouldSelectSymbol(operationConfig.positionOperation, t);

	return (
		<div className="relative">
			{/* Title */}
			<div className="flex items-center justify-between gap-2 pr-2 pl-1 mb-1 relative">
				<span className="text-xs font-bold text-muted-foreground">
					{t("positionNode.operationConfigLabel")}-{operationConfig.configId}
				</span>
				{/* Input handle */}
				<BaseHandle
					id={`${id}_input_${operationConfig.configId}`}
					type="target"
					position={Position.Left}
					handleColor={handleColor}
					className="-translate-x-2 -translate-y-3"
				/>
			</div>

			<div className="flex flex-row justify-between gap-2">
				{/* Operation config */}
				<div className="flex flex-col gap-2 flex-1 p-2 bg-slate-50/50 rounded-lg border border-slate-200 transition-colors">
					{/* Operation Name */}
					<div className="flex items-center gap-1.5">
						<Tag className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
						<div
							className="font-medium text-sm truncate text-slate-700"
							title={operationConfig.operationName}
						>
							{operationConfig.operationName ||
								t("positionNode.operationName.placeholder")}
						</div>
					</div>

					<div className="flex flex-col gap-1.5 pl-0.5">
						{/* Trigger Condition */}
						<div className="flex items-center justify-between gap-2 text-xs">
							<div className="flex items-center gap-1.5 text-slate-500">
								<GitBranch className="w-3 h-3 text-indigo-500" />
								<span>{t("positionNode.triggerCondition")}</span>
							</div>
							<Badge
								variant="outline"
								className={cn(
									"text-[10px] px-1.5 py-0 h-5 font-normal max-w-[120px] break-words text-right",
									operationConfig.triggerConfig
										? "bg-white text-slate-600"
										: "bg-red-50 text-red-500 border-red-200"
								)}
							>
								{operationConfig.triggerConfig
									? operationConfig.triggerConfig.triggerType === "case"
										? `${operationConfig.triggerConfig.fromNodeName}/${t("positionNode.case")}${operationConfig.triggerConfig.caseId}`
										: `${operationConfig.triggerConfig.fromNodeName}/Else`
									: t("positionNode.notConfigured")}
							</Badge>
						</div>

						{/* Type */}
						<div className="flex items-center justify-between gap-2 text-xs">
							<div className="flex items-center gap-1.5 text-slate-500">
								<Settings2 className="w-3 h-3 text-blue-500" />
								<span>{t("positionNode.operationType.label")}</span>
							</div>
							<Badge
								variant="secondary"
								className="text-[10px] px-1.5 py-0 h-5 font-normal whitespace-nowrap bg-white border-slate-200 text-slate-700"
							>
								{operationLabel}
							</Badge>
						</div>

						{/* Symbol - only show when needed */}
						{showSymbol && (
							<div className="flex items-center justify-between gap-2 text-xs">
								<div className="flex items-center gap-1.5 text-slate-500">
									<Hash className="w-3 h-3 text-orange-500" />
									<span>{t("positionNode.symbol.label")}</span>
								</div>
								<Badge
									variant="outline"
									className={cn(
										"text-[10px] px-1.5 py-0 h-5 font-normal whitespace-nowrap",
										operationConfig.symbol
											? "bg-white text-slate-600"
											: "bg-red-50 text-red-500 border-red-200"
									)}
								>
									{operationConfig.symbol ||
										t("positionNode.notConfigured")}
								</Badge>
							</div>
						)}
					</div>
				</div>

				{/* Output labels */}
				<div className="pt-2 space-y-6 text-right">
					<div className="text-xs text-green-500 font-medium">
						{t("common.success")}
					</div>
					<div className="text-xs text-red-500 font-medium">
						{t("common.failed")}
					</div>
				</div>
			</div>
			{/* Output handles */}
			<div className="flex flex-row gap-1">
				<BaseHandle
					id={`${id}_success_output_${operationConfig.configId}`}
					type="source"
					position={Position.Right}
					handleColor="#65a30d"
					className="translate-x-2 translate-y-4"
				/>
				<BaseHandle
					id={`${id}_failed_output_${operationConfig.configId}`}
					type="source"
					position={Position.Right}
					handleColor="#dc2626"
					className="translate-x-2 translate-y-14"
				/>
			</div>
		</div>
	);
}
