import { useEffect, useState } from "react";
import { DateTimePicker24h } from "@/components/datetime-picker";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { formatDate } from "@/components/flow/node/node-utils";
import MultipleSelector, {
	type Option,
} from "@/components/select-components/multi-select";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";
import type { VariableValue } from "@/types/node/variable-node/variable-config-types";
import { VariableValueType } from "@/types/variable";
import type { ReplaceValueInputProps } from "./types";
import { validateReplaceValue } from "./validation";

export const ReplaceValueInput: React.FC<ReplaceValueInputProps> = ({
	errorType,
	replaceValue,
	errorLog,
	replaceValueType,
	updateOperationType,
	onErrorPolicyChange,
}) => {
	// 为数字和百分比类型使用本地状态，避免输入负数时被清空
	const [localNumberValue, setLocalNumberValue] = useState<string>("");
	const [isFocused, setIsFocused] = useState(false);

	// 同步外部值到本地状态（仅在未聚焦时）
	useEffect(() => {
		if (
			!isFocused &&
			(replaceValueType === VariableValueType.NUMBER ||
				replaceValueType === VariableValueType.PERCENTAGE)
		) {
			setLocalNumberValue(String(replaceValue ?? "0"));
		}
	}, [replaceValue, isFocused, replaceValueType]);

	const coerceReplaceValue = (rawValue: string): VariableValue => {
		if (!replaceValueType) {
			return rawValue as VariableValue;
		}

		switch (replaceValueType) {
			case VariableValueType.BOOLEAN:
				return (rawValue === "true") as VariableValue;
			case VariableValueType.NUMBER:
			case VariableValueType.PERCENTAGE: {
				if (rawValue.trim() === "") {
					return null;
				}
				const parsedNumber = Number(rawValue);
				return (
					Number.isNaN(parsedNumber) ? null : parsedNumber
				) as VariableValue;
			}
			case VariableValueType.ENUM:
				// handled separately via handleEnumValueChange
				return rawValue as VariableValue;
			default:
				return rawValue as VariableValue;
		}
	};

	const handleValueChange = (value: string) => {
		onErrorPolicyChange(errorType, {
			strategy: "valueReplace",
			replaceValue: coerceReplaceValue(value),
			errorLog,
		});
	};

	const handleEnumValueChange = (options: Option[]) => {
		const values = options.map((opt) => opt.value);
		onErrorPolicyChange(errorType, {
			strategy: "valueReplace",
			replaceValue: values as VariableValue,
			errorLog,
		});
	};

	// 数字输入处理（参考 number-type-op-editor.tsx）
	const handleNumberInput = (inputValue: string) => {
		setLocalNumberValue(inputValue);
		// 如果输入不为空且是有效数字，立即通知父组件
		if (inputValue !== "" && !Number.isNaN(Number(inputValue))) {
			handleValueChange(inputValue);
		}
	};

	const handleNumberBlur = () => {
		setIsFocused(false);
		// 失去焦点时处理输入值
		if (localNumberValue === "") {
			setLocalNumberValue("0");
			handleValueChange("0");
		} else if (Number.isNaN(Number(localNumberValue))) {
			setLocalNumberValue(String(replaceValue ?? "0"));
		} else {
			const numValue = Number(localNumberValue);
			if (numValue.toString() !== String(replaceValue)) {
				handleValueChange(numValue.toString());
			}
		}
	};

	// 解析枚举值
	const parseEnumValue = (): Option[] => {
		if (Array.isArray(replaceValue)) {
			return replaceValue.map((v) => ({ value: String(v), label: String(v) }));
		}
		try {
			const parsedValue = JSON.parse((replaceValue as string) || "[]");
			return Array.isArray(parsedValue)
				? parsedValue.map((v: string) => ({ value: v, label: v }))
				: [];
		} catch {
			return [];
		}
	};

	switch (replaceValueType) {
		case VariableValueType.BOOLEAN:
			return (
				<SelectInDialog
					value={String(replaceValue || "true")}
					onValueChange={handleValueChange}
					options={[
						{ value: "true", label: "True" },
						{ value: "false", label: "False" },
					]}
					className="mt-1 h-8 bg-muted hover:bg-gray-200"
				/>
			);

		case VariableValueType.ENUM:
			return (
				<MultipleSelector
					value={parseEnumValue()}
					onChange={handleEnumValueChange}
					placeholder="输入替换值"
					creatable={true}
					triggerSearchOnFocus={true}
					className="mt-1 min-h-9"
					emptyIndicator={
						<p className="text-center text-sm text-muted-foreground">
							输入后按回车设置数组值
						</p>
					}
				/>
			);

		case VariableValueType.STRING:
			return (
				<Input
					type="text"
					value={String(replaceValue || "")}
					onChange={(e) => handleValueChange(e.target.value)}
					className="mt-1 h-8"
				/>
			);

		case VariableValueType.TIME: {
			// 安全地解析日期值
			const getDateValue = (): Date | undefined => {
				if (!replaceValue || String(replaceValue).trim() === "") {
					return undefined;
				}
				try {
					const date = new Date(String(replaceValue));
					// 检查日期是否有效
					if (Number.isNaN(date.getTime())) {
						return undefined;
					}
					return date;
				} catch {
					return undefined;
				}
			};

			return (
				<div className="mt-1">
					<DateTimePicker24h
						value={getDateValue()}
						onChange={(date) => {
							const formattedDate = formatDate(date);
							handleValueChange(formattedDate);
						}}
						showSeconds={true}
						useDialogPopover
						className="h-8 bg-muted hover:bg-gray-200"
					/>
				</div>
			);
		}

		case VariableValueType.PERCENTAGE: {
			const validationError = validateReplaceValue(
				errorType,
				replaceValue,
				updateOperationType,
			);
			return (
				<div>
					<InputGroup className="mt-1">
						<InputGroupInput
							type="number"
							value={localNumberValue}
							onChange={(e) => handleNumberInput(e.target.value)}
							onBlur={handleNumberBlur}
							onFocus={() => setIsFocused(true)}
						/>
						<InputGroupAddon align="inline-end">
							<InputGroupText>%</InputGroupText>
						</InputGroupAddon>
					</InputGroup>
					{validationError && (
						<p className="mt-1 text-xs text-red-500">{validationError}</p>
					)}
				</div>
			);
		}

		default: {
			const validationError = validateReplaceValue(
				errorType,
				replaceValue,
				updateOperationType,
			);
			return (
				<div>
					<Input
						type="number"
						value={localNumberValue}
						onChange={(e) => handleNumberInput(e.target.value)}
						onBlur={handleNumberBlur}
						onFocus={() => setIsFocused(true)}
						className="mt-1 h-8"
					/>
					{validationError && (
						<p className="mt-1 text-xs text-red-500">{validationError}</p>
					)}
				</div>
			);
		}
	}
};
