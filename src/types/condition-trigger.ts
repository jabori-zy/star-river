import type { NodeType } from "./node";


export type CaseBranchTrigger = {
	triggerType: "case";
	fromNodeType: NodeType;
	fromHandleId: string;
	fromNodeId: string;
	fromNodeName: string;
	caseId: number;
};

export type ElseBranchTrigger = {
	triggerType: "else";
	fromNodeType: NodeType;
	fromHandleId: string;
	fromNodeId: string;
	fromNodeName: string;
};

export type ConditionTrigger = CaseBranchTrigger | ElseBranchTrigger;