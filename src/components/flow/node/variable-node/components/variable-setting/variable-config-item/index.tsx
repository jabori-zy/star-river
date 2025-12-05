import type { TFunction } from "i18next";
import type React from "react";
import type {
	UpdateVarValueOperation,
	VariableConfig,
} from "@/types/node/variable-node";
import type { CustomVariable, VariableValueType } from "@/types/variable";
import type { SymbolSelectorOption } from "../components/symbol-selector";
import GetVarConfigItem from "./get-var-config";
import ResetVarConfigItem from "./reset-var-config";
import UpdateVarConfigItem from "./update-var-config";

interface VariableConfigItemProps {
	id: string;
	config: VariableConfig;
	index: number;
	onDelete: (index: number) => void;
	onConfigChange: (index: number, config: VariableConfig) => void;
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	symbolOptions: SymbolSelectorOption[];
	isSymbolSelectorDisabled: boolean;
	getAvailableOperations: (
		varValueType: VariableValueType,
		isDataflowMode?: boolean,
	) => UpdateVarValueOperation[];
	getUpdateOperationLabel: (
		type: UpdateVarValueOperation,
		t: TFunction,
	) => string;
	allConfigs: VariableConfig[];
}

const VariableConfigItem: React.FC<VariableConfigItemProps> = ({
	id,
	config,
	index,
	onDelete,
	onConfigChange,
	customVariables,
	customVariableOptions,
	symbolOptions,
	isSymbolSelectorDisabled,
	getAvailableOperations,
	getUpdateOperationLabel,
	allConfigs,
}) => {
	// 检测是否有重复的变量操作配置（仅针对自定义变量）
	const checkDuplicateVariableOperation = (varName: string): string | null => {
		// 检查是否是自定义变量
		const isCustomVariable = customVariables.some(
			(customVar: CustomVariable) => customVar.varName === varName,
		);

		// 只对自定义变量进行检测
		if (!isCustomVariable) {
			return null;
		}

		// 查找是否有相同变量的配置
		for (let i = 0; i < allConfigs.length; i++) {
			// 跳过当前配置自己
			if (i === index) {
				continue;
			}

			const existingConfig = allConfigs[i];

			// 如果找到相同变量名的配置
			if (existingConfig.varName === varName) {
				// 同一个自定义变量只能配置一次（get/update/reset 任选其一）
				// 返回已存在的操作类型
				return existingConfig.varOperation;
			}
		}

		return null;
	};

	const duplicateOperation = checkDuplicateVariableOperation(config.varName);

	// 根据操作类型渲染对应的配置项组件
	const renderConfigContent = () => {
		switch (config.varOperation) {
			case "get":
				return (
					<GetVarConfigItem
						id={id}
						config={config}
						onConfigChange={(updatedConfig) =>
							onConfigChange(index, updatedConfig)
						}
						onDelete={() => onDelete(index)}
						customVariables={customVariables}
						symbolOptions={symbolOptions}
						isSymbolSelectorDisabled={isSymbolSelectorDisabled}
						duplicateOperation={duplicateOperation}
					/>
				);
			case "update":
				return (
					<UpdateVarConfigItem
						id={id}
						config={config}
						onConfigChange={(updatedConfig) =>
							onConfigChange(index, updatedConfig)
						}
						onDelete={() => onDelete(index)}
						customVariables={customVariables}
						customVariableOptions={customVariableOptions}
						getAvailableOperations={getAvailableOperations}
						getUpdateOperationLabel={getUpdateOperationLabel}
						duplicateOperation={duplicateOperation}
					/>
				);
			case "reset":
				return (
					<ResetVarConfigItem
						id={id}
						config={config}
						onConfigChange={(updatedConfig) =>
							onConfigChange(index, updatedConfig)
						}
						onDelete={() => onDelete(index)}
						customVariables={customVariables}
						customVariableOptions={customVariableOptions}
						duplicateOperation={duplicateOperation}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<>
			{/* 配置内容 */}
			{renderConfigContent()}
		</>
	);
};

export default VariableConfigItem;
