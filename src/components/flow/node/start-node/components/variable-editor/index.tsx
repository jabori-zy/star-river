import { Plus, Variable } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type CustomVariable } from "@/types/variable";
import { VariableItem } from "./variable-config-item";
import { VariableDialog } from "./variable-dialog";
import { useTranslation } from "react-i18next";

interface VariableEditorProps {
	variables: CustomVariable[];
	onVariablesChange: (variables: CustomVariable[]) => void;
}

// Main variable editor component
const VariableEditor = ({
	variables,
	onVariablesChange,
}: VariableEditorProps) => {
	const { t } = useTranslation();
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
					<span className="font-medium text-sm">{t("startNode.customVariables")}</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="flex items-center gap-2 text-xs"
					onClick={handleAddVariable}
				>
					<Plus className="h-3.5 w-3.5" />
					{t("startNode.add")}
				</Button>
			</div>

			<div className="space-y-2">
				{variables.length === 0 ? (
					<div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
						{t("startNode.noVariable")}
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
