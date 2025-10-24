import { Plus, Variable } from "lucide-react";
import { useEffect, useState } from "react";
import { DateTimePicker24h } from "@/components/datetime-picker";
import { formatDate } from "@/components/flow/node/node-utils";
import { PercentInput } from "@/components/percent-input";
import MultipleSelector, {
	type Option,
} from "@/components/select-components/multi-select";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type CustomVariable, VariableValueType } from "@/types/variable";
import { VARIABLE_TYPE_OPTIONS } from "./constant";
import { VariableItem } from "./variable-config-item";

interface VariableEditorProps {
	variables: CustomVariable[];
	onVariablesChange: (variables: CustomVariable[]) => void;
}

// 变量对话框组件
const VariableDialog = ({
	isOpen,
	onOpenChange,
	onSave,
	editingVariable,
	currentVariables,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (variable: CustomVariable) => void;
	editingVariable?: CustomVariable;
	currentVariables: CustomVariable[];
}) => {
	const [variableName, setVariableName] = useState<string>("");
	const [variableDisplayName, setVariableDisplayName] = useState<string>("");
	const [variableType, setVariableType] = useState<VariableValueType>(
		VariableValueType.NUMBER,
	);
	const [variableValue, setVariableValue] = useState<string>("");
	const [nameError, setNameError] = useState<string>("");

	// 每次对话框打开或编辑变量变化时重置状态
	useEffect(() => {
		if (isOpen) {
			if (editingVariable) {
				setVariableName(editingVariable.varName);
				setVariableDisplayName(editingVariable.varDisplayName);
				setVariableType(editingVariable.varValueType);
				// 如果是 ENUM 类型，需要将数组转换为 JSON 字符串
				if (editingVariable.varValueType === VariableValueType.ENUM) {
					setVariableValue(
						Array.isArray(editingVariable.varValue)
							? JSON.stringify(editingVariable.varValue)
							: "[]",
					);
				} else {
					setVariableValue(editingVariable.varValue?.toString() || "");
				}
			} else {
				resetForm();
			}
			setNameError("");
		}
	}, [isOpen, editingVariable]);

	const resetForm = () => {
		setVariableName("");
		setVariableDisplayName("");
		setVariableType(VariableValueType.NUMBER);
		setVariableValue("");
		setNameError("");
	};

	// 检查变量名是否符合规则
	const validateVariableName = (varName: string): boolean => {
		if (!varName) {
			setNameError("变量名不能为空");
			return false;
		}

		const nameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
		if (!nameRegex.test(varName)) {
			setNameError("变量名必须以字母或下划线开头，只能包含字母、数字和下划线");
			return false;
		}

		if (
			currentVariables.some(
				(v) => v.varName === varName && v.varName !== editingVariable?.varName,
			)
		) {
			setNameError("变量名已存在");
			return false;
		}

		setNameError("");
		return true;
	};

	const handleValueChange = (value: string) => {
		setVariableValue(value);
	};

	const handleSave = () => {
		if (!validateVariableName(variableName) || !variableDisplayName) {
			return;
		}

		// 根据类型转换值
		let finalValue: string | number | boolean | string[] = variableValue;
		if (variableType === VariableValueType.NUMBER) {
			finalValue = variableValue === "" ? 0 : parseFloat(variableValue);
		} else if (variableType === VariableValueType.PERCENTAGE) {
			// 百分比类型也保存为数字
			finalValue = variableValue === "" ? 0 : parseFloat(variableValue);
		} else if (variableType === VariableValueType.BOOLEAN) {
			finalValue = variableValue === "true";
		} else if (variableType === VariableValueType.ENUM) {
			// 将 JSON 字符串解析为数组
			try {
				finalValue = JSON.parse(variableValue || "[]");
			} catch {
				finalValue = [];
			}
		}

		onSave({
			varType: "custom",
			varName: variableName,
			varDisplayName: variableDisplayName,
			varValueType: variableType,
			initialValue: finalValue,
			previousValue: finalValue,
			varValue: finalValue,
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{editingVariable ? "编辑变量" : "添加变量"}</DialogTitle>
					<DialogDescription>
						为策略添加可配置的变量，运行时可根据变量值调整策略行为。
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="space-y-2">
						<Label>变量类型</Label>
						<SelectInDialog
							id="variable-type"
							value={variableType}
							onValueChange={(value) => {
								const newType = value as VariableValueType;
								setVariableType(newType);
								// 切换类型时重置变量值
								if (newType === VariableValueType.BOOLEAN) {
									setVariableValue("true");
								} else if (newType === VariableValueType.TIME) {
									setVariableValue(formatDate(new Date()));
								} else if (newType === VariableValueType.ENUM) {
									setVariableValue(JSON.stringify([])); // 枚举类型默认为空数组
								} else {
									setVariableValue("");
								}
							}}
							placeholder="选择变量类型"
							options={VARIABLE_TYPE_OPTIONS}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="variable-name">变量名</Label>
						<Input
							id="variable-name"
							value={variableName}
							onChange={(e) => {
								setVariableName(e.target.value);
								validateVariableName(e.target.value);
							}}
							placeholder="如: threshold_value"
							className={nameError ? "border-red-500" : ""}
							disabled={!!editingVariable} // 编辑模式下不允许修改变量名
						/>
						{nameError && <p className="text-xs text-red-500">{nameError}</p>}
					</div>
					<div className="space-y-2">
						<Label htmlFor="variable-display-name">显示名称</Label>
						<Input
							id="variable-display-name"
							value={variableDisplayName}
							onChange={(e) => setVariableDisplayName(e.target.value)}
							placeholder="如: 阈值"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="variable-value">初始值</Label>
						{variableType === VariableValueType.BOOLEAN ? (
							<RadioGroup
								value={variableValue || "true"}
								onValueChange={handleValueChange}
								className="flex items-center gap-4"
							>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="true" id="bool-true" />
									<Label
										htmlFor="bool-true"
										className="cursor-pointer font-normal"
									>
										True
									</Label>
								</div>
								<div className="flex items-center space-x-2">
									<RadioGroupItem value="false" id="bool-false" />
									<Label
										htmlFor="bool-false"
										className="cursor-pointer font-normal"
									>
										False
									</Label>
								</div>
							</RadioGroup>
						) : variableType === VariableValueType.TIME ? (
							<DateTimePicker24h
								value={variableValue ? new Date(variableValue) : undefined}
								onChange={(date) => {
									const formattedDate = formatDate(date);
									handleValueChange(formattedDate);
								}}
								showSeconds={true}
								useDialogPopover
							/>
						) : variableType === VariableValueType.ENUM ? (
							<MultipleSelector
								value={(() => {
									try {
										const parsedValue = JSON.parse(variableValue || "[]");
										return Array.isArray(parsedValue)
											? parsedValue.map((v: string) => ({ value: v, label: v }))
											: [];
									} catch {
										return [];
									}
								})()}
								onChange={(options: Option[]) => {
									const values = options.map((opt) => opt.value);
									handleValueChange(JSON.stringify(values));
								}}
								placeholder="输入选项后按回车添加"
								creatable={true}
								emptyIndicator={
									<p className="text-center text-sm text-muted-foreground">
										暂无选项，输入后按回车添加
									</p>
								}
							/>
						) : variableType === VariableValueType.PERCENTAGE ? (
							<PercentInput
								id="variable-value"
								value={variableValue}
								onChange={handleValueChange}
								placeholder="如: 5"
							/>
						) : (
							<Input
								id="variable-value"
								value={variableValue}
								onChange={(e) => handleValueChange(e.target.value)}
								placeholder={
									variableType === VariableValueType.NUMBER
										? "如: 0.05"
										: "如: BTC/USDT"
								}
								type={
									variableType === VariableValueType.NUMBER ? "number" : "text"
								}
							/>
						)}
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						取消
					</Button>
					<Button onClick={handleSave}>保存</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

// 主变量编辑器组件
const VariableEditor = ({
	variables,
	onVariablesChange,
}: VariableEditorProps) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingVariable, setEditingVariable] = useState<
		CustomVariable | undefined
	>(undefined);

	const handleAddVariable = () => {
		setEditingVariable(undefined);
		setIsDialogOpen(true);
	};

	const handleEditVariable = (variable: CustomVariable) => {
		setEditingVariable(variable);
		setIsDialogOpen(true);
	};

	const handleDeleteVariable = (varName: string) => {
		const newVariables = variables.filter((v) => v.varName !== varName);
		onVariablesChange(newVariables);
	};

	const handleSaveVariable = (variable: CustomVariable) => {
		let newVariables: CustomVariable[];

		if (editingVariable) {
			// 编辑现有变量
			newVariables = variables.map((v) =>
				v.varName === editingVariable.varName ? variable : v,
			);
		} else {
			// 添加新变量
			newVariables = [...variables, variable];
		}

		onVariablesChange(newVariables);
		setIsDialogOpen(false);
		setEditingVariable(undefined);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Variable className="h-4 w-4 text-muted-foreground" />
					<span className="font-medium text-sm">策略变量</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="flex items-center gap-2 text-xs"
					onClick={handleAddVariable}
				>
					<Plus className="h-3.5 w-3.5" />
					添加变量
				</Button>
			</div>

			<div className="space-y-2">
				{variables.length === 0 ? (
					<div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
						暂无策略变量
					</div>
				) : (
					variables.map((variable) => (
						<VariableItem
							key={variable.varName}
							variable={variable}
							onEdit={handleEditVariable}
							onDelete={handleDeleteVariable}
						/>
					))
				)}
			</div>

			<VariableDialog
				isOpen={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				onSave={handleSaveVariable}
				editingVariable={editingVariable}
				currentVariables={variables}
			/>
		</div>
	);
};

export default VariableEditor;
