import { Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/components/flow/node/node-utils";
import { PercentInput } from "@/components/percent-input";
import MultipleSelector, {
	type Option,
} from "@/components/select-components/multi-select";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import {
	ComparisonSymbol,
	type Condition,
	type Constant,
	getAvailableComparisonSymbols,
	type Variable,
	VarType,
} from "@/types/node/if-else-node";
import { NodeType } from "@/types/node/index";
import { VariableValueType } from "@/types/variable";
import ComparisonSymbolSelector from "./comparison-symbol-selector";
import ConstantInput from "./constant-input";
import VarTypeSelector from "./var-type-selector";
import VariableSelector from "./variable-selector";

interface ConditionSettingProps {
	variableItemList: VariableItem[];
	condition: Condition;
	onConditionChange: (condition: Condition) => void;
	onConditionRemove: (conditionId: number) => void;
	// updateCondition: (caseId: number, conditionId: number, condition: Condition) => void; // 更新条件
}

// 变量拉下选择框

const ConditionSetting: React.FC<ConditionSettingProps> = ({
	variableItemList,
	condition,
	onConditionChange,
	onConditionRemove,
}) => {
	// 本地的条件状态，用于编辑时
	const [localCondition, setLocalCondition] = useState<Condition>(condition);
	const { t } = useTranslation();
	// 当传入的condition发生变化时，同步更新本地状态
	useEffect(() => {
		setLocalCondition(condition);
	}, [condition]);

	const areVariablesEqual = (
		a: Variable | Constant | null | undefined,
		b: Variable | Constant | null | undefined,
	) => {
		if (a === b) {
			return true;
		}
		if (!a || !b) {
			return false;
		}

		// 如果类型不同，直接返回 false
		if (a.varType !== b.varType) {
			return false;
		}

		// 如果是常量类型
		if (a.varType === VarType.constant && b.varType === VarType.constant) {
			const aConst = a as Constant;
			const bConst = b as Constant;
			return (
				aConst.varValueType === bConst.varValueType &&
				JSON.stringify(aConst.varValue) === JSON.stringify(bConst.varValue)
			);
		}

		// 如果是变量类型
		const aVar = a as Variable;
		const bVar = b as Variable;
		return (
			aVar.nodeId === bVar.nodeId &&
			aVar.nodeType === bVar.nodeType &&
			aVar.nodeName === bVar.nodeName &&
			aVar.outputHandleId === bVar.outputHandleId &&
			aVar.varConfigId === bVar.varConfigId &&
			aVar.varName === bVar.varName &&
			aVar.varDisplayName === bVar.varDisplayName &&
			aVar.varValueType === bVar.varValueType
		);
	};

	const areConditionsEqual = (a: Condition, b: Condition) => {
		return (
			a.conditionId === b.conditionId &&
			a.comparisonSymbol === b.comparisonSymbol &&
			areVariablesEqual(a.left, b.left) &&
			areVariablesEqual(a.right, b.right)
		);
	};

	// 更新左节点
	const handleUpdateLeftNode = (
		nodeId: string,
		nodeType: NodeType | null,
		nodeName: string,
	) => {
		const currentLeftVariable = localCondition.left;
		if (!nodeId) {
			if (!currentLeftVariable) {
				return;
			}
			const clearedCondition: Condition = {
				...localCondition,
				left: null,
				right: null,
				comparisonSymbol: null,
			};
			setLocalCondition(clearedCondition);
			onConditionChange(clearedCondition);
			return;
		}

		if (
			currentLeftVariable?.varType === VarType.variable &&
			currentLeftVariable.nodeId === nodeId &&
			currentLeftVariable.nodeType === nodeType &&
			currentLeftVariable.nodeName === nodeName
		) {
			return;
		}

		const previousVarValueType = currentLeftVariable?.varValueType ?? null;
		const resolvedVarValueType =
			nodeType === NodeType.IndicatorNode || nodeType === NodeType.KlineNode
				? VariableValueType.NUMBER
				: previousVarValueType ?? VariableValueType.NUMBER;

		const newLeftVariable: Variable = {
			varType: VarType.variable,
			nodeId: nodeId,
			nodeType: nodeType,
			nodeName: nodeName,
			outputHandleId: null,
			varConfigId: null,
			varName: null,
			varDisplayName: null,
			varValueType: resolvedVarValueType,
		};

		const hasTypeChanged = previousVarValueType !== resolvedVarValueType;
		const availableSymbols = hasTypeChanged
			? getAvailableComparisonSymbols(resolvedVarValueType)
			: null;
		const nextComparisonSymbol =
			hasTypeChanged && availableSymbols
				? availableSymbols.length === 0
					? null
					: localCondition.comparisonSymbol &&
						availableSymbols.includes(localCondition.comparisonSymbol)
						? localCondition.comparisonSymbol
						: availableSymbols[0]
				: localCondition.comparisonSymbol;

		const newCondition: Condition = {
			...localCondition,
			left: newLeftVariable,
			right: null,
			comparisonSymbol: nextComparisonSymbol,
		};
		if (areConditionsEqual(localCondition, newCondition)) {
			return;
		}
		setLocalCondition(newCondition);
		// 执行回调，更新条件
		onConditionChange(newCondition);
	};
	// 更新左变量
	const handleUpdateLeftVariable = (
		variableId: number,
		handleId: string,
		variable: string,
		variableName: string,
		varValueType: VariableValueType,
	) => {
		const currentLeftVariable = localCondition.left;
		if (
			currentLeftVariable?.varType === VarType.variable &&
			currentLeftVariable.varConfigId === variableId &&
			currentLeftVariable.outputHandleId === handleId &&
			currentLeftVariable.varName === variable &&
			currentLeftVariable.varDisplayName === variableName &&
			currentLeftVariable.varValueType === varValueType
		) {
			return;
		}

		// 检查左变量类型是否发生变化
		const hasTypeChanged =
			localCondition.left?.varValueType !== varValueType;
		

		const newLeftVariable: Variable = {
			varType: VarType.variable,
			nodeId: localCondition.left?.nodeId ?? null,
			nodeType: localCondition.left?.nodeType ?? null,
			nodeName: localCondition.left?.nodeName ?? null,
			outputHandleId: handleId,
			varConfigId: variableId,
			varName: variable,
			varDisplayName: variableName,
			varValueType: varValueType,
		};

		// 如果类型发生变化，清空右变量并使用新类型的默认值
		let newRightVariable: Variable | Constant | null = localCondition.right;
		let newComparisonSymbol = localCondition.comparisonSymbol;

		if (hasTypeChanged) {
			newRightVariable = null;

			// 检查当前的比较符号是否适用于新的变量类型
			const availableSymbols = getAvailableComparisonSymbols(varValueType);
			if (availableSymbols.length === 0) {
				newComparisonSymbol = null;
			} else if (
				!localCondition.comparisonSymbol ||
				!availableSymbols.includes(localCondition.comparisonSymbol)
			) {
				// 如果当前符号缺失或不适用，使用第一个可用符号
				newComparisonSymbol = availableSymbols[0];
			}
		}

		const newCondition: Condition = {
			...localCondition,
			left: newLeftVariable,
			right: newRightVariable,
			comparisonSymbol: newComparisonSymbol,
		};

		if (areConditionsEqual(localCondition, newCondition)) {
			return;
		}

		setLocalCondition(newCondition);
		// 执行回调，更新条件
		onConditionChange(newCondition);
	};

	// 更新右节点
	const handleUpdateRightNode = (
		nodeId: string,
		nodeType: NodeType | null,
		nodeName: string,
	) => {
		const currentRightVariable = localCondition.right;

		if (!nodeId) {
			if (currentRightVariable === null) {
				return;
			}
			const clearedCondition = { ...localCondition, right: null };
			setLocalCondition(clearedCondition);
			onConditionChange(clearedCondition);
			return;
		}

		if (
			currentRightVariable?.varType === VarType.variable &&
			currentRightVariable.nodeId === nodeId &&
			currentRightVariable.nodeType === nodeType &&
			currentRightVariable.nodeName === nodeName
		) {
			return;
		}

		const newRightVariable: Variable = {
			varType: VarType.variable,
			nodeId: nodeId,
			nodeType: nodeType,
			nodeName: nodeName,
			outputHandleId: null,
			varConfigId: null,
			varName: null,
			varDisplayName: null,
			varValueType: VariableValueType.NUMBER, // 默认类型
		};
		const newCondition = { ...localCondition, right: newRightVariable };
		if (areConditionsEqual(localCondition, newCondition)) {
			return;
		}
		setLocalCondition(newCondition);
		// 执行回调，更新条件
		onConditionChange(newCondition);
	};
	// 更新右变量
	const handleUpdateRightVariable = (
		variableId: number,
		handleId: string,
		variable: string,
		variableName: string,
		varValueType: VariableValueType,
	) => {
		const currentRightVariable = localCondition.right;
		if (
			currentRightVariable?.varType === VarType.variable &&
			currentRightVariable.outputHandleId === handleId &&
			currentRightVariable.varConfigId === variableId &&
			currentRightVariable.varName === variable &&
			currentRightVariable.varDisplayName === variableName &&
			currentRightVariable.varValueType === varValueType
		) {
			return;
		}

		const right = localCondition.right;
		const newRightVariable: Variable = {
			varType: VarType.variable,
			nodeId: (right?.varType === VarType.variable ? right.nodeId : null) ?? null,
			nodeType: (right?.varType === VarType.variable ? right.nodeType : null) ?? null,
			nodeName: (right?.varType === VarType.variable ? right.nodeName : null) ?? null,
			outputHandleId: handleId,
			varConfigId: variableId,
			varName: variable,
			varDisplayName: variableName,
			varValueType: varValueType,
		};
		const newCondition = { ...localCondition, right: newRightVariable };
		if (areConditionsEqual(localCondition, newCondition)) {
			return;
		}
		setLocalCondition(newCondition);
		// 执行回调，更新条件
		onConditionChange(newCondition);
	};

	// 更新比较符号
	const handleUpdateComparisonSymbol = (comparisonSymbol: ComparisonSymbol) => {
		if (localCondition.comparisonSymbol === comparisonSymbol) {
			return;
		}

		const newCondition = {
			...localCondition,
			comparisonSymbol: comparisonSymbol,
		};
		if (areConditionsEqual(localCondition, newCondition)) {
			return;
		}
		setLocalCondition(newCondition);
		// 执行回调，更新条件
		onConditionChange(newCondition);
	};

	// 更新右变量类型
	const handleUpdateRightVarType = (varType: VarType) => {
		const leftVarType =
			localCondition.left?.varValueType || VariableValueType.NUMBER;

		const currentRightVariable = localCondition.right;
		if (
			currentRightVariable?.varType === varType &&
			(varType !== VarType.constant ||
				currentRightVariable.varValueType === leftVarType)
		) {
			return;
		}

		let newRightVariable: Variable | Constant;

		if (varType === VarType.constant) {
			// 常量模式：根据左变量类型设置默认值
			let defaultValue: string | number | boolean | string[];
			switch (leftVarType) {
				case VariableValueType.STRING:
					defaultValue = "";
					break;
				case VariableValueType.BOOLEAN:
					defaultValue = true;
					break;
				case VariableValueType.TIME:
					// 使用格式化的当前时间作为默认值
					defaultValue = formatDate(new Date());
					break;
				case VariableValueType.ENUM:
					// 枚举类型使用空数组
					defaultValue = [];
					break;
				case VariableValueType.PERCENTAGE:
					defaultValue = 0;
					break;
				case VariableValueType.NUMBER:
				default:
					defaultValue = 0;
					break;
			}

			newRightVariable = {
				varType: VarType.constant,
				varValueType: leftVarType,
				varValue: defaultValue,
			};
		} else {
			// 变量模式
			newRightVariable = {
				varType: VarType.variable,
				nodeId: null,
				nodeType: null,
				nodeName: null,
				outputHandleId: null,
				varConfigId: null,
				varName: null,
				varDisplayName: null,
				varValueType: leftVarType,
			};
		}

		const newCondition = { ...localCondition, right: newRightVariable };
		if (areConditionsEqual(localCondition, newCondition)) {
			return;
		}
		setLocalCondition(newCondition);
		// 执行回调，更新条件
		onConditionChange(newCondition);
	};

	// 更新右常量值（支持不同类型）
	const handleUpdateRightConstantValue = (value: string | number | boolean) => {
		const leftVarType =
			localCondition.left?.varValueType || VariableValueType.NUMBER;

		const currentRightVariable = localCondition.right;

		// 将输入值转换为正确的类型
		let typedValue: string | number | boolean | string[];

		if (leftVarType === VariableValueType.ENUM) {
			// ENUM 类型：value 应该是 JSON 字符串
			try {
				const parsed = typeof value === 'string' ? JSON.parse(value) : value;
				typedValue = Array.isArray(parsed) ? parsed : [];
			} catch {
				typedValue = [];
			}
		} else if (leftVarType === VariableValueType.NUMBER || leftVarType === VariableValueType.PERCENTAGE) {
			typedValue = typeof value === 'number' ? value : Number(value) || 0;
		} else if (leftVarType === VariableValueType.BOOLEAN) {
			typedValue = typeof value === 'boolean' ? value : value === 'true';
		} else {
			// STRING, TIME 等其他类型
			typedValue = value.toString();
		}

		// 检查是否需要更新
		if (currentRightVariable?.varType === VarType.constant) {
			const currentConst = currentRightVariable as Constant;
			if (
				currentConst.varValueType === leftVarType &&
				JSON.stringify(currentConst.varValue) === JSON.stringify(typedValue)
			) {
				return;
			}
		}

		const newRightVariable: Constant = {
			varType: VarType.constant,
			varValueType: leftVarType,
			varValue: typedValue,
		};

		const newCondition = { ...localCondition, right: newRightVariable };
		if (areConditionsEqual(localCondition, newCondition)) {
			return;
		}
		setLocalCondition(newCondition);
		// 执行回调，更新条件
		onConditionChange(newCondition);
	};

	// 判断是否需要右变量（isEmpty 和 isNotEmpty 不需要右变量）
	const needsRightVariable =
		localCondition.comparisonSymbol !== ComparisonSymbol.isEmpty &&
		localCondition.comparisonSymbol !== ComparisonSymbol.isNotEmpty;

	const leftVarValueType =
		localCondition.left?.varValueType || null;
	const rightVarType = localCondition.right?.varType || null;

	// 获取右侧常量值
	const getRightConstantValue = (): string | number | boolean | string[] => {
		const right = localCondition.right;
		if (!right || right.varType !== VarType.constant) {
			return "";
		}
		return (right as Constant).varValue;
	};
	// const excludeVariable = useMemo(() => {
	// 	const leftVariable = localCondition.left;

	// 	if (
	// 		leftVariable?.varType === VarType.variable &&
	// 		leftVariable.nodeId &&
	// 		leftVariable.outputHandleId &&
	// 		leftVariable.varName !== null &&
	// 		leftVariable.varName !== undefined
	// 	) {
	// 		return {
	// 			nodeId: leftVariable.nodeId,
	// 			outputHandleId: leftVariable.outputHandleId,
	// 			varName: leftVariable.varName,
	// 		};
	// 	}

	// 	return null;
	// }, [
	// 	localCondition.left?.varType,
	// 	localCondition.left?.nodeId,
	// 	localCondition.left?.outputHandleId,
	// 	localCondition.left?.varName,
	// ]);
	const enumConstantValues = useMemo(() => {
		if (
			rightVarType !== VarType.constant ||
			leftVarValueType !== VariableValueType.ENUM
		) {
			return [] as string[];
		}

		const right = localCondition.right;
		if (!right || right.varType !== VarType.constant) {
			return [];
		}

		const value = (right as Constant).varValue;
		if (Array.isArray(value)) {
			return value.map((item) => item?.toString?.() ?? "");
		}

		return [];
	}, [rightVarType, leftVarValueType, localCondition.right]);
	const enumConstantOptions = useMemo<Option[]>(() => {
		return enumConstantValues.map((val) => ({
			value: val,
			label: val,
		}));
	}, [enumConstantValues]);

	// 获取右变量的白名单类型（只保留该类型）
	const getRightVariableWhitelist = (): VariableValueType | null => {
		const leftVarType = localCondition.left?.varValueType;
		const comparisonSymbol = localCondition.comparisonSymbol;

		// 如果比较符是 isIn 或 isNotIn，右变量必须是 ENUM 类型（白名单）
		if (
			comparisonSymbol === ComparisonSymbol.isIn ||
			comparisonSymbol === ComparisonSymbol.isNotIn
		) {
			return VariableValueType.ENUM;
		}

		// 如果左变量是 ENUM 类型，不使用白名单（由黑名单处理）
		if (leftVarType === VariableValueType.ENUM) {
			return null;
		}

		// 其他情况，使用左变量的类型作为白名单
		return leftVarType || null;
	};

	// 获取右变量的黑名单类型（排除该类型）
	const getRightVariableBlacklist = (): VariableValueType | null => {
		const leftVarType = localCondition.left?.varValueType;

		// 如果左变量是 ENUM 类型，黑名单排除 ENUM
		if (leftVarType === VariableValueType.ENUM) {
			return VariableValueType.ENUM;
		}

		// 其他情况不使用黑名单
		return null;
	};

	return (
		<div className="flex flex-row justify-between px-2 rounded-md bg-gray-100 w-full">
			<div className="flex flex-col flex-1">
				<div className="flex flex-col gap-1 p-2 min-h-16">
					<div className="flex flex-row justify-between">
						<span className="text-sm font-bold text-muted-foreground text-left">
							{t("ifElseNode.leftVariable")}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-red-500 p-1 h-6 w-6"
							onClick={() => onConditionRemove(condition.conditionId)}
						>
							<Trash2 className="w-2 h-2" />
						</Button>
					</div>
					{/* 左边变量选择器 */}
					<VariableSelector
						variableItemList={variableItemList}
						variable={localCondition.left || null}
						onNodeChange={handleUpdateLeftNode}
						onVariableChange={handleUpdateLeftVariable}
					/>
				</div>
				<div className="flex flex-col gap-1 px-2 min-h-16">
					<div className="text-sm font-bold text-muted-foreground text-left">
						{t("ifElseNode.operator")}
					</div>
					<ButtonGroup>
						<ComparisonSymbolSelector
							className="w-24"
							comparisonSymbol={
								localCondition.comparisonSymbol || ComparisonSymbol.equal
							}
							onComparisonSymbolChange={handleUpdateComparisonSymbol}
							leftVarValueType={leftVarValueType}
						/>
						<VarTypeSelector
							className="w-24"
							varType={rightVarType || VarType.variable}
							onVarTypeChange={handleUpdateRightVarType}
							disabled={!needsRightVariable}
						/>
					</ButtonGroup>
				</div>
				{needsRightVariable && (
					<div className="flex flex-col gap-1 px-2 min-h-16">
						<div className="text-sm font-bold text-muted-foreground text-left">
							{t("ifElseNode.rightVariable")}
						</div>
						{rightVarType !== VarType.constant ? (
							<VariableSelector
								variableItemList={variableItemList}
								variable={
									localCondition.right?.varType === VarType.variable
										? (localCondition.right as Variable)
										: null
								}
								onNodeChange={handleUpdateRightNode}
								onVariableChange={handleUpdateRightVariable}
								whitelistValueType={getRightVariableWhitelist()}
								blacklistValueType={getRightVariableBlacklist()}
								// excludeVariable={excludeVariable}
							/>
						) : (
							/* 根据左变量类型显示不同的常量输入 */
							(() => {
								const leftVarType =
									leftVarValueType || VariableValueType.NUMBER;
								const constantValue = getRightConstantValue();

								switch (leftVarType) {
									case VariableValueType.STRING:
										return (
											<Input
												type="text"
												className="w-full h-8 text-xs font-normal hover:bg-gray-200"
												value={typeof constantValue === 'string' ? constantValue : ""}
												onChange={(e) => {
													// 输入时允许空格，不做处理
													handleUpdateRightConstantValue(e.target.value);
												}}
												onBlur={(e) => {
													// 失去焦点时 trim 左右空格
													const trimmedValue = e.target.value.trim();
													if (trimmedValue !== e.target.value) {
														handleUpdateRightConstantValue(trimmedValue);
													}
												}}
												placeholder="输入字符串"
											/>
										);

									case VariableValueType.BOOLEAN:
										return (
											<Select
												value={typeof constantValue === 'boolean' ? constantValue.toString() : "true"}
												onValueChange={(value) =>
													handleUpdateRightConstantValue(value === "true")
												}
											>
												<SelectTrigger className="w-full h-8 text-xs font-normal hover:bg-gray-200">
													<SelectValue placeholder="选择布尔值" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="true">true</SelectItem>
													<SelectItem value="false">false</SelectItem>
												</SelectContent>
											</Select>
										);

									case VariableValueType.TIME:
										return (
											<ConstantInput
												className="w-full"
												value={
													typeof constantValue === 'string' ? constantValue : formatDate(new Date())
												}
												onValueChange={handleUpdateRightConstantValue}
												inputType="time"
											/>
										);

									case VariableValueType.ENUM: {
										return (
											<MultipleSelector
												value={enumConstantOptions}
												onChange={(options) => {
													const values = options.map((opt) => opt.value);
													handleUpdateRightConstantValue(
														JSON.stringify(values),
													);
												}}
												placeholder="选择或输入枚举值"
												creatable={true}
												className="w-full min-h-9 h-9"
												hidePlaceholderWhenSelected
											/>
										);
									}

									case VariableValueType.PERCENTAGE:
										return (
											<PercentInput
												value={typeof constantValue === 'number' ? constantValue.toString() : "0"}
												onChange={(value) =>
													handleUpdateRightConstantValue(value)
												}
												placeholder="如: 5"
												className="w-full"
											/>
										);

									case VariableValueType.NUMBER:
									default:
										return (
											<ConstantInput
												className="w-full"
												value={typeof constantValue === 'number' ? constantValue : 0}
												onValueChange={handleUpdateRightConstantValue}
											/>
										);
								}
							})()
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ConditionSetting;
