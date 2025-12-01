import { useEffect, useState } from "react";
import { DateTimePicker24h } from "@/components/datetime-picker";
import { formatDate } from "@/components/flow/node/node-utils";
import { PercentInput } from "@/components/input-components/percent-input";
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
import { getVariableTypeOptions } from "./constant";
import { useTranslation } from "react-i18next";

interface VariableDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (variable: CustomVariable) => void;
	editingVariable?: CustomVariable;
	currentVariables: CustomVariable[];
}

// Variable dialog component
export const VariableDialog = ({
	isOpen,
	onOpenChange,
	onSave,
	editingVariable,
	currentVariables,
}: VariableDialogProps) => {
	const { t } = useTranslation();
	const [variableName, setVariableName] = useState<string>("");
	const [variableDisplayName, setVariableDisplayName] = useState<string>("");
	const [variableType, setVariableType] = useState<VariableValueType>(
		VariableValueType.NUMBER,
	);
	const [variableValue, setVariableValue] = useState<string>("");
	const [nameError, setNameError] = useState<string>("");

	// Reset state when dialog opens or editing variable changes
	useEffect(() => {
		if (isOpen) {
			if (editingVariable) {
				setVariableName(editingVariable.varName);
				setVariableDisplayName(editingVariable.varDisplayName);
				setVariableType(editingVariable.varValueType);
				// If ENUM type, convert array to JSON string
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

	// Validate variable name
	const validateVariableName = (varName: string): boolean => {
		if (!varName) {
			setNameError(t("startNode.variableNameIsEmpty"));
			return false;
		}

		const nameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
		if (!nameRegex.test(varName)) {
			setNameError(t("startNode.variableNameMustStartWithLetterOrUnderscore"));
			return false;
		}

		if (
			currentVariables.some(
				(v) => v.varName === varName && v.varName !== editingVariable?.varName,
			)
		) {
			setNameError(t("startNode.variableNameAlreadyExists"));
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

		// Convert value based on type
		let finalValue: string | number | boolean | string[] = variableValue;
		if (variableType === VariableValueType.NUMBER) {
			finalValue = variableValue === "" ? 0 : parseFloat(variableValue);
		} else if (variableType === VariableValueType.PERCENTAGE) {
			// Percentage type is also saved as number
			finalValue = variableValue === "" ? 0 : parseFloat(variableValue);
		} else if (variableType === VariableValueType.BOOLEAN) {
			finalValue = variableValue === "true";
		} else if (variableType === VariableValueType.ENUM) {
			// Parse JSON string to array
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
					<DialogTitle>{editingVariable ? t("startNode.editVariable") : t("startNode.addVariable")}</DialogTitle>
					<DialogDescription>
						{t("startNode.addVariableDescription")}
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="space-y-2">
						<Label>{t("strategy.variable.variableType")}</Label>
						<SelectInDialog
							id="variable-type"
							value={variableType}
							onValueChange={(value) => {
								const newType = value as VariableValueType;
								setVariableType(newType);
								// Reset variable value when type changes
								if (newType === VariableValueType.BOOLEAN) {
									setVariableValue("true");
								} else if (newType === VariableValueType.TIME) {
									setVariableValue(formatDate(new Date()));
								} else if (newType === VariableValueType.ENUM) {
									setVariableValue(JSON.stringify([])); // Enum type defaults to empty array
								} else {
									setVariableValue("");
								}
							}}
							options={getVariableTypeOptions(t)}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="variable-name">{t("strategy.variable.variableName")}</Label>
						<Input
							id="variable-name"
							value={variableName}
							onChange={(e) => {
								setVariableName(e.target.value);
								validateVariableName(e.target.value);
							}}
							placeholder={t("startNode.forExample") + ": threshold_value"}
							className={nameError ? "border-red-500" : ""}
							disabled={!!editingVariable} // Variable name cannot be modified in edit mode
						/>
						{nameError && <p className="text-xs text-red-500">{nameError}</p>}
					</div>
					<div className="space-y-2">
						<Label htmlFor="variable-display-name">{t("startNode.showName")}</Label>
						<Input
							id="variable-display-name"
							value={variableDisplayName}
							onChange={(e) => setVariableDisplayName(e.target.value)}
							placeholder={t("startNode.forExample") + ": threshold"}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="variable-value">{t("startNode.initialValue")}</Label>
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
								// placeholder={t("startNode.noElement")}
								creatable={true}
								emptyIndicator={
									<p className="text-center text-sm text-muted-foreground">
										{t("startNode.addElementHint")}
									</p>
								}
							/>
						) : variableType === VariableValueType.PERCENTAGE ? (
							<PercentInput
								id="variable-value"
								value={variableValue}
								onChange={handleValueChange}
								placeholder={t("startNode.forExample") + ": 5"}
							/>
						) : (
							<Input
								id="variable-value"
								value={variableValue}
								onChange={(e) => handleValueChange(e.target.value)}
								placeholder={
									variableType === VariableValueType.NUMBER
										? t("startNode.forExample") + ": 0.05"
										: t("startNode.forExample") + ": BTC/USDT"
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
						{t("common.cancel")}
					</Button>
					<Button onClick={handleSave}>{t("common.save")}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

