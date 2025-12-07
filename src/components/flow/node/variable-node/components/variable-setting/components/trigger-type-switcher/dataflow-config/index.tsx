import { CircleAlert } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DataflowErrorType } from "@/types/node/variable-node";
import { VALUE_TYPE_SUPPORT_POLICY } from "@/types/node/variable-node";
import { ErrorPolicyConfig } from "./error-policy-config";
import { ExpireDurationSection } from "./expire-duration-section";
import type { DataflowConfigProps } from "./types";
import {
	getErrorTypeValidationError,
	validateReplaceValue,
} from "./validation";

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

	// Dynamically get supported error types based on variable type
	const supportedErrorTypes: DataflowErrorType[] = replaceValueType
		? VALUE_TYPE_SUPPORT_POLICY[replaceValueType]
		: ["nullValue", "expired", "zeroValue"];

	// Validate if the entire dataflow configuration is valid
	useEffect(() => {
		if (!onValidationChange) return;

		let isValid = true;

		// Check if replaceValue in all error policies is valid
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
	}, [
		errorPolicy,
		updateOperationType,
		supportedErrorTypes,
		onValidationChange,
	]);

	// Get the display name of the error type
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
			{/* Expiration duration configuration */}
			<ExpireDurationSection
				expireDuration={expireDuration}
				onExpireDurationChange={onExpireDurationChange}
			/>

			{/* Error handling strategy */}
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
