import { useTranslation } from "react-i18next";
import type { PositionNodeData } from "@/types/node/position-node";
import { PositionHandleItem } from "../position-handle-item";

interface BacktestModeShowProps {
	id: string;
	data: PositionNodeData;
	handleColor: string;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({
	id,
	data,
	handleColor,
}) => {
	// Get backtest mode config
	const backtestConfig = data.backtestConfig;
	const { t } = useTranslation();
	// If no config or no position operations, show hint message
	if (
		!backtestConfig ||
		!backtestConfig.positionOperations ||
		backtestConfig.positionOperations.length === 0
	) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				{t("positionNode.noPositionOperationHint")}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* Render all position operations */}
			{backtestConfig.positionOperations.map((operationConfig) => (
				<PositionHandleItem
					key={operationConfig.configId}
					id={id}
					operationConfig={operationConfig}
					handleColor={handleColor}
				/>
			))}
		</div>
	);
};

export default BacktestModeShow;
