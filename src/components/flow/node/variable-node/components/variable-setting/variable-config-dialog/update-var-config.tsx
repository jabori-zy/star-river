import { Filter, Workflow } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectInDialog } from "@/components/select-components/select-in-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { VariableValueType, type CustomVariable } from "@/types/variable";
import type { UpdateOperationType } from "@/types/node/variable-node";
import { getUpdateOperationPlaceholder } from "../utils";
import UpdateVariableSelector from "./update-variable-selector";
import type { VariableItem } from "@/hooks/flow/use-strategy-workflow";
import type { NodeType } from "@/types/node/index";

interface UpdateVarConfigProps {
	variable: string;
	updateOperationType: UpdateOperationType;
	updateValue: string;
	updateTriggerType: "condition" | "dataflow";
	customVariables: CustomVariable[];
	customVariableOptions: Array<{ value: string; label: React.ReactNode }>;
	variableItemList: VariableItem[];
	dataflowNodeId: string | null;
	dataflowHandleId: string | null;
	dataflowVariable: string | null;
	dataflowVariableName: string | null;
	onVariableChange: (value: string) => void;
	onUpdateOperationTypeChange: (value: UpdateOperationType) => void;
	onUpdateValueChange: (value: string) => void;
	onUpdateTriggerTypeChange: (value: "condition" | "dataflow") => void;
	onDataflowNodeChange: (nodeId: string, nodeType: NodeType | null, nodeName: string) => void;
	onDataflowVariableChange: (variableId: number, handleId: string, variable: string, variableName: string) => void;
	getAvailableOperations: (varValueType: VariableValueType) => UpdateOperationType[];
	getUpdateOperationLabel: (type: UpdateOperationType) => string;
}

const UpdateVarConfig: React.FC<UpdateVarConfigProps> = ({
	variable,
	updateOperationType,
	updateValue,
	updateTriggerType,
	customVariables,
	customVariableOptions,
	variableItemList,
	dataflowNodeId,
	dataflowHandleId,
	dataflowVariable,
	dataflowVariableName,
	onVariableChange,
	onUpdateOperationTypeChange,
	onUpdateValueChange,
	onUpdateTriggerTypeChange,
	onDataflowNodeChange,
	onDataflowVariableChange,
	getAvailableOperations,
	getUpdateOperationLabel,
}) => {
	return (
		<>
			{/* UPDATE 模式的 UI */}
			<div className="flex flex-col gap-2">
				<Label htmlFor="updateVariable" className="text-sm font-medium">
					选择变量
				</Label>
				<SelectInDialog
					id="updateVariable"
					value={variable}
					onValueChange={onVariableChange}
					placeholder={customVariables.length === 0 ? "无自定义变量" : "选择要更新的变量"}
					options={customVariableOptions}
					disabled={customVariables.length === 0}
					emptyMessage="未配置自定义变量，请在策略起点配置"
				/>
			</div>

			{/* 触发方式 */}
			<div className="space-y-1">
				<Label className="text-sm font-medium">触发方式</Label>
				<div className="flex items-center space-x-6 pt-1">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="update-condition-trigger"
							checked={updateTriggerType === "condition"}
							onCheckedChange={(checked) => {
								if (checked) {
									onUpdateTriggerTypeChange("condition");
								}
							}}
						/>
						<Label
							htmlFor="update-condition-trigger"
							className="text-sm cursor-pointer flex items-center"
						>
							<Filter className="h-3.5 w-3.5 mr-1 text-orange-500" />
							条件触发
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="update-dataflow-trigger"
							checked={updateTriggerType === "dataflow"}
							onCheckedChange={(checked) => {
								if (checked) {
									onUpdateTriggerTypeChange("dataflow");
								}
							}}
						/>
						<Label
							htmlFor="update-dataflow-trigger"
							className="text-sm cursor-pointer flex items-center"
						>
							<Workflow className="h-3.5 w-3.5 mr-1 text-blue-500" />
							数据流触发
						</Label>
					</div>
				</div>
			</div>

			{/* 数据流模式：操作符 + 上游节点变量选择器 */}
			{updateTriggerType === "dataflow" && variable && (
				<div className="flex flex-col gap-2">
					<Label htmlFor="dataflowOperation" className="text-sm font-medium">
						更新操作
					</Label>
					{(() => {
						const selectedVar = customVariables.find(
							(v: CustomVariable) => v.varName === variable
						);
						const availableOps = getAvailableOperations(
							selectedVar?.varValueType || VariableValueType.NUMBER
						);
						const availableOperationOptions = availableOps.map((op) => ({
							value: op,
							label: getUpdateOperationLabel(op),
						}));
						const isBooleanType = selectedVar?.varValueType === VariableValueType.BOOLEAN;
						const isToggleMode = updateOperationType === "toggle";

						// toggle模式单独显示
						if (isToggleMode) {
							return (
								<div className="flex flex-col gap-2">
									<SelectInDialog
										value={updateOperationType}
										onValueChange={(value) =>
											onUpdateOperationTypeChange(value as UpdateOperationType)
										}
										placeholder="选择更新操作"
										options={availableOperationOptions}
									/>
									<p className="text-xs text-muted-foreground">
										如果为 True，则切换为 False；如果为 False，则切换为 True
									</p>
								</div>
							);
						}

						// BOOLEAN类型的set操作
						if (isBooleanType && updateOperationType === "set") {
							return (
								<div className="flex items-center gap-16">
									<SelectInDialog
										value={updateOperationType}
										onValueChange={(value) =>
											onUpdateOperationTypeChange(value as UpdateOperationType)
										}
										options={availableOperationOptions}
										className="w-[64px]"
									/>
									<RadioGroup
										value={updateValue || "true"}
										onValueChange={onUpdateValueChange}
										className="flex items-center gap-4 flex-1 pl-1"
									>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="true" id="dataflow-bool-true" />
											<Label htmlFor="dataflow-bool-true" className="cursor-pointer font-normal text-sm">
												True
											</Label>
										</div>
										<div className="flex items-center space-x-2">
											<RadioGroupItem value="false" id="dataflow-bool-false" />
											<Label htmlFor="dataflow-bool-false" className="cursor-pointer font-normal text-sm">
												False
											</Label>
										</div>
									</RadioGroup>
								</div>
							);
						}

						// 数字/字符串类型：操作符 + 上游变量选择器（集成在UpdateVariableSelector内部）
						return (
							<UpdateVariableSelector
								variableItemList={variableItemList}
								selectedNodeId={dataflowNodeId}
								selectedHandleId={dataflowHandleId}
								selectedVariable={dataflowVariable}
								selectedVariableName={dataflowVariableName}
								updateOperationType={updateOperationType}
								availableOperations={availableOps}
								onNodeChange={onDataflowNodeChange}
								onVariableChange={onDataflowVariableChange}
								onOperationTypeChange={onUpdateOperationTypeChange}
							/>
						);
					})()}
				</div>
			)}

			{/* 条件触发模式：更新操作和值 - 组合在一起 */}
			{variable && updateTriggerType === "condition" && (
				<div className="flex flex-col gap-2">
					<Label htmlFor="updateOperation" className="text-sm font-medium">
						{updateOperationType === "toggle" ? "更新方式" : "更新操作"}
					</Label>
					{updateOperationType === "toggle" ? (
						// toggle 模式显示选择器和说明文案
						<div className="flex flex-col gap-2">
							<SelectInDialog
								value={updateOperationType}
								onValueChange={(value) => {
									const operation = value as UpdateOperationType;
									onUpdateOperationTypeChange(operation);
									if (operation === "toggle") {
										onUpdateValueChange("");
									}
								}}
								placeholder="选择更新操作"
								options={(() => {
									const selectedVar = customVariables.find(
										(v: CustomVariable) => v.varName === variable
									);
									return getAvailableOperations(
										selectedVar?.varValueType || VariableValueType.NUMBER
									).map((op) => ({
										value: op,
										label: getUpdateOperationLabel(op),
									}));
								})()}
							/>
							<p className="text-xs text-muted-foreground">
								如果为 True，则切换为 False；如果为 False，则切换为 True
							</p>
						</div>
					) : (
						// 其他模式显示组合控件
						(() => {
							const selectedVar = customVariables.find(
								(v: CustomVariable) => v.varName === variable
							);
							const availableOps = getAvailableOperations(
								selectedVar?.varValueType || VariableValueType.NUMBER
							);
							const availableOperationOptions = availableOps.map((op) => ({
								value: op,
								label: getUpdateOperationLabel(op),
							}));
							const isBooleanType = selectedVar?.varValueType === VariableValueType.BOOLEAN && updateOperationType === "set";

							return (
								<>
									{isBooleanType ? (
										// BOOLEAN 类型使用 RadioGroup，与 Select 在同一行
										<div className="flex items-center gap-16">
											<SelectInDialog
												value={updateOperationType}
												onValueChange={(value) => {
													const operation = value as UpdateOperationType;
													onUpdateOperationTypeChange(operation);
													if (operation === "toggle") {
														onUpdateValueChange("");
													}
												}}
												options={availableOperationOptions}
												className="w-[64px]"
											/>
											<RadioGroup
												value={updateValue || "true"}
												onValueChange={onUpdateValueChange}
												className="flex items-center gap-4 flex-1 pl-1"
											>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value="true" id="update-bool-true" />
													<Label htmlFor="update-bool-true" className="cursor-pointer font-normal text-sm">
														True
													</Label>
												</div>
												<div className="flex items-center space-x-2">
													<RadioGroupItem value="false" id="update-bool-false" />
													<Label htmlFor="update-bool-false" className="cursor-pointer font-normal text-sm">
														False
													</Label>
												</div>
											</RadioGroup>
										</div>
									) : (
										// 非 BOOLEAN 类型使用 ButtonGroup + Input
										<ButtonGroup className="w-full">
											<SelectInDialog
												value={updateOperationType}
												onValueChange={(value) => {
													const operation = value as UpdateOperationType;
													onUpdateOperationTypeChange(operation);
													if (operation === "toggle") {
														onUpdateValueChange("");
													}
												}}
												options={availableOperationOptions}
												className="w-[64px]"
											/>
											<Input
												id="updateValue"
												type="text"
												value={updateValue}
												onChange={(e) => onUpdateValueChange(e.target.value)}
												placeholder={getUpdateOperationPlaceholder(updateOperationType)}
												className="flex-1"
											/>
										</ButtonGroup>
									)}
								</>
							);
						})()
					)}
				</div>
			)}
		</>
	);
};

export default UpdateVarConfig;
