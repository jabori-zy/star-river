import type React from "react";
import type { VariableNodeData } from "@/types/node/variable-node";
import { VariableHandleItem } from "../variable-handle-item/index";
import { useTranslation } from "react-i18next";

interface BacktestModeShowProps {
	id: string;
	data: VariableNodeData;
	handleColor: string;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({
	id,
	data,
	handleColor,
}) => {
	const { t } = useTranslation();
	// Get backtest mode configuration
	const backtestConfig = data.backtestConfig;

	// If no config or no variable configs, show hint message
	if (
		!backtestConfig ||
		!backtestConfig.variableConfigs ||
		backtestConfig.variableConfigs.length === 0
	) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				{t("variableNode.noVariableConfig")}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{/* Render all variable configs */}
			{backtestConfig.variableConfigs.map((variableConfig) => (
				<VariableHandleItem
					key={variableConfig.configId}
					id={id}
					variableConfig={variableConfig}
					handleColor={handleColor}
				/>
			))}
		</div>
	);
};

export default BacktestModeShow;
