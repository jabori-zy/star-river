import {
	ChevronDown,
	ChevronRight,
	GitBranch,
	Hash,
	Settings2,
	Tag,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNodeConnections } from "@xyflow/react";
import { useTranslation } from "react-i18next";
import CaseSelector, { type CaseItemInfo } from "@/components/flow/case-selector";
import type { ConditionTrigger } from "@/types/condition-trigger";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type { TradeMode } from "@/types/strategy";
import { Selector } from "@/components/select-components/select";
import { SelectWithSearch } from "@/components/select-components/select-with-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Instrument } from "@/types/market";
import {
	PositionOperation,
	type PositionOperationConfig,
	getPositionOperationLabel,
	shouldSelectSymbol,
} from "@/types/node/position-node";

interface PositionOpItemProps {
	id: string;
	config: PositionOperationConfig;
	symbolList: Instrument[];
	onChange: (config: PositionOperationConfig) => void;
	onDelete: () => void;
}

const PositionOpItem: React.FC<PositionOpItemProps> = ({
	id,
	config,
	symbolList,
	onChange,
	onDelete,
}) => {
	const { t } = useTranslation();
	const { getIfElseNodeCases } = useStrategyWorkflow();
	const { tradingMode } = useTradingModeStore();
	const connections = useNodeConnections({ id, handleType: "target" });

	const [isOpen, setIsOpen] = useState(true);
	const [caseItemList, setCaseItemList] = useState<CaseItemInfo[]>([]);

	// 获取上游节点的 case 列表
	useEffect(() => {
		const conn = connections.filter(
			(connection) =>
				connection.targetHandle === `${id}_default_input` ||
				connection.targetHandle === config.inputHandleId,
		);
		const cases = getIfElseNodeCases(conn, tradingMode as TradeMode);
		setCaseItemList(cases);
	}, [connections, getIfElseNodeCases, id, tradingMode, config.inputHandleId]);

	const OPERATION_TYPE_OPTIONS = useMemo(
		() => [
			{
				value: PositionOperation.CloseAllPositions,
				label: getPositionOperationLabel(PositionOperation.CloseAllPositions, t),
			},
			{
				value: PositionOperation.CLOSE_POSITION,
				label: getPositionOperationLabel(PositionOperation.CLOSE_POSITION, t),
			},
			// {
			// 	value: PositionOperation.PARTIALLY_CLOSE_POSITION,
			// 	label: getPositionOperationLabel(
			// 		PositionOperation.PARTIALLY_CLOSE_POSITION,
			// 		t,
			// 	),
			// },
		],
		[t],
	);

	const showSymbolSelector = shouldSelectSymbol(config.positionOperation, t);

	const symbolOptions = useMemo(
		() =>
			symbolList.map((s) => ({
				value: s.name,
				label: s.name,
			})),
		[symbolList],
	);

	const saveConfig = (updates: Partial<PositionOperationConfig>) => {
		const newConfig: PositionOperationConfig = {
			...config,
			...updates,
		};
		onChange(newConfig);
	};

	const handleSymbolChange = (value: string) => {
		saveConfig({ symbol: value || null });
	};

	const handleOperationTypeChange = (value: PositionOperation) => {
		const needsSymbol = shouldSelectSymbol(value, t);
		const updates: Partial<PositionOperationConfig> = {
			positionOperation: value,
		};

		if (!config.operationName.trim()) {
			updates.operationName = getPositionOperationLabel(value, t);
		}

		if (!needsSymbol) {
			updates.symbol = null;
		}

		saveConfig(updates);
	};

	const handleOperationNameChange = (value: string) => {
		saveConfig({ operationName: value });
	};

	const handleTriggerConfigChange = (triggerCase: ConditionTrigger | null) => {
		saveConfig({ triggerConfig: triggerCase });
	};

	return (
		<div className="group flex-1 rounded-lg border border-slate-200 bg-slate-50/50 hover:border-slate-300 transition-all">
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="flex items-center justify-between p-2">
					<CollapsibleTrigger asChild>
						<div className="flex flex-1 items-center gap-2 cursor-pointer select-none">
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6 shrink-0 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
							>
								{isOpen ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronRight className="h-4 w-4" />
								)}
							</Button>

							<div className="flex items-center gap-3 overflow-hidden">
								{isOpen ? (
									<div className="flex items-center gap-2 text-sm font-medium text-slate-700">
										<Settings2 className="h-4 w-4 text-blue-500" />
										<span>
											{getPositionOperationLabel(config.positionOperation, t)}
										</span>
									</div>
								) : (
									<div className="flex items-center gap-2 min-w-0">
										<Badge
											variant="secondary"
											className="shrink-0 bg-white border-slate-200 text-slate-700 font-medium"
										>
											{getPositionOperationLabel(config.positionOperation, t)}
										</Badge>
										{showSymbolSelector && config.symbol && (
											<span className="text-sm font-medium text-slate-600 truncate">
												{config.symbol}
											</span>
										)}
									</div>
								)}
							</div>
						</div>
					</CollapsibleTrigger>

					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-2 shrink-0"
						onClick={onDelete}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>

				<CollapsibleContent>
					<div className="px-4 pb-4 pt-1 grid gap-4">

						{/* 触发条件 */}
						<div className="grid gap-2">
							<Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
								<GitBranch className="h-3.5 w-3.5 text-indigo-500" />
								{t("positionNode.triggerCondition")}
							</Label>
							<CaseSelector
								caseList={caseItemList}
								selectedTriggerCase={config.triggerConfig}
								onTriggerCaseChange={handleTriggerConfigChange}
							/>
							{!config.triggerConfig && (
								<p className="text-xs text-red-500 mt-1">
									{t("positionNode.validation.noTriggerCondition")}
								</p>
							)}
						</div>

						<div className="grid gap-2">
							<Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
								<Settings2 className="h-3.5 w-3.5 text-blue-500" />
								{t("positionNode.operationType.label")}
							</Label>
							<Selector
								value={config.positionOperation}
								onValueChange={(value) =>
									handleOperationTypeChange(value as PositionOperation)
								}
								placeholder={t("positionNode.operationType.placeholder")}
								options={OPERATION_TYPE_OPTIONS}
								className="w-full"
							/>
						</div>

						{showSymbolSelector && (
							<div className="grid gap-2">
								<Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
									<Hash className="h-3.5 w-3.5 text-orange-500" />
									{t("positionNode.symbol.label")}
								</Label>
								<SelectWithSearch
									options={symbolOptions}
									value={config.symbol || ""}
									onValueChange={handleSymbolChange}
									placeholder={t("positionNode.symbol.placeholder")}
									searchPlaceholder={t("positionNode.symbol.searchPlaceholder")}
									emptyMessage={t("positionNode.symbol.emptyMessage")}
									className="w-full"
								/>
								{!config.symbol && (
									<p className="text-xs text-red-500 mt-1">
										{t("positionNode.noSymbolConfigured")}
									</p>
								)}
							</div>
						)}

						<div className="grid gap-2">
							<Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
								<Tag className="h-3.5 w-3.5 text-emerald-500" />
								{t("positionNode.operationName.label")}
							</Label>
							<Input
								type="text"
								value={config.operationName}
								onChange={(e) => handleOperationNameChange(e.target.value)}
								placeholder={t("positionNode.operationName.placeholder")}
								className="bg-white"
							/>
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	);
};

export default PositionOpItem;
