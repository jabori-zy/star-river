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
	// updateCondition: (caseId: number, conditionId: number, condition: Condition) => void; // Update condition
}

// Variable dropdown selector

const ConditionSetting: React.FC<ConditionSettingProps> = ({
	variableItemList,
	condition,
	onConditionChange,
	onConditionRemove,
}) => {
	// Local condition state for editing
	const [localCondition, setLocalCondition] = useState<Condition>(condition);
	const { t } = useTranslation();
	// Synchronize local state when the incoming condition changes
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

		// If types are different, return false directly
		if (a.varType !== b.varType) {
			return false;
		}

		// If constant type
		if (a.varType === VarType.constant && b.varType === VarType.constant) {
			const aConst = a as Constant;
			const bConst = b as Constant;
			return (
				aConst.varValueType === bConst.varValueType &&
				JSON.stringify(aConst.varValue) === JSON.stringify(bConst.varValue)
			);
		}

		// If variable type
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

	// Update left node
	const handleUpdateLeftNode = (
		nodeId: string,
		nodeType: NodeType | null,
		nodeName: string,
	) => {
		const currentLeftVariable = localCondition.left;

		// Handle clear scenario (user cancels node selection)
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

		// Check if actually changed (avoid redundant updates)
		if (
			currentLeftVariable?.varType === VarType.variable &&
			currentLeftVariable.nodeId === nodeId &&
			currentLeftVariable.nodeType === nodeType &&
			currentLeftVariable.nodeName === nodeName
		) {
			return;
		}

		// Create new left variable (partial information, waiting for user to select specific variable)
		// Keep previous varValueType to avoid unnecessary type reset
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

		// Create new condition - keep right variable and comparison symbol
		// Let handleUpdateLeftVariable decide whether to clear right variable
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
	// Update left variable
	const handleUpdateLeftVariable = (
		variableId: number,
		handleId: string,
		variable: string,
		variableName: string,
		varValueType: VariableValueType,
	) => {
		const currentLeftVariable = localCondition.left;
		const currentRightVariable = localCondition.right;

		// Check if actually changed (avoid redundant updates)
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

		// Check if left variable type has changed (compared with right variable)
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

		// Intelligently handle right variable
		let newRightVariable: Variable | Constant | null = currentRightVariable;
		let newComparisonSymbol = localCondition.comparisonSymbol;

		if (hasTypeChanged) {
			// Type changed, need to check if right variable is compatible
			if (currentRightVariable) {
				const rightVarType = currentRightVariable.varValueType;

				if (rightVarType !== varValueType) {
					// Right variable type doesn't match, need to reset
					// Keep original varType (constant/variable), only update varValueType
					if (currentRightVariable.varType === VarType.constant) {
						// Was originally a constant, reset to default constant of new type
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
						// Was originally a variable, reset to empty variable of new type
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
				// If rightVarType === varValueType, keep original right variable
			}

			// Check if current comparison symbol is applicable to new variable type
			const availableSymbols = getAvailableComparisonSymbols(varValueType);
			if (availableSymbols.length === 0) {
				newComparisonSymbol = null;
			} else if (
				!localCondition.comparisonSymbol ||
				!availableSymbols.includes(localCondition.comparisonSymbol)
			) {
				// If current symbol is missing or not applicable, use first available symbol
				newComparisonSymbol = availableSymbols[0];
			}
		}
		// If type hasn't changed, keep newRightVariable = currentRightVariable

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

	// Update right node
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
			varValueType: VariableValueType.NUMBER, // Default type
		};
		const newCondition = { ...localCondition, right: newRightVariable };
		if (areConditionsEqual(localCondition, newCondition)) {
			return;
		}
		setLocalCondition(newCondition);
		// Execute callback to update condition
		onConditionChange(newCondition);
	};
	// Update right variable
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
		// Execute callback to update condition
		onConditionChange(newCondition);
	};

	// Update comparison symbol
	const handleUpdateComparisonSymbol = (comparisonSymbol: ComparisonSymbol) => {
		if (localCondition.comparisonSymbol === comparisonSymbol) {
			return;
		}

		const currentRightVariable = localCondition.right;
		let newRightVariable = currentRightVariable;

		// Check if switching to/from isIn/isNotIn
		const isNewSymbolArrayType =
			comparisonSymbol === ComparisonSymbol.isIn ||
			comparisonSymbol === ComparisonSymbol.isNotIn;

		const isOldSymbolArrayType =
			localCondition.comparisonSymbol === ComparisonSymbol.isIn ||
			localCondition.comparisonSymbol === ComparisonSymbol.isNotIn;

		const leftVarType =
			localCondition.left?.varValueType || VariableValueType.NUMBER;

		// Handle right variable type conversion
		if (currentRightVariable?.varType === VarType.constant) {
			const currentConst = currentRightVariable as Constant;

			// Case 1: Switching from non-array type to array type
			if (isNewSymbolArrayType && !isOldSymbolArrayType) {
				// When switching to isIn/isNotIn, clear right variable value, use empty array
				newRightVariable = {
					varType: VarType.constant,
					varValueType: VariableValueType.ENUM,
					varValue: [],
				};
			}
			// Case 2: Switching from array type to non-array type
			else if (!isNewSymbolArrayType && isOldSymbolArrayType) {
				const currentValue = currentConst.varValue;
				let singleValue: string | number | boolean | string[];

				if (Array.isArray(currentValue) && currentValue.length > 0) {
					singleValue = currentValue[0];
				} else {
					// Empty array, use default value
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
			// Case 3: Switching to isIn/isNotIn, but current varValueType is not ENUM
			else if (
				isNewSymbolArrayType &&
				currentConst.varValueType !== VariableValueType.ENUM
			) {
				// When switching to isIn/isNotIn, clear right variable value, use empty array
				newRightVariable = {
					varType: VarType.constant,
					varValueType: VariableValueType.ENUM,
					varValue: [],
				};
			}
		} else if (isNewSymbolArrayType && !currentRightVariable) {
			// Case 4: Switching to isIn/isNotIn, but right variable is null, create default ENUM array
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

	// Update right variable type
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
			// Constant mode: Set default value based on left variable type
			let defaultValue: string | number | boolean | string[];
			switch (leftVarType) {
				case VariableValueType.STRING:
					defaultValue = "";
					break;
				case VariableValueType.BOOLEAN:
					defaultValue = true;
					break;
				case VariableValueType.TIME:
					// Use formatted current time as default value
					defaultValue = formatDate(new Date());
					break;
				case VariableValueType.ENUM:
					// Enum type uses empty array
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
			// Variable mode
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
		// Execute callback to update condition
		onConditionChange(newCondition);
	};

	// Update right constant value (supports different types)
	const handleUpdateRightConstantValue = (value: string | number | boolean) => {
		const leftVarType =
			localCondition.left?.varValueType || VariableValueType.NUMBER;

		const currentRightVariable = localCondition.right;

		// Determine if it's isIn/isNotIn mode
		const isArrayMode =
			localCondition.comparisonSymbol === ComparisonSymbol.isIn ||
			localCondition.comparisonSymbol === ComparisonSymbol.isNotIn;

		// Determine right variable's varValueType
		const rightVarValueType = isArrayMode
			? VariableValueType.ENUM
			: leftVarType;

		// Convert input value to correct type
		let typedValue: string | number | boolean | string[];

		if (isArrayMode || rightVarValueType === VariableValueType.ENUM) {
			// ENUM type or isIn/isNotIn mode: value should be JSON string
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
			// STRING, TIME and other types
			typedValue = value.toString();
		}

		// Check if update is needed
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
		// Execute callback to update condition
		onConditionChange(newCondition);
	};

	// Determine if right variable is needed (isEmpty and isNotEmpty don't need right variable)
	const needsRightVariable =
		localCondition.comparisonSymbol !== ComparisonSymbol.isEmpty &&
		localCondition.comparisonSymbol !== ComparisonSymbol.isNotEmpty;

	const leftVarValueType = localCondition.left?.varValueType || null;
	const rightVarType = localCondition.right?.varType || null;

	// Get right constant value
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

	// Get right variable whitelist type (only keep this type)
	const getRightVariableWhitelist = (): VariableValueType | null => {
		const leftVarType = localCondition.left?.varValueType;
		const comparisonSymbol = localCondition.comparisonSymbol;

		// If comparison symbol is isIn or isNotIn, right variable must be ENUM type (whitelist)
		if (
			comparisonSymbol === ComparisonSymbol.isIn ||
			comparisonSymbol === ComparisonSymbol.isNotIn
		) {
			return VariableValueType.ENUM;
		}

		// If left variable is ENUM type, don't use whitelist (handled by blacklist)
		if (leftVarType === VariableValueType.ENUM) {
			return null;
		}

		// In other cases, use left variable's type as whitelist
		return leftVarType || null;
	};

	// Get right variable blacklist type (exclude this type)
	const getRightVariableBlacklist = (): VariableValueType | null => {
		const leftVarType = localCondition.left?.varValueType;

		// If left variable is ENUM type, blacklist excludes ENUM
		if (leftVarType === VariableValueType.ENUM) {
			return VariableValueType.ENUM;
		}

		// Don't use blacklist in other cases
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
					{/* Left variable selector */}
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
