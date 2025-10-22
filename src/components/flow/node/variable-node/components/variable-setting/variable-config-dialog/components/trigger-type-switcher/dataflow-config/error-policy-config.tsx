import { useTranslation } from "react-i18next";
import { SelectInDialog } from "@/components/dialog-components/select-in-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { DataflowErrorPolicy } from "@/types/node/variable-node";
import type { VariableValue } from "@/types/node/variable-node/variable-config-types";
import type { ErrorPolicyConfigProps } from "./types";
import { ReplaceValueInput } from "./replace-value-input";

export const ErrorPolicyConfig: React.FC<ErrorPolicyConfigProps> = ({
	errorType,
	policy,
	replaceValueType,
	updateOperationType,
	onErrorPolicyChange,
}) => {
	const { t } = useTranslation();

	const strategy = policy?.strategy || "skip";
	const errorLog = policy?.errorLog || { notify: false };
	const isLogEnabled = errorLog.notify;

	// 日志级别选项
	const logLevelOptions = [
		{ value: "warn", label: t("variableNode.dataflowConfig.warn") },
		{ value: "error", label: t("variableNode.dataflowConfig.error") },
	];

	const handleStrategyChange = (newStrategy: string) => {
		let updatedPolicy: DataflowErrorPolicy;

		if (newStrategy === "skip") {
			updatedPolicy = {
				strategy: "skip",
				errorLog,
			};
		} else if (newStrategy === "valueReplace") {
			updatedPolicy = {
				strategy: "valueReplace",
				replaceValue:
					(policy?.strategy === "valueReplace"
						? policy.replaceValue
						: 0) as VariableValue,
				errorLog,
			};
		} else {
			// usePreviousValue
			updatedPolicy = {
				strategy: "usePreviousValue",
				maxUseTimes:
					policy?.strategy === "usePreviousValue" ? policy.maxUseTimes : 3,
				errorLog,
			};
		}

		onErrorPolicyChange(errorType, updatedPolicy);
	};

	const handleMaxUseTimesChange = (value: string) => {
		if (strategy === "usePreviousValue") {
			onErrorPolicyChange(errorType, {
				strategy: "usePreviousValue",
				maxUseTimes: Number(value) || undefined,
				errorLog,
			});
		}
	};

	const handleLogToggle = (checked: boolean) => {
		const updatedErrorLog = checked
			? ({ notify: true as const, level: "warn" as const })
			: ({ notify: false as const });

		if (strategy === "skip") {
			onErrorPolicyChange(errorType, {
				strategy: "skip",
				errorLog: updatedErrorLog,
			});
		} else if (strategy === "valueReplace") {
			onErrorPolicyChange(errorType, {
				strategy: "valueReplace",
				replaceValue:
					(policy?.strategy === "valueReplace"
						? policy.replaceValue
						: 0) as VariableValue,
				errorLog: updatedErrorLog,
			});
		} else {
			onErrorPolicyChange(errorType, {
				strategy: "usePreviousValue",
				maxUseTimes:
					policy?.strategy === "usePreviousValue"
						? policy.maxUseTimes
						: undefined,
				errorLog: updatedErrorLog,
			});
		}
	};

	const handleLogLevelChange = (level: string) => {
		if (isLogEnabled) {
			const updatedErrorLog = {
				notify: true as const,
				level: level as "warn" | "error",
			};

			if (strategy === "skip") {
				onErrorPolicyChange(errorType, {
					strategy: "skip",
					errorLog: updatedErrorLog,
				});
			} else if (strategy === "valueReplace") {
				onErrorPolicyChange(errorType, {
					strategy: "valueReplace",
					replaceValue:
						(policy?.strategy === "valueReplace"
							? policy.replaceValue
							: 0) as VariableValue,
					errorLog: updatedErrorLog,
				});
			} else {
				onErrorPolicyChange(errorType, {
					strategy: "usePreviousValue",
					maxUseTimes:
						policy?.strategy === "usePreviousValue"
							? policy.maxUseTimes
							: undefined,
					errorLog: updatedErrorLog,
				});
			}
		}
	};

	return (
		<div className="space-y-3">
			{/* 策略选择 */}
			<div className="space-y-2">
				<RadioGroup value={strategy} onValueChange={handleStrategyChange}>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="skip" id={`${errorType}-skip`} />
						<Label
							htmlFor={`${errorType}-skip`}
							className="font-normal cursor-pointer"
						>
							{t("variableNode.dataflowConfig.skip")}
						</Label>
					</div>
					<div className="flex items-start space-x-2">
						<RadioGroupItem
							value="valueReplace"
							id={`${errorType}-valueReplace`}
						/>
						<div className="flex-1">
							<Label
								htmlFor={`${errorType}-valueReplace`}
								className="font-normal cursor-pointer"
							>
								{t("variableNode.dataflowConfig.valueReplace")}
							</Label>
							{strategy === "valueReplace" && (
								<div className="mt-2 ml-1">
									<Label className="text-xs text-muted-foreground">
										{t("variableNode.dataflowConfig.replaceWith")}
									</Label>
									<ReplaceValueInput
										errorType={errorType}
										replaceValue={
											policy?.strategy === "valueReplace"
												? policy.replaceValue
												: 0
										}
										errorLog={errorLog}
										replaceValueType={replaceValueType}
										updateOperationType={updateOperationType}
										onErrorPolicyChange={onErrorPolicyChange}
									/>
								</div>
							)}
						</div>
					</div>
					<div className="flex items-start space-x-2">
						<RadioGroupItem
							value="usePreviousValue"
							id={`${errorType}-usePreviousValue`}
						/>
						<div className="flex-1">
							<Label
								htmlFor={`${errorType}-usePreviousValue`}
								className="font-normal cursor-pointer"
							>
								{t("variableNode.dataflowConfig.usePreviousValue")}
							</Label>
							{strategy === "usePreviousValue" && (
								<div className="mt-2 ml-1">
									<Label className="text-xs text-muted-foreground">
										{t("variableNode.dataflowConfig.maxUseTimes")}
									</Label>
									<Input
										type="number"
										value={
											policy?.strategy === "usePreviousValue" &&
											policy.maxUseTimes !== undefined
												? String(policy.maxUseTimes)
												: ""
										}
										onChange={(e) => handleMaxUseTimesChange(e.target.value)}
										placeholder={t("variableNode.dataflowConfig.optional")}
										className="mt-1 h-8"
									/>
								</div>
							)}
						</div>
					</div>
				</RadioGroup>
			</div>

			{/* 错误日志配置 */}
			<div className="space-y-2">
				<div className="flex items-center space-x-2">
					<Checkbox
						id={`${errorType}-log`}
						checked={isLogEnabled}
						onCheckedChange={(checked) => handleLogToggle(checked === true)}
					/>
					<Label
						htmlFor={`${errorType}-log`}
						className="font-normal cursor-pointer"
					>
						{t("variableNode.dataflowConfig.enableLog")}
					</Label>
				</div>
				{isLogEnabled && (
					<div className="ml-6">
						<Label className="text-xs text-muted-foreground">
							{t("variableNode.dataflowConfig.logLevel")}
						</Label>
						<SelectInDialog
							value={errorLog.notify ? errorLog.level : "warn"}
							onValueChange={handleLogLevelChange}
							options={logLevelOptions}
							className="mt-1 h-8 bg-muted hover:bg-gray-200"
						/>
					</div>
				)}
			</div>
		</div>
	);
};

