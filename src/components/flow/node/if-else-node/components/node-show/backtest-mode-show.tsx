import type { IfElseNodeData } from "@/types/node/if-else-node";
import { ElseCaseItem, IfElseCaseItem } from "../case-handle-item";
import { CircleAlert } from "lucide-react";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import { useTranslation } from "react-i18next";
interface BacktestModeShowProps {
	id: string;
	data: IfElseNodeData;
	handleColor: string;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({ id, data, handleColor }) => {
	// 获取回测模式配置
	const backtestConfig = data.backtestConfig;
	const isNested = data.isNested;
	const { t } = useTranslation();
	// 如果没有配置或者没有cases，显示提示信息
	if (
		!backtestConfig ||
		!backtestConfig.cases ||
		backtestConfig.cases.length === 0
	) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				暂无条件配置
			</div>
		);
	}

	return (
		<div className="space-y-1">
			{isNested && (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<div className="flex items-center text-xs text-muted-foreground">
								<CircleAlert className="w-4 h-4 text-yellow-500" />
								<span className="ml-2">{t("ifElseNode.nested")}</span>
							</div>
						</TooltipTrigger>
					<TooltipContent>
						{/* 当上层循环为true时，该节点才会执行 */}
						<p>{t("ifElseNode.nestedDescription")}</p>
					</TooltipContent>
				</Tooltip>
				</TooltipProvider>
			)}
			{/* 渲染所有的条件case */}
			{backtestConfig.cases.map((caseItem, index) => (
				<IfElseCaseItem
					key={caseItem.caseId}
					caseItem={caseItem}
					caseIndex={index + 1}
					handleId={`${id}_output_${caseItem.caseId}`}
					handleColor={handleColor}
				/>
			))}

			{/* 固定的ELSE分支 */}
			<ElseCaseItem handleId={`${id}_else_output`} handleColor={handleColor} />
		</div>
	);
};

export default BacktestModeShow;
