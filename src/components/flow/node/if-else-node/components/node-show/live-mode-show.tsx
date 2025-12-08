import type { IfElseNodeData } from "@/types/node/if-else-node";
import { ElseCaseItem, IfElseCaseItem } from "../case-handle-item";

interface LiveModeShowProps {
	id: string;
	data: IfElseNodeData;
}

const LiveModeShow: React.FC<LiveModeShowProps> = ({ id, data }) => {
	// Get live mode configuration
	const liveConfig = data.liveConfig;

	// If no configuration or no cases, display a message
	if (!liveConfig || !liveConfig.cases || liveConfig.cases.length === 0) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				暂无条件配置
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* Render all condition cases */}
			{liveConfig.cases.map((caseItem) => (
				<IfElseCaseItem
					key={caseItem.caseId}
					caseItem={caseItem}
					handleId={`${id}-case-${caseItem.caseId}`}
				/>
			))}

			{/* Fixed ELSE branch */}
			<ElseCaseItem handleId={`${id}-else`} />
		</div>
	);
};

export default LiveModeShow;
