import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatDate } from "@/components/flow/node/node-utils";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import {
	ComparisonSymbol,
	type Condition,
	type Constant,
	getAvailableComparisonSymbols,
	type Variable,
	VarType,
} from "@/types/node/if-else-node";
import type { NodeType } from "@/types/node/index";
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

		// 处理清空场景（用户取消选择节点）
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

		// 检查是否实际改变（避免重复更新）
		if (
			currentLeftVariable?.varType === VarType.variable &&
			currentLeftVariable.nodeId === nodeId &&
			currentLeftVariable.nodeType === nodeType &&
			currentLeftVariable.nodeName === nodeName
		) {
			return;
		}

		// 创建新左变量（部分信息，等待用户选择具体变量）
		// 保留之前的 varValueType，避免不必要的类型重置
		const newLeftVariable: Variable = {
			varType: VarType.variable,
			nodeId: nodeId,
			nodeType: nodeType,
			nodeName: nodeName,
			outputHandleId: null,
			varConfigId: null,
			varName: null,
			varDisplayName: null,
			varValueType:
				currentLeftVariable?.varValueType ?? VariableValueType.NUMBER,
		};

		// 创建新 condition - 保留右变量和比较符号
		// 让 handleUpdateLeftVariable 来决定是否需要清空右变量
		const newCondition: Condition = {
			...localCondition,
			left: newLeftVariable,
		};

		if (areConditionsEqual(localCondition, newCondition)) {
			return;
		}

		setLocalCondition(newCondition);
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
		const currentRightVariable = localCondition.right;

		// 检查是否实际改变（避免重复更新）
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

		// 检查左变量类型是否发生变化（与右变量对比）
		const hasTypeChanged = currentLeftVariable?.varValueType !== varValueType;

		const newLeftVariable: Variable = {
			varType: VarType.variable,
			nodeId: currentLeftVariable?.nodeId ?? null,
			nodeType: currentLeftVariable?.nodeType ?? null,
			nodeName: currentLeftVariable?.nodeName ?? null,
			outputHandleId: handleId,
			varConfigId: variableId,
			varName: variable,
			varDisplayName: variableName,
			varValueType: varValueType,
		};

		// 智能处理右变量
		let newRightVariable: Variable | Constant | null = currentRightVariable;
		let newComparisonSymbol = localCondition.comparisonSymbol;

		if (hasTypeChanged) {
			// 类型改变，需要检查右变量是否兼容
			if (currentRightVariable) {
				const rightVarType = currentRightVariable.varValueType;

				if (rightVarType !== varValueType) {
					// 右变量类型不匹配，需要重置
					// 保持原有的 varType (constant/variable)，只更新 varValueType
					if (currentRightVariable.varType === VarType.constant) {
						// 原本是常量，重置为新类型的默认常量
						let defaultValue: string | number | boolean | string[];
						switch (varValueType) {
							case VariableValueType.STRING:
								defaultValue = "";
								break;
							case VariableValueType.BOOLEAN:
								defaultValue = true;
								break;
							case VariableValueType.TIME:
								defaultValue = formatDate(new Date());
								break;
							case VariableValueType.ENUM:
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
							varValueType: varValueType,
							varValue: defaultValue,
						};
					} else {
						// 原本是变量，重置为新类型的空变量
						newRightVariable = {
							varType: VarType.variable,
							nodeId: null,
							nodeType: null,
							nodeName: null,
							outputHandleId: null,
							varConfigId: null,
							varName: null,
							varDisplayName: null,
							varValueType: varValueType,
						};
					}
				}
				// 如果 rightVarType === varValueType，保留原右变量
			}

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
		// 如果类型未变，保持 newRightVariable = currentRightVariable

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
			nodeId:
				(right?.varType === VarType.variable ? right.nodeId : null) ?? null,
			nodeType:
				(right?.varType === VarType.variable ? right.nodeType : null) ?? null,
			nodeName:
				(right?.varType === VarType.variable ? right.nodeName : null) ?? null,
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

		const currentRightVariable = localCondition.right;
		let newRightVariable = currentRightVariable;

		// 检查是否切换到/从 isIn/isNotIn
		const isNewSymbolArrayType =
			comparisonSymbol === ComparisonSymbol.isIn ||
			comparisonSymbol === ComparisonSymbol.isNotIn;

		const isOldSymbolArrayType =
			localCondition.comparisonSymbol === ComparisonSymbol.isIn ||
			localCondition.comparisonSymbol === ComparisonSymbol.isNotIn;

		const leftVarType =
			localCondition.left?.varValueType || VariableValueType.NUMBER;

		// 处理右变量的类型转换
		if (currentRightVariable?.varType === VarType.constant) {
			const currentConst = currentRightVariable as Constant;

			// 情况1: 从非数组类型切换到数组类型
			if (isNewSymbolArrayType && !isOldSymbolArrayType) {
				// 切换到 isIn/isNotIn 时，清空右变量值，使用空数组
				newRightVariable = {
					varType: VarType.constant,
					varValueType: VariableValueType.ENUM,
					varValue: [],
				};
			}
			// 情况2: 从数组类型切换到非数组类型
			else if (!isNewSymbolArrayType && isOldSymbolArrayType) {
				const currentValue = currentConst.varValue;
				let singleValue: string | number | boolean | string[];

				if (Array.isArray(currentValue) && currentValue.length > 0) {
					singleValue = currentValue[0];
				} else {
					// 空数组，使用默认值
					switch (leftVarType) {
						case VariableValueType.STRING:
							singleValue = "";
							break;
						case VariableValueType.BOOLEAN:
							singleValue = true;
							break;
						case VariableValueType.TIME:
							singleValue = formatDate(new Date());
							break;
						case VariableValueType.PERCENTAGE:
							singleValue = 0;
							break;
						case VariableValueType.NUMBER:
						default:
							singleValue = 0;
							break;
					}
				}

				newRightVariable = {
					varType: VarType.constant,
					varValueType: leftVarType,
					varValue: singleValue,
				};
			}
			// 情况3: 切换到 isIn/isNotIn，但当前 varValueType 不是 ENUM
			else if (
				isNewSymbolArrayType &&
				currentConst.varValueType !== VariableValueType.ENUM
			) {
				// 切换到 isIn/isNotIn 时，清空右变量值，使用空数组
				newRightVariable = {
					varType: VarType.constant,
					varValueType: VariableValueType.ENUM,
					varValue: [],
				};
			}
		} else if (isNewSymbolArrayType && !currentRightVariable) {
			// 情况4: 切换到 isIn/isNotIn，但右变量为 null，创建默认 ENUM 数组
			newRightVariable = {
				varType: VarType.constant,
				varValueType: VariableValueType.ENUM,
				varValue: [],
			};
		}

		const newCondition = {
			...localCondition,
			comparisonSymbol: comparisonSymbol,
			right: newRightVariable,
		};

		if (areConditionsEqual(localCondition, newCondition)) {
			return;
		}

		setLocalCondition(newCondition);
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

		// 判断是否是 isIn/isNotIn 模式
		const isArrayMode =
			localCondition.comparisonSymbol === ComparisonSymbol.isIn ||
			localCondition.comparisonSymbol === ComparisonSymbol.isNotIn;

		// 确定右变量的 varValueType
		const rightVarValueType = isArrayMode
			? VariableValueType.ENUM
			: leftVarType;

		// 将输入值转换为正确的类型
		let typedValue: string | number | boolean | string[];

		if (isArrayMode || rightVarValueType === VariableValueType.ENUM) {
			// ENUM 类型或 isIn/isNotIn 模式：value 应该是 JSON 字符串
			try {
				const parsed = typeof value === "string" ? JSON.parse(value) : value;
				typedValue = Array.isArray(parsed) ? parsed : [];
			} catch {
				typedValue = [];
			}
		} else if (
			rightVarValueType === VariableValueType.NUMBER ||
			rightVarValueType === VariableValueType.PERCENTAGE
		) {
			typedValue = typeof value === "number" ? value : Number(value) || 0;
		} else if (rightVarValueType === VariableValueType.BOOLEAN) {
			typedValue = typeof value === "boolean" ? value : value === "true";
		} else {
			// STRING, TIME 等其他类型
			typedValue = value.toString();
		}

		// 检查是否需要更新
		if (currentRightVariable?.varType === VarType.constant) {
			const currentConst = currentRightVariable as Constant;
			if (
				currentConst.varValueType === rightVarValueType &&
				JSON.stringify(currentConst.varValue) === JSON.stringify(typedValue)
			) {
				return;
			}
		}

		const newRightVariable: Constant = {
			varType: VarType.constant,
			varValueType: rightVarValueType,
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

	const leftVarValueType = localCondition.left?.varValueType || null;
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
		<div className="flex flex-row justify-between px-2 py-2 rounded-md bg-gray-100 w-full">
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
				<div className="flex flex-col gap-1 p-2 min-h-16">
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
					<div className="flex flex-col gap-1 p-2 min-h-16">
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
							<ConstantInput
								className="w-full"
								value={getRightConstantValue()}
								onValueChange={handleUpdateRightConstantValue}
								valueType={
									localCondition.comparisonSymbol === ComparisonSymbol.isIn ||
									localCondition.comparisonSymbol === ComparisonSymbol.isNotIn
										? VariableValueType.ENUM
										: leftVarValueType || VariableValueType.NUMBER
								}
								comparisonSymbol={localCondition.comparisonSymbol}
								leftVarValueType={leftVarValueType}
							/>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default ConditionSetting;
