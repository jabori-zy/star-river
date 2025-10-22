import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { CircleAlert } from "lucide-react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import type { DataflowErrorType } from "@/types/node/variable-node";
import { VALUE_TYPE_SUPPORT_POLICY } from "@/types/node/variable-node";
import type { DataflowConfigProps } from "./types";
import { validateReplaceValue, getErrorTypeValidationError } from "./validation";
import { ExpireDurationSection } from "./expire-duration-section";
import { ErrorPolicyConfig } from "./error-policy-config";

const DataflowConfig: React.FC<DataflowConfigProps> = ({
	expireDuration,
	errorPolicy,
	replaceValueType,
	updateOperationType,
	onExpireDurationChange,
	onErrorPolicyChange,
	onValidationChange,
}) => {
	const { t } = useTranslation();

	// 根据变量类型动态获取支持的错误类型
	const supportedErrorTypes: DataflowErrorType[] = replaceValueType
		? VALUE_TYPE_SUPPORT_POLICY[replaceValueType]
		: ["nullValue", "expired", "zeroValue"];

	// 验证整个 dataflow 配置是否有效
	useEffect(() => {
		if (!onValidationChange) return;

		let isValid = true;

		// 检查所有错误策略中的 replaceValue 是否有效
		for (const errorType of supportedErrorTypes) {
			const policy = errorPolicy[errorType];
			if (policy?.strategy === "valueReplace") {
				const validationError = validateReplaceValue(
					errorType,
					policy.replaceValue,
					updateOperationType,
				);
				if (validationError) {
					isValid = false;
					break;
				}
			}
		}

		onValidationChange(isValid);
	}, [errorPolicy, updateOperationType, supportedErrorTypes, onValidationChange]);

	// 获取异常类型的显示名称
	const getErrorTypeName = (errorType: DataflowErrorType): string => {
		const nameMap: Record<DataflowErrorType, string> = {
			nullValue: t("variableNode.dataflowConfig.nullValue"),
			expired: t("variableNode.dataflowConfig.expired"),
			zeroValue: t("variableNode.dataflowConfig.zeroValue"),
		};
		return nameMap[errorType];
	};

	return (
		<div className="space-y-4">
			{/* 过期时长配置 */}
			<ExpireDurationSection
				expireDuration={expireDuration}
				onExpireDurationChange={onExpireDurationChange}
			/>

			{/* 异常处理策略 */}
			<div className="space-y-3">
				<Label className="text-sm font-medium">
					{t("variableNode.dataflowConfig.errorHandling")}
				</Label>
				<div className="rounded-md bg-muted/100 p-2">
					<Accordion
						type="single"
						collapsible
						defaultValue="nullValue"
						className="w-full"
					>
						{supportedErrorTypes.map((errorType) => {
							const validationError = getErrorTypeValidationError(
								errorType,
								errorPolicy,
								updateOperationType,
							);
							return (
								<AccordionItem key={errorType} value={errorType}>
									<AccordionTrigger className="py-3 text-sm font-normal cursor-pointer text-foreground">
										<div className="flex items-center gap-2">
											<span>{getErrorTypeName(errorType)}</span>
											{validationError && (
												<Tooltip>
													<TooltipTrigger asChild>
														<CircleAlert className="h-4 w-4 text-red-500" />
													</TooltipTrigger>
													<TooltipContent>
														<p>{validationError}</p>
													</TooltipContent>
												</Tooltip>
											)}
										</div>
									</AccordionTrigger>
									<AccordionContent className="px-1">
										<ErrorPolicyConfig
											errorType={errorType}
											policy={errorPolicy[errorType]}
											replaceValueType={replaceValueType}
											updateOperationType={updateOperationType}
											onErrorPolicyChange={onErrorPolicyChange}
										/>
									</AccordionContent>
								</AccordionItem>
							);
						})}
					</Accordion>
				</div>
			</div>
		</div>
	);
};

export default DataflowConfig;
