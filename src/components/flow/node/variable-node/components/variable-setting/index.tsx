import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { VariableConfig } from "@/types/node/variable-node";
import VariableConfigDialog from "./variable-config-dialog";
import VariableConfigItem from "./variable-config-item";

interface VariableSettingProps {
	id: string;
	variableConfigs: VariableConfig[];
	onVariableConfigsChange: (variableConfigs: VariableConfig[]) => void;
}

const VariableSetting: React.FC<VariableSettingProps> = ({
	id,
	variableConfigs,
	onVariableConfigsChange,
}) => {
	// 本地状态管理
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	const handleAddVariable = () => {
		setIsEditing(false);
		setEditingIndex(null);
		setIsDialogOpen(true);
	};

	const handleEditVariable = (index: number) => {
		setIsEditing(true);
		setEditingIndex(index);
		setIsDialogOpen(true);
	};

	const handleDeleteVariable = (index: number) => {
		const updatedVariables = variableConfigs
			.filter((_, i) => i !== index)
			.map((variable, newIndex) => ({
				...variable,
				configId: newIndex + 1, // 重新分配id，保持连续性
				inputHandleId: `${id}_input_${newIndex + 1}`,
			}));
		onVariableConfigsChange(updatedVariables);
	};

	// 检查交易对+变量类型+触发方式的唯一性
	const checkUniqueness = (
		symbol: string | null,
		variable: string,
		getVariableType: string,
		excludeIndex?: number,
	) => {
		return !variableConfigs.some(
			(config, index) =>
				index !== excludeIndex &&
				config.symbol === (symbol || "") &&
				config.variable === variable &&
				config.getVariableType === getVariableType,
		);
	};

	const handleSave = (id: string, variableConfig: VariableConfig) => {
		// 检查唯一性
		if (
			!checkUniqueness(
				variableConfig.symbol || null,
				variableConfig.variable,
				variableConfig.getVariableType,
				isEditing ? editingIndex || undefined : undefined,
			)
		) {
			// 如果不唯一，可以在这里显示错误信息
			alert("相同交易对、变量类型和触发方式的配置已存在！");
			return;
		}

		if (isEditing && editingIndex !== null) {
			const updatedVariables = [...variableConfigs];
			updatedVariables[editingIndex] = variableConfig;
			onVariableConfigsChange(updatedVariables);
		} else {
			// 新增变量时，设置id为当前列表长度+1
			const newVariableConfig = {
				...variableConfig,
				configId: variableConfigs.length + 1,
				inputHandleId: `${id}_input_${variableConfigs.length + 1}`,
				outputHandleId: `${id}_output_${variableConfigs.length + 1}`,
			};
			onVariableConfigsChange([...variableConfigs, newVariableConfig]);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-bold text-gray-700">变量配置</Label>
				<Button variant="ghost" size="icon" onClick={handleAddVariable}>
					<PlusIcon className="w-4 h-4" />
				</Button>
			</div>

			<div className="space-y-2">
				{variableConfigs.length === 0 ? (
					<div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
						点击+号添加变量配置
					</div>
				) : (
					variableConfigs.map((config, index) => (
						<VariableConfigItem
							key={config.configId}
							config={config}
							index={index}
							onEdit={handleEditVariable}
							onDelete={handleDeleteVariable}
						/>
					))
				)}
			</div>

			<VariableConfigDialog
				id={id}
				isOpen={isDialogOpen}
				isEditing={isEditing}
				editingConfig={
					editingIndex !== null ? variableConfigs[editingIndex] : undefined
				}
				onOpenChange={setIsDialogOpen}
				onSave={handleSave}
				existingConfigs={variableConfigs}
				editingIndex={editingIndex}
			/>
		</div>
	);
};

export default VariableSetting;
