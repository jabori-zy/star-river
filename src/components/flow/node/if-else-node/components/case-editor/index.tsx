import { GripVertical, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import {
	type CaseItem,
	ComparisonSymbol,
	type Condition,
	LogicalSymbol,
	VarType,
} from "@/types/node/if-else-node";
import { VariableValueType } from "@/types/variable";
import ConditionSetting from "./condition-setting";

interface CaseEditorProps {
	variableItemList: VariableItem[]; // Variable list
	caseItem: CaseItem; // Condition
	caseIndex?: number; // Display index (1, 2, 3...), used for UI display
	onCaseChange: (caseItem: CaseItem) => void;
	onCaseRemove: (caseId: number) => void;
}

const CaseEditor: React.FC<CaseEditorProps> = ({
	variableItemList,
	caseItem,
	caseIndex,
	onCaseChange,
	onCaseRemove,
}) => {
	// Local condition state for editing, to avoid affecting other branches
	const [localCaseItem, setLocalCaseItem] = useState<CaseItem>(caseItem);
	const { t } = useTranslation();
	// Update local state when caseItem prop changes
	useEffect(() => {
		setLocalCaseItem(caseItem);
	}, [caseItem]);

	// Add condition
	const handleAddCondition = () => {
		const newCondition: Condition = {
			conditionId: localCaseItem.conditions.length + 1, // List length + 1
			left: null,
			comparisonSymbol: ComparisonSymbol.equal,
			right: {
				varType: VarType.variable,
				nodeId: null,
				nodeType: null,
				nodeName: null,
				outputHandleId: null,
				varConfigId: null,
				varName: null,
				varDisplayName: null,
				varValueType: VariableValueType.NUMBER,
			},
		};
		const updatedCaseItem = {
			...localCaseItem,
			conditions: [...localCaseItem.conditions, newCondition],
		};
		setLocalCaseItem(updatedCaseItem);
		onCaseChange(updatedCaseItem);
	};

	// Remove condition
	const handleRemoveCondition = (conditionId: number) => {
		const updatedCaseItem = {
			...localCaseItem,
			conditions: localCaseItem.conditions.filter(
				(condition) => condition.conditionId !== conditionId,
			),
		};
		setLocalCaseItem(updatedCaseItem);
		onCaseChange(updatedCaseItem);
	};

	// Update condition
	const handleUpdateCondition = (condition: Condition) => {
		// Update condition in local case
		const updatedConditions = localCaseItem.conditions.map((c) =>
			c.conditionId === condition.conditionId ? condition : c,
		);
		const updatedCaseItem = { ...localCaseItem, conditions: updatedConditions };
		setLocalCaseItem(updatedCaseItem);
		onCaseChange(updatedCaseItem);
	};

	// Update logical operator for case
	const handleUpdateLogicalSymbol = (logicalSymbol: LogicalSymbol) => {
		const updatedCaseItem = { ...localCaseItem, logicalSymbol: logicalSymbol };
		setLocalCaseItem(updatedCaseItem);
		onCaseChange(updatedCaseItem);
	};

	return (
		<div className="flex flex-col gap-2">
			{/* Title */}
			<div className="flex flex-row gap-2 items-center h-8 p-2 justify-between">
				<div className="flex flex-row gap-2 items-center">
					<GripVertical className="w-4 h-4 text-gray-400 drag-handle cursor-grab active:cursor-grabbing" />
					<h3 className="text-sm font-bold">
						{(caseIndex ?? caseItem.caseId) === 1
							? `IF${caseIndex ?? caseItem.caseId}`
							: `ELIF${caseIndex ?? caseItem.caseId}`}
					</h3>
					<Button
						variant="ghost"
						className="w-16 h-6 bg-red-100"
						onClick={() =>
							handleUpdateLogicalSymbol(
								localCaseItem.logicalSymbol === LogicalSymbol.AND
									? LogicalSymbol.Or
									: LogicalSymbol.AND,
							)
						}
					>
						<RefreshCcw className="w-2 h-2" />
						<span className="text-xs">
							{localCaseItem.logicalSymbol?.toUpperCase()}
						</span>
					</Button>
				</div>
				<div className="flex flex-row gap-2 items-center">
					<Button
						variant="ghost"
						className="text-muted-foreground hover:text-red-500 h-6 px-2 gap-1 w-fit"
						onClick={() => onCaseRemove(localCaseItem.caseId)}
					>
						<Trash2 className="w-2 h-2 shrink-0" />
						<span className="text-xs whitespace-nowrap">
							{t("ifElseNode.deleteBranch")}
						</span>
					</Button>
				</div>
			</div>
			{/* Conditions */}
			{/* If caseItem is empty, display an empty case by default */}
			{localCaseItem?.conditions?.length > 0 &&
				localCaseItem?.conditions?.map((condition) => (
					<div className="flex flex-row" key={condition.conditionId}>
						<ConditionSetting
							variableItemList={variableItemList}
							condition={condition}
							onConditionChange={handleUpdateCondition}
							onConditionRemove={handleRemoveCondition}
						/>
					</div>
				))}

			{/* Add condition button */}
			<div className="flex justify-start pl-2">
				<Button
					variant="outline"
					size="sm"
					className="h-7 text-xs px-3"
					onClick={handleAddCondition}
				>
					{t("ifElseNode.addCondition")}
				</Button>
			</div>
			{/* Use div to simulate divider */}
			<div className="w-full h-px bg-gray-300 px-4 m-2 "></div>
		</div>
	);
};

export default CaseEditor;
