import { CircleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { IfElseNodeData } from "@/types/node/if-else-node";
import { ElseCaseItem, IfElseCaseItem } from "../case-handle-item";

interface BacktestModeShowProps {
	id: string;
	data: IfElseNodeData;
	handleColor: string;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({
	id,
	data,
	handleColor,
}) => {
	// Get backtest mode configuration
	const backtestConfig = data.backtestConfig;
	const isNested = data.isNested;
	const { t } = useTranslation();
	// If no configuration or no cases, display prompt message
	if (
		!backtestConfig ||
		!backtestConfig.cases ||
		backtestConfig.cases.length === 0
	) {
		return (
			<div className="text-sm text-muted-foreground p-2 text-center">
				{t("ifElseNode.noBranches")}
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
							{/* This node will only execute when the upper loop is true */}
							<p>{t("ifElseNode.nestedDescription")}</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
			{/* Render all condition cases */}
			{backtestConfig.cases.map((caseItem, index) => (
				<IfElseCaseItem
					key={caseItem.caseId}
					caseItem={caseItem}
					caseIndex={index + 1}
					handleId={`${id}_output_${caseItem.caseId}`}
					handleColor={handleColor}
				/>
			))}

			{/* Fixed ELSE branch */}
			<ElseCaseItem handleId={`${id}_else_output`} handleColor={handleColor} />
		</div>
	);
};

export default BacktestModeShow;
