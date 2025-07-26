import { PlusIcon, Settings, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IndicatorType } from "@/types/indicator";
import { getIndicatorConfig } from "@/types/indicator/indicator-config-new";
import type { SelectedIndicator } from "@/types/node/indicator-node";
import EditDialog from "./edit-dialog";

interface IndicatorEditorProps {
	id: string; // 节点ID，用于生成handleId
	selectedIndicators: SelectedIndicator[];
	onSelectedIndicatorsChange: (indicators: SelectedIndicator[]) => void;
}

const IndicatorEditor: React.FC<IndicatorEditorProps> = ({
	id,
	selectedIndicators,
	onSelectedIndicatorsChange,
}) => {
	// 本地状态管理
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	const handleAddIndicator = () => {
		setIsEditing(false);
		setEditingIndex(null);
		setIsDialogOpen(true);
	};

	const handleEditIndicator = (index: number) => {
		setIsEditing(true);
		setEditingIndex(index);
		setIsDialogOpen(true);
	};

	const handleDeleteIndicator = (index: number) => {
		const updatedIndicators = selectedIndicators.filter((_, i) => i !== index);
		onSelectedIndicatorsChange(updatedIndicators);
	};

	const handleSave = (config: SelectedIndicator) => {
		if (isEditing && editingIndex !== null) {
			// 编辑现有指标
			const updatedIndicators = [...selectedIndicators];
			updatedIndicators[editingIndex] = config;
			onSelectedIndicatorsChange(updatedIndicators);
		} else {
			// 添加新指标
			onSelectedIndicatorsChange([...selectedIndicators, config]);
		}
	};

	const getConfigDisplay = (
		indicatorType: IndicatorType,
		config: Record<string, unknown>,
	) => {
		const indicatorConfigInstance = getIndicatorConfig(indicatorType);
		if (!indicatorConfigInstance) {
			return "未知配置";
		}

		// 根据新的配置结构生成显示文本
		const parts: string[] = [];
		Object.entries(indicatorConfigInstance.params).forEach(([key, param]) => {
			const value = config[key];
			if (value !== undefined) {
				parts.push(`${param.label}: ${value}`);
			}
		});

		return parts.join(", ");
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<span className="text-sm font-bold text-gray-700">技术指标</span>
				<Button variant="ghost" size="icon" onClick={handleAddIndicator}>
					<PlusIcon className="w-4 h-4" />
				</Button>
			</div>

			<div className="space-y-2">
				{selectedIndicators.length === 0 ? (
					<div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
						点击+号添加技术指标
					</div>
				) : (
					selectedIndicators.map((config, index) => (
						<div
							key={`${config.indicatorType}-${config.indicatorId}`}
							className="flex items-center justify-between p-2 border rounded-md bg-background group"
						>
							<div className="flex items-center gap-2">
								<Badge variant="outline" className="h-5 px-1">
									{config.indicatorType}
								</Badge>
								<div className="flex items-center gap-1">
									<span className="text-xs text-muted-foreground">
										{getConfigDisplay(
											config.indicatorType,
											config.indicatorConfig,
										)}
									</span>
								</div>
							</div>
							<div className="flex items-center gap-1">
								<div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6"
										onClick={() => handleEditIndicator(index)}
									>
										<Settings className="h-3 w-3" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-6 w-6 text-destructive"
										onClick={() => handleDeleteIndicator(index)}
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							</div>
						</div>
					))
				)}
			</div>

			{/* 编辑对话框 */}
			<EditDialog
				isOpen={isDialogOpen}
				onClose={() => setIsDialogOpen(false)}
				isEditing={isEditing}
				editingIndex={editingIndex}
				selectedIndicators={selectedIndicators}
				onSave={handleSave}
				nodeId={id}
			/>
		</div>
	);
};

export default IndicatorEditor;
