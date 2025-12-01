import { useReactFlow } from "@xyflow/react";
import { PlusIcon, Settings, X } from "lucide-react";
import { useState } from "react";
import { NodeOpConfirmDialog } from "@/components/flow/node-op-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useWorkflowUtils from "@/hooks/flow/use-workflow-utils";
import type { IndicatorType } from "@/types/indicator";
import { getIndicatorConfig } from "@/types/indicator/indicator-config";
import type { SelectedIndicator } from "@/types/node/indicator-node";
import EditDialog from "./edit-dialog";
import IndicatorViewerDialog from "./indicator-viewer";
import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation();
	// 本地状态管理
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [showIndicatorViewer, setShowIndicatorViewer] = useState(false);
	const [selectedIndicatorType, setSelectedIndicatorType] = useState<
		IndicatorType | undefined
	>(undefined);
	const [fromIndicatorViewer, setFromIndicatorViewer] = useState(false); // 标记是否从指标浏览窗口打开的
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [pendingDeleteIndicator, setPendingDeleteIndicator] =
		useState<SelectedIndicator | null>(null);
	const [pendingIndicatorData, setPendingIndicatorData] = useState<{
		indicatorType: IndicatorType;
		targetNodeCount: number;
		targetNodeNames: string[];
	} | null>(null);

	const { deleteEdgeBySourceHandleId, getTargetNodeIdsBySourceHandleId } =
		useWorkflowUtils();
	const { getNode } = useReactFlow();

	const handleAddIndicator = () => {
		setIsEditing(false);
		setEditingIndex(null);
		setSelectedIndicatorType(undefined);
		setShowIndicatorViewer(true);
	};

	const handleSelectIndicator = (indicatorType: IndicatorType) => {
		setSelectedIndicatorType(indicatorType);
		setShowIndicatorViewer(false);
		setFromIndicatorViewer(true); // 标记从指标浏览窗口打开
		setIsDialogOpen(true);
	};

	const handleEditIndicator = (index: number) => {
		setIsEditing(true);
		setEditingIndex(index);
		setSelectedIndicatorType(undefined);
		setFromIndicatorViewer(false); // 编辑现有指标不是从浏览窗口来的
		setIsDialogOpen(true);
	};

	// 处理编辑窗口关闭
	const handleEditDialogClose = () => {
		if (fromIndicatorViewer && !isEditing) {
			// 如果是从指标浏览窗口打开的新增指标，返回指标浏览窗口
			setIsDialogOpen(false);
			setFromIndicatorViewer(false);
			setShowIndicatorViewer(true);
		} else {
			// 否则直接关闭
			setIsDialogOpen(false);
			setFromIndicatorViewer(false);
		}
	};

	const handleDeleteIndicator = (index: number) => {
		const indicatorToDelete = selectedIndicators[index];
		const targetNodeIds = getTargetNodeIdsBySourceHandleId(
			indicatorToDelete.outputHandleId,
		);

		const targetNodeNames = [
			...new Set(
				targetNodeIds
					.map((nodeId) => getNode(nodeId)?.data.nodeName as string)
					.filter(Boolean),
			),
		];

		// 如果有连接的目标节点，显示确认对话框
		if (targetNodeIds.length > 0) {
			setPendingDeleteIndicator(indicatorToDelete);
			setPendingIndicatorData({
				indicatorType: indicatorToDelete.indicatorType,
				targetNodeCount: targetNodeIds.length,
				targetNodeNames: targetNodeNames,
			});
			setIsConfirmDialogOpen(true);
			return;
		}

		// 没有连接节点，直接删除
		performDelete(index);
	};

	// 执行删除
	const performDelete = (index?: number) => {
		const targetIndex =
			index !== undefined
				? index
				: selectedIndicators.findIndex(
						(indicator) =>
							pendingDeleteIndicator &&
							indicator.indicatorType ===
								pendingDeleteIndicator.indicatorType &&
							indicator.configId === pendingDeleteIndicator.configId,
					);

		if (targetIndex === -1) return;

		const indicatorToDelete = selectedIndicators[targetIndex];

		// 删除边
		const sourceHandleId = indicatorToDelete.outputHandleId;
		if (sourceHandleId) {
			deleteEdgeBySourceHandleId(sourceHandleId);
		}

		const updatedIndicators = selectedIndicators.filter(
			(_, i) => i !== targetIndex,
		);
		onSelectedIndicatorsChange(updatedIndicators);

		// 清理删除相关状态
		setPendingDeleteIndicator(null);
		setIsConfirmDialogOpen(false);
		setPendingIndicatorData(null);
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
		setIsDialogOpen(false);
		setFromIndicatorViewer(false); // 保存后重置状态
	};

	const handleConfirmDelete = () => {
		performDelete();
	};

	const handleCancelDelete = () => {
		// 关闭确认对话框并清理状态
		setIsConfirmDialogOpen(false);
		setPendingDeleteIndicator(null);
		setPendingIndicatorData(null);
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
				parts.push(`${t(param.label)}: ${value}`);
			}
		});

		return parts.join(", ");
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<span className="text-sm font-bold text-gray-700">{t("indicatorNode.technicalIndicators")}</span>
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
							key={`${config.indicatorType}-${config.configId}`}
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
				onClose={handleEditDialogClose}
				isEditing={isEditing}
				editingIndex={editingIndex}
				selectedIndicators={selectedIndicators}
				onSave={handleSave}
				nodeId={id}
				initialIndicatorType={selectedIndicatorType}
			/>

			{/* 指标浏览面板 */}
			<IndicatorViewerDialog
				isOpen={showIndicatorViewer}
				onClose={() => setShowIndicatorViewer(false)}
				onSelectIndicator={handleSelectIndicator}
			/>

			{/* 确认删除对话框 */}
			<NodeOpConfirmDialog
				isOpen={isConfirmDialogOpen}
				onOpenChange={setIsConfirmDialogOpen}
				affectedNodeCount={pendingIndicatorData?.targetNodeCount || 0}
				affectedNodeNames={pendingIndicatorData?.targetNodeNames || []}
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
				operationType="delete"
			/>
		</div>
	);
};

export default IndicatorEditor;
