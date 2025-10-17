import { useCallback, useEffect, useState } from "react";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { ButtonGroup } from "@/components/ui/button-group";
import type { CaseItem } from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import type { TriggerCase } from "@/types/node/variable-node";

// Case 数据结构，与 getIfElseNodeCases 返回值匹配
export interface CaseItemInfo {
	nodeId: string;
	nodeName: string;
	nodeType: NodeType;
	caseItem: CaseItem;
}

interface CaseSelectorProps {
	caseList: CaseItemInfo[];
	selectedTriggerCase: TriggerCase | null;
	onTriggerCaseChange: (triggerCase: TriggerCase | null) => void;
}

const CaseSelector: React.FC<CaseSelectorProps> = ({
	caseList,
	selectedTriggerCase,
	onTriggerCaseChange,
}) => {
	const [localNodeId, setLocalNodeId] = useState<string>("");
	const [caseString, setCaseString] = useState<string>("");

	// 生成 case 选项的 value 格式：triggerType|caseId|outputHandleId (对于 case) 或 triggerType||outputHandleId (对于 else)
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

	// 同步节点选择
	useEffect(() => {
		if (selectedTriggerCase) {
			setLocalNodeId(selectedTriggerCase.fromNodeId);
		} else {
			setLocalNodeId("");
		}
	}, [selectedTriggerCase]);

	// 同步 case 选择
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

	// 处理节点选择
	const handleNodeChange = (nodeId: string) => {
		const nodeName =
			caseList.find((item) => item.nodeId === nodeId)?.nodeName || "";
		setLocalNodeId(nodeId);
		setCaseString(""); // 清空 case 选择

		// 清空触发配置
		onTriggerCaseChange(null);
	};

	// 处理 case 选择
	const handleCaseChange = (caseValue: string) => {
		const [triggerType, caseIdStr, outputHandleId] = caseValue.split("|");

		const selectedNodeInfo = caseList.find(
			(item) => item.nodeId === localNodeId,
		);
		if (!selectedNodeInfo) return;

		setCaseString(caseValue);

		if (triggerType === "case") {
			const caseId = Number.parseInt(caseIdStr, 10);
			const triggerCase: TriggerCase = {
				triggerType: "case",
				fromNodeType: NodeType.IfElseNode,
				fromNodeId: localNodeId,
				fromNodeName: selectedNodeInfo.nodeName,
				fromHandleId: outputHandleId,
				caseId,
			};
			onTriggerCaseChange(triggerCase);
		} else {
			// else 分支
			const triggerCase: TriggerCase = {
				triggerType: "else",
				fromNodeType: NodeType.IfElseNode,
				fromNodeId: localNodeId,
				fromNodeName: selectedNodeInfo.nodeName,
				fromHandleId: outputHandleId,
			};
			onTriggerCaseChange(triggerCase);
		}
	};

	// 获取当前选中节点的所有 case 列表
	const getSelectedNodeCases = () => {
		return caseList
			.filter((item) => item.nodeId === localNodeId)
			.map((item) => item.caseItem);
	};

	// 生成 case 选项标签
	const getCaseLabel = (caseItem: CaseItem) => {
		return `Case ${caseItem.caseId}`;
	};

	// 获取去重后的节点列表（用于节点选择器）
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

	// 生成节点选项
	const nodeOptions = uniqueNodeList.map((node) => ({
		value: node.nodeId,
		label: node.nodeName,
	}));

	// 生成 case 选项（包含所有 case 和 else）
	const caseOptions = getSelectedNodeCases().map((caseItem) => ({
		value: generateCaseOptionValue(
			"case",
			caseItem.caseId,
			caseItem.outputHandleId,
		),
		label: getCaseLabel(caseItem),
	}));

	// 添加 else 选项
	// 根据 else 分支的 outputHandleId 命名规则（来自判断节点的设计）: `${nodeId}_output_else`
	const elseOutputHandleId = localNodeId ? `${localNodeId}_output_else` : "";
	caseOptions.push({
		value: generateCaseOptionValue("else", undefined, elseOutputHandleId),
		label: "Else",
	});

	return (
		<ButtonGroup className="w-full">
			{/* 节点选择器 */}
			<SelectInDialog
				value={localNodeId}
				onValueChange={handleNodeChange}
				placeholder={hasNoNodes ? "无可用节点" : "选择节点"}
				options={nodeOptions}
				disabled={hasNoNodes}
				className="h-8 text-xs font-normal min-w-20 flex-1"
			/>

			{/* Case 选择器 */}
			<SelectInDialog
				value={caseString}
				onValueChange={handleCaseChange}
				placeholder={hasNoNodes ? "无可用分支" : "选择分支"}
				options={caseOptions}
				disabled={!localNodeId || hasNoNodes}
				className="h-8 text-xs font-normal min-w-20 flex-1"
			/>
		</ButtonGroup>
	);
};

export default CaseSelector;
