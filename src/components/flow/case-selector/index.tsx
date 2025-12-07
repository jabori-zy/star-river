import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import type { CaseItem } from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import type { ConditionTrigger } from "@/types/node/variable-node";
// Case data structure, matching getIfElseNodeCases return value
export interface CaseItemInfo {
	nodeId: string;
	nodeName: string;
	nodeType: NodeType;
	caseItem: CaseItem | string;
}

interface CaseSelectorProps {
	caseList: CaseItemInfo[];
	selectedTriggerCase: ConditionTrigger | null;
	onTriggerCaseChange: (triggerCase: ConditionTrigger | null) => void;
}

const CaseSelector: React.FC<CaseSelectorProps> = ({
	caseList,
	selectedTriggerCase,
	onTriggerCaseChange,
}) => {
	const { t } = useTranslation();
	const [localNodeId, setLocalNodeId] = useState<string>("");
	const [caseString, setCaseString] = useState<string>("");

	// Generate case option value format: triggerType|caseId|outputHandleId (for case) or triggerType||outputHandleId (for else)
	const generateCaseOptionValue = useCallback(
		(
			triggerType: "case" | "else",
			caseId: number | undefined,
			outputHandleId: string | null,
		) => {
			if (triggerType === "case" && caseId !== undefined) {
				return `case|${caseId}|${outputHandleId || ""}`;
			}
			return `else||${outputHandleId || ""}`;
		},
		[],
	);

	// Sync node selection
	useEffect(() => {
		if (selectedTriggerCase) {
			setLocalNodeId(selectedTriggerCase.fromNodeId);
		} else {
			setLocalNodeId("");
		}
	}, [selectedTriggerCase]);

	// Sync case selection
	useEffect(() => {
		if (!selectedTriggerCase) {
			setCaseString("");
			return;
		}

		if (selectedTriggerCase.triggerType === "case") {
			const caseString = generateCaseOptionValue(
				"case",
				selectedTriggerCase.caseId,
				selectedTriggerCase.fromHandleId,
			);
			setCaseString(caseString);
		} else {
			const caseString = generateCaseOptionValue(
				"else",
				undefined,
				selectedTriggerCase.fromHandleId,
			);
			setCaseString(caseString);
		}
	}, [selectedTriggerCase, generateCaseOptionValue]);

	// Handle node selection
	const handleNodeChange = (nodeId: string) => {
		setLocalNodeId(nodeId);
		setCaseString(""); // Clear case selection

		// Clear trigger configuration
		onTriggerCaseChange(null);
	};

	// Handle case selection
	const handleCaseChange = (caseValue: string) => {
		const [triggerType, caseIdStr, outputHandleId] = caseValue.split("|");

		const selectedNodeInfo = caseList.find(
			(item) => item.nodeId === localNodeId,
		);
		if (!selectedNodeInfo) return;

		setCaseString(caseValue);

		if (triggerType === "case") {
			const caseId = Number.parseInt(caseIdStr, 10);
			const triggerCase: ConditionTrigger = {
				triggerType: "case",
				fromNodeType: NodeType.IfElseNode,
				fromNodeId: localNodeId,
				fromNodeName: selectedNodeInfo.nodeName,
				fromHandleId: outputHandleId,
				caseId,
			};
			onTriggerCaseChange(triggerCase);
		} else {
			// else branch
			const triggerCase: ConditionTrigger = {
				triggerType: "else",
				fromNodeType: NodeType.IfElseNode,
				fromNodeId: localNodeId,
				fromNodeName: selectedNodeInfo.nodeName,
				fromHandleId: outputHandleId,
			};
			onTriggerCaseChange(triggerCase);
		}
	};

	// Get all case list for currently selected node (including case and else)
	const getSelectedNodeCases = () => {
		return caseList
			.filter((item) => item.nodeId === localNodeId)
			.map((item) => item.caseItem);
	};

	// Generate case option label
	const getCaseLabel = (caseItem: CaseItem | string) => {
		if (typeof caseItem === "string" && caseItem === "else") {
			return "Else";
		}
		return `Case ${(caseItem as CaseItem).caseId}`;
	};

	// Get deduplicated node list (for node selector)
	const getUniqueNodeList = () => {
		const nodeMap = new Map<string, { nodeId: string; nodeName: string }>();

		for (const item of caseList) {
			if (!nodeMap.has(item.nodeId)) {
				nodeMap.set(item.nodeId, {
					nodeId: item.nodeId,
					nodeName: item.nodeName,
				});
			}
		}

		return Array.from(nodeMap.values());
	};

	const uniqueNodeList = getUniqueNodeList();
	const hasNoNodes = uniqueNodeList.length === 0;

	// Generate node options
	const nodeOptions = uniqueNodeList.map((node) => ({
		value: node.nodeId,
		label: node.nodeName,
	}));

	// Generate case options (including all case and else)
	const caseOptions = getSelectedNodeCases().map((caseItem) => {
		// Handle else branch
		if (typeof caseItem === "string" && caseItem === "else") {
			const elseOutputHandleId = localNodeId
				? `${localNodeId}_output_else`
				: "";
			return {
				value: generateCaseOptionValue("else", undefined, elseOutputHandleId),
				label: getCaseLabel(caseItem),
			};
		}
		// Handle case branch
		const caseData = caseItem as CaseItem;
		return {
			value: generateCaseOptionValue(
				"case",
				caseData.caseId,
				caseData.outputHandleId,
			),
			label: getCaseLabel(caseData),
		};
	});

	return (
		<ButtonGroup className="w-full">
			{/* Node selector */}
			<SelectInDialog
				value={localNodeId}
				onValueChange={handleNodeChange}
				placeholder={
					hasNoNodes
						? t("variableNode.caseSelector.noNodes")
						: t("variableNode.caseSelector.chooseNode")
				}
				options={nodeOptions}
				disabled={hasNoNodes}
				className="h-8 text-xs font-normal min-w-20 flex-1"
			/>

			{/* Case selector */}
			<SelectInDialog
				value={caseString}
				onValueChange={handleCaseChange}
				placeholder={
					hasNoNodes
						? t("variableNode.caseSelector.noCases")
						: t("variableNode.caseSelector.chooseCase")
				}
				options={caseOptions}
				disabled={!localNodeId || hasNoNodes}
				className="h-8 text-xs font-normal min-w-20 flex-1"
			/>
		</ButtonGroup>
	);
};

export default CaseSelector;
