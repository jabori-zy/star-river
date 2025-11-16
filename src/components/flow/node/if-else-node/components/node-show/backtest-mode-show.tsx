import type { IfElseNodeData } from "@/types/node/if-else-node";
import { ElseCaseItem, IfElseCaseItem } from "../case-handle-item";

interface BacktestModeShowProps {
	id: string;
	data: IfElseNodeData;
	handleColor: string;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({ id, data, handleColor }) => {
	// 获取回测模式配置
	const backtestConfig = data.backtestConfig;

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
		<div className="space-y-2">
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
