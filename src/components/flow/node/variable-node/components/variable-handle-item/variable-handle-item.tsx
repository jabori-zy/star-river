import { Position } from "@xyflow/react";
import { Clock, Filter } from "lucide-react";
import React from "react";
import BaseHandle from "@/components/flow/base/BaseHandle";
import {
	GetVariableType,
	type VariableConfig,
} from "@/types/node/variable-node";
import {
	formatSymbolDisplay,
	getTimerConfigDisplay,
	getVariableLabel,
} from "./utils";

interface VariableHandleItemProps {
	id: string; // 节点id
	variableConfig: VariableConfig;
}

export function VariableHandleItem({
	id,
	variableConfig,
}: VariableHandleItemProps) {
	return (
		<div className="relative">
			{/* 标题 */}
			<div className="flex items-center justify-between gap-2 pr-2 pl-1 mb-1 relative ">
				<span className="text-xs font-bold text-muted-foreground">
					变量{variableConfig.configId}
				</span>
				{/* 入口 */}
				{variableConfig.getVariableType === GetVariableType.CONDITION && (
					<BaseHandle
						id={`${id}_input_${variableConfig.configId}`}
						type="target"
						position={Position.Left}
						handleColor="!bg-black"
						className="-translate-x-2 -translate-y-3"
					/>
				)}
			</div>

			<div className="flex flex-col justify-between px-2 py-2 bg-gray-100 rounded-md relative">
				<div className="flex items-center gap-2 mb-1">
					<span className="text-sm font-medium truncate">
						{variableConfig.variableName}
					</span>
					{variableConfig.getVariableType === GetVariableType.TIMER && (
						<Clock className="h-3 w-3 text-blue-500" />
					)}
					{variableConfig.getVariableType === GetVariableType.CONDITION && (
						<Filter className="h-3 w-3 text-orange-500" />
					)}
				</div>

				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<span>{formatSymbolDisplay(variableConfig.symbol)}</span>
					<span>•</span>
					<span>{getVariableLabel(variableConfig.variable)}</span>
					{variableConfig.getVariableType === GetVariableType.TIMER &&
						variableConfig.timerConfig && (
							<>
								<span>•</span>
								<span>{getTimerConfigDisplay(variableConfig.timerConfig)}</span>
							</>
						)}
				</div>
			</div>
			<BaseHandle
				id={`${id}_output_${variableConfig.configId}`}
				type="source"
				position={Position.Right}
				handleColor="!bg-black"
				className="translate-x-2 translate-y-7"
			/>
		</div>
	);
}
