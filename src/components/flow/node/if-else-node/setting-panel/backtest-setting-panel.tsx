import { useNodeConnections } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import { ReactSortable } from "react-sortablejs";
import type { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import { useBacktestConfig } from "@/hooks/node-config/if-else-node";
import { type CaseItem, LogicalSymbol } from "@/types/node/if-else-node";
import { TradeMode } from "@/types/strategy";
import CaseEditor from "../components/case-editor";

const IfElseNodeBacktestSettingPanel: React.FC<SettingProps> = ({ id }) => {
	const { t } = useTranslation();

	// Use new version hook to manage backtest configuration
	const { backtestConfig, updateCase, removeCase, updateCases } =
		useBacktestConfig({ id });

	const { getConnectedNodeVariables } = useStrategyWorkflow();

	// Get all connections
	const connections = useNodeConnections({ id, handleType: "target" });

	const variables = getConnectedNodeVariables(connections, TradeMode.BACKTEST);
	// console.log("variables", variables);

	// Add ELIF branch
	const handleAddElif = () => {
		const cases = backtestConfig?.cases;
		if (!cases || cases.length === 0) {
			// If no case exists, create first case with ID 1
			updateCase({
				caseId: 1,
				outputHandleId: `${id}_output_1`,
				logicalSymbol: LogicalSymbol.AND,
				conditions: [],
			});
			return;
		}

		// Find maximum caseId, use maxId + 1 when adding new
		const maxCaseId = Math.max(...cases.map((c) => c.caseId));
		const newCaseId = maxCaseId + 1;

		const newCaseItem: CaseItem = {
			caseId: newCaseId,
			outputHandleId: `${id}_output_${newCaseId}`,
			logicalSymbol: LogicalSymbol.AND,
			conditions: [],
		};
		updateCase(newCaseItem);
	};

	// Remove case
	const handleRemoveCase = (caseId: number) => {
		console.log("Remove case", caseId);
		removeCase(caseId);
		// Note: No need to reset caseId, keep ID unchanged
	};

	// Handle drag and drop sorting
	const handleSortCases = (newList: CaseItem[]) => {
		// Only keep fields that CaseItem should have, filter out internal fields added by ReactSortable
		// Keep original caseId unchanged, only change order
		const cleanedCases = newList.map((c) => ({
			caseId: c.caseId, // Keep original ID unchanged
			logicalSymbol: c.logicalSymbol,
			conditions: c.conditions,
			outputHandleId: c.outputHandleId, // Keep original outputHandleId
		}));

		// Update local state
		updateCases(cleanedCases);
	};

	// Cases with id prepared for ReactSortable
	const casesWithId = backtestConfig?.cases?.map((caseItem) => ({
		...caseItem,
		id: caseItem.caseId,
	}));

	return (
		<div className="h-full overflow-y-auto bg-white">
			<div className="flex flex-col gap-2 p-2">
				{/* If cases is empty, pass an empty case */}
				{!backtestConfig?.cases || backtestConfig?.cases.length === 0 ? (
					<CaseEditor
						variableItemList={variables}
						caseItem={{
							caseId: 1,
							outputHandleId: `${id}_output_1`,
							logicalSymbol: LogicalSymbol.AND,
							conditions: [],
						}}
						onCaseChange={updateCase}
						onCaseRemove={handleRemoveCase}
					/>
				) : (
					<ReactSortable
						list={casesWithId}
						setList={handleSortCases}
						handle=".drag-handle"
						animation={200}
						className="flex flex-col gap-2"
					>
						{casesWithId?.map((caseItem, index) => (
							<div key={caseItem.caseId}>
								<CaseEditor
									variableItemList={variables}
									caseItem={caseItem}
									caseIndex={index + 1}
									onCaseChange={updateCase}
									onCaseRemove={handleRemoveCase}
								/>
							</div>
						))}
					</ReactSortable>
				)}
				{/* Add branch button */}
				<div className="px-2">
					<Button
						variant="outline"
						className="w-full h-8 border-dashed hover:font-bold"
						onClick={handleAddElif}
					>
						<span className="text-xs">+ELIF</span>
					</Button>
				</div>
				{/* Branch */}
				<Separator orientation="horizontal" className="h-px bg-gray-200" />
				<div className="flex flex-col gap-2 p-2">
					<h3 className="text-sm font-bold">ELSE</h3>
					<div className="text-xs text-muted-foreground">
						{t("ifElseNode.elseDescription")}
					</div>
				</div>
			</div>
		</div>
	);
};

export default IfElseNodeBacktestSettingPanel;
