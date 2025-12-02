import { useNodeConnections } from "@xyflow/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TbRefresh } from "react-icons/tb";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import type { CaseItemInfo } from "@/components/flow/case-selector";
import { formatVariableValue } from "@/components/flow/node/start-node/components/utils";
import { getTriggerTypeInfo } from "@/components/flow/node/variable-node/variable-node-utils";
import { Badge } from "@/components/ui/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import useStrategyWorkflow from "@/hooks/flow/use-strategy-workflow";
import useTradingModeStore from "@/store/use-trading-mode-store";
import type {
	ConditionTrigger,
	ResetVariableConfig,
	TimerTrigger,
	TriggerType,
} from "@/types/node/variable-node";
import {
	getConditionTriggerConfig,
	getEffectiveTriggerType,
	getTimerTriggerConfig,
} from "@/types/node/variable-node";
import type { TradeMode } from "@/types/strategy";
import {
	type CustomVariable,
	getVariableValueTypeIcon,
	getVariableValueTypeIconColor,
	VariableValueType,
} from "@/types/variable";
import {
	generateBooleanHint,
	generateEnumHint,
	generateNumberHint,
	generatePercentageHint,
	generateStringHint,
	generateTimeHint,
} from "../../../../hint-generators";
import DeleteConfigButton from "../../components/delete-config-button";
import TriggerTypeSwitcher from "../../components/trigger-type-switcher";
import { useValidateResetConfig } from "../validate";

interface ResetVarConfigItemProps {
	id: string;
	config: ResetVariableConfig;
	onConfigChange: (config: ResetVariableConfig) => void;
	onDelete: () => void;
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	duplicateOperation?: string | null;
}

const ResetVarConfigItem: React.FC<ResetVarConfigItemProps> = ({
	id,
	config,
	onConfigChange,
	onDelete,
	customVariables,
	customVariableOptions,
	duplicateOperation,
}) => {
	const { t } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const { getIfElseNodeCases } = useStrategyWorkflow();
	const { tradingMode } = useTradingModeStore();

	const effectiveTriggerType = getEffectiveTriggerType(config) ?? "condition";

	const triggerCase = getConditionTriggerConfig(config) ?? null;
	const timerConfig = getTimerTriggerConfig(config);

	// 使用 ref 缓存 timer 和 condition 配置，防止切换触发类型时丢失
	const cachedTimerConfig = useRef<TimerTrigger>(
		timerConfig || { mode: "interval", interval: 1, unit: "hour" },
	);
	const cachedConditionConfig = useRef<ConditionTrigger | null>(triggerCase);

	// 获取当前节点的连接信息
	// 从 config.inputHandleId 中提取节点 ID
	const connections = useNodeConnections({ id, handleType: "target" });

	// 存储上游节点的case列表
	const [caseItemList, setCaseItemList] = useState<CaseItemInfo[]>([]);

	// 获取上游节点的 case 列表
	useEffect(() => {
		// filter default input handle connection
		const conn = connections.filter(
			(connection) =>
				connection.targetHandle === `${id}_default_input` ||
				connection.targetHandle === config.inputHandleId,
		);
		const cases = getIfElseNodeCases(conn, tradingMode as TradeMode);
		setCaseItemList(cases);
	}, [connections, getIfElseNodeCases, id, tradingMode, config.inputHandleId]);

	// 当从 props 接收到新的配置时，更新缓存
	useEffect(() => {
		if (timerConfig) {
			cachedTimerConfig.current = timerConfig;
		}
	}, [timerConfig]);

	useEffect(() => {
		if (triggerCase) {
			cachedConditionConfig.current = triggerCase;
		}
	}, [triggerCase]);

	// 处理变量选择变化
	const handleVariableChange = (varName: string) => {
		const selectedVar = customVariables.find((v) => v.varName === varName);
		if (selectedVar) {
			onConfigChange({
				...config,
				varName: selectedVar.varName,
				varDisplayName: selectedVar.varDisplayName,
				varValueType: selectedVar.varValueType,
				// 根据变量类型设置默认初始值
				varInitialValue: selectedVar.initialValue,
			});
		}
	};

	// 使用验证 Hook
	const {
		variable,
		triggerCase: triggerCaseError,
		hasError,
	} = useValidateResetConfig(config, {
		t,
		duplicateOperation,
	});

	// 组装错误对象供 UI 使用
	const errors = { variable, triggerCase: triggerCaseError };

	// 处理触发类型变化
	const handleTriggerTypeChange = (triggerType: TriggerType) => {
		if (triggerType === "condition") {
			onConfigChange({
				...config,
				triggerConfig: cachedConditionConfig.current
					? {
							type: "condition",
							config: cachedConditionConfig.current,
						}
					: null,
			});
		} else if (triggerType === "timer") {
			onConfigChange({
				...config,
				triggerConfig: {
					type: "timer",
					config: cachedTimerConfig.current,
				},
			});
		} else {
			onConfigChange({
				...config,
				triggerConfig: null,
			});
		}
	};

	// 处理触发条件变化
	const handleTriggerCaseChange = (
		nextTriggerCase: ConditionTrigger | null,
	) => {
		// 更新缓存
		cachedConditionConfig.current = nextTriggerCase;
		// 通知父组件
		onConfigChange({
			...config,
			triggerConfig: nextTriggerCase
				? {
						type: "condition",
						config: nextTriggerCase,
					}
				: null,
		});
	};

	// 处理定时器配置变化
	const handleTimerConfigChange = (timerConfig: TimerTrigger) => {
		// 更新缓存
		cachedTimerConfig.current = timerConfig;
		// 通知父组件
		onConfigChange({
			...config,
			triggerConfig: {
				type: "timer",
				config: timerConfig,
			},
		});
	};

	const typeInfo = getTriggerTypeInfo(effectiveTriggerType, t);
	const TriggerIcon = typeInfo.icon;

	const VarTypeIcon = getVariableValueTypeIcon(config.varValueType);
	const varTypeIconColor = getVariableValueTypeIconColor(config.varValueType);

	const formattedValue = formatVariableValue(
		config.varInitialValue,
		config.varValueType,
	);

	// 根据变量类型选择对应的生成器
	const getHintGenerator = (varValueType?: VariableValueType) => {
		if (!varValueType) return generateNumberHint;

		const generatorMap = {
			[VariableValueType.BOOLEAN]: generateBooleanHint,
			[VariableValueType.ENUM]: generateEnumHint,
			[VariableValueType.NUMBER]: generateNumberHint,
			[VariableValueType.STRING]: generateStringHint,
			[VariableValueType.TIME]: generateTimeHint,
			[VariableValueType.PERCENTAGE]: generatePercentageHint,
		};

		return generatorMap[varValueType] || generateNumberHint;
	};

	// 判断是否应该显示提示文案
	const shouldShowHint = () => {
		// 必须选择了变量
		if (!config.varName) {
			return false;
		}
		// 条件触发模式：必须选择了触发条件
		if (effectiveTriggerType === "condition" && !triggerCase) {
			return false;
		}
		return true;
	};

	// 生成条件触发提示
	const conditionHint = (() => {
		if (effectiveTriggerType !== "condition" || !shouldShowHint()) {
			return null;
		}

		const selectedVar = customVariables.find(
			(v: CustomVariable) => v.varName === config.varName,
		);
		const variableDisplayName = selectedVar?.varDisplayName || config.varName;

		const hint = getHintGenerator(selectedVar?.varValueType)({
			t,
			varOperation: "reset",
			variableDisplayName,
			value: formattedValue,
			selectedValues: Array.isArray(config.varInitialValue)
				? config.varInitialValue
				: undefined,
			conditionTrigger: triggerCase,
			timerTrigger: undefined,
		});

		return hint;
	})();

	// 生成定时触发提示
	const timerHint = (() => {
		if (effectiveTriggerType !== "timer" || !shouldShowHint()) {
			return null;
		}

		const selectedVar = customVariables.find(
			(v: CustomVariable) => v.varName === config.varName,
		);
		const variableDisplayName = selectedVar?.varDisplayName || config.varName;

		const hint = getHintGenerator(selectedVar?.varValueType)({
			t,
			varOperation: "reset",
			variableDisplayName,
			value: formattedValue,
			selectedValues: Array.isArray(config.varInitialValue)
				? config.varInitialValue
				: undefined,
			conditionTrigger: undefined,
			timerTrigger: timerConfig,
		});

		return hint;
	})();

	return (
		<div
			className={`group flex-1 space-y-2 p-3 rounded-md border bg-background ${hasError ? "border-red-500" : "border-border"}`}
		>
			<Collapsible open={isOpen} onOpenChange={setIsOpen}>
				<div className="flex items-start justify-between gap-2">
					<CollapsibleTrigger asChild>
						<div className="flex items-center gap-2 cursor-pointer">
							{isOpen ? (
								<ChevronDown className="h-4 w-4 flex-shrink-0" />
							) : (
								<ChevronRight className="h-4 w-4 flex-shrink-0" />
							)}
							<Tooltip>
								<TooltipTrigger asChild>
									{/* 第一行：图标 + 操作标题 + 触发方式 */}
									<div className="flex items-center gap-2">
										<TbRefresh className="h-4 w-4 text-orange-600 flex-shrink-0" />
										<span className="text-sm font-medium">
											{t("variableNode.resetVariable")}
										</span>
										<Badge className={`h-5 text-[10px] ${typeInfo.badgeColor}`}>
											<TriggerIcon className="h-3 w-3" />
											{typeInfo.label}
										</Badge>
									</div>
								</TooltipTrigger>
								<TooltipContent side="top">
									<div className="flex items-center gap-1">
										<VarTypeIcon className={`text-sm ${varTypeIconColor}`} />
										<p>{config.varName}</p>
									</div>
								</TooltipContent>
							</Tooltip>
						</div>
					</CollapsibleTrigger>

					{/* 删除按钮 */}
					<DeleteConfigButton onDelete={onDelete} />
				</div>

				{/* Dialog 中的完整配置 UI */}
				<CollapsibleContent>
					<div className="flex flex-col gap-2 mt-2">
						<div className="flex flex-col gap-2">
							<Label
								htmlFor="resetVariable"
								className="text-sm font-medium pointer-events-none"
							>
								{t("variableNode.var")}
							</Label>
							<SelectInDialog
								id="resetVariable"
								value={config.varName}
								onValueChange={handleVariableChange}
								placeholder={
									customVariables.length === 0
										? "无自定义变量"
										: "选择要重置的变量"
								}
								options={customVariableOptions}
								disabled={customVariables.length === 0}
								emptyMessage="未配置自定义变量，请在策略起点配置"
							/>
							{errors.variable && (
								<p className="text-xs text-red-600 mt-1">{errors.variable}</p>
							)}
						</div>

						{/* 触发方式 */}
						<TriggerTypeSwitcher
							triggerType={effectiveTriggerType}
							onTriggerTypeChange={handleTriggerTypeChange}
							availableTriggers={["condition", "timer"]}
							idPrefix="reset"
							caseItemList={caseItemList}
							selectedTriggerCase={triggerCase ?? null}
							onTriggerCaseChange={handleTriggerCaseChange}
							timerConfig={
								timerConfig || { mode: "interval", interval: 1, unit: "hour" }
							}
							onTimerConfigChange={handleTimerConfigChange}
						/>

						{errors.triggerCase && (
							<p className="text-xs text-red-600 mt-1">{errors.triggerCase}</p>
						)}

						{/* 展开状态下显示描述文案 */}
						{effectiveTriggerType === "condition" && conditionHint && (
							<p className="text-xs text-muted-foreground mt-2">
								{conditionHint}
							</p>
						)}

						{effectiveTriggerType === "timer" && timerHint && (
							<p className="text-xs text-muted-foreground mt-2">{timerHint}</p>
						)}
					</div>
				</CollapsibleContent>
			</Collapsible>

			{/* 折叠状态下显示描述文案 */}
			{!isOpen && (
				<>
					{effectiveTriggerType === "condition" && conditionHint && (
						<p className="text-xs text-muted-foreground">{conditionHint}</p>
					)}

					{effectiveTriggerType === "timer" && timerHint && (
						<p className="text-xs text-muted-foreground">{timerHint}</p>
					)}
				</>
			)}
		</div>
	);
};

export default ResetVarConfigItem;
