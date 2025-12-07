import { useReactFlow } from "@xyflow/react";
import { PlusIcon, Settings, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NodeOpConfirmDialog } from "@/components/flow/node-op-confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useWorkflowUtils from "@/hooks/flow/use-workflow-utils";
import type { IndicatorType } from "@/types/indicator";
import { getIndicatorConfig } from "@/types/indicator/indicator-config";
import type { SelectedIndicator } from "@/types/node/indicator-node";
import EditDialog from "./edit-dialog";
import IndicatorViewerDialog from "./indicator-viewer";

interface IndicatorEditorProps {
	id: string; // Node ID, used to generate handleId
	selectedIndicators: SelectedIndicator[];
	onSelectedIndicatorsChange: (indicators: SelectedIndicator[]) => void;
}

const IndicatorEditor: React.FC<IndicatorEditorProps> = ({
	id,
	selectedIndicators,
	onSelectedIndicatorsChange,
}) => {
	// Local state management
	const { t } = useTranslation();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [showIndicatorViewer, setShowIndicatorViewer] = useState(false);
	const [selectedIndicatorType, setSelectedIndicatorType] = useState<
		IndicatorType | undefined
	>(undefined);
	const [fromIndicatorViewer, setFromIndicatorViewer] = useState(false); // Flag indicating whether opened from indicator viewer
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
		setFromIndicatorViewer(true); // Mark as opened from indicator viewer
		setIsDialogOpen(true);
	};

	const handleEditIndicator = (index: number) => {
		setIsEditing(true);
		setEditingIndex(index);
		setSelectedIndicatorType(undefined);
		setFromIndicatorViewer(false); // Editing existing indicator is not from viewer
		setIsDialogOpen(true);
	};

	// Handle edit dialog close
	const handleEditDialogClose = () => {
		if (fromIndicatorViewer && !isEditing) {
			// If opening new indicator from indicator viewer, return to indicator viewer
			setIsDialogOpen(false);
			setFromIndicatorViewer(false);
			setShowIndicatorViewer(true);
		} else {
			// Otherwise close directly
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

		// If there are connected target nodes, show confirmation dialog
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

		// No connected nodes, delete directly
		performDelete(index);
	};

	// Execute deletion
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

		// Delete edges
		const sourceHandleId = indicatorToDelete.outputHandleId;
		if (sourceHandleId) {
			deleteEdgeBySourceHandleId(sourceHandleId);
		}

		const updatedIndicators = selectedIndicators.filter(
			(_, i) => i !== targetIndex,
		);
		onSelectedIndicatorsChange(updatedIndicators);

		// Clean up deletion-related state
		setPendingDeleteIndicator(null);
		setIsConfirmDialogOpen(false);
		setPendingIndicatorData(null);
	};

	const handleSave = (config: SelectedIndicator) => {
		if (isEditing && editingIndex !== null) {
			// Edit existing indicator
			const updatedIndicators = [...selectedIndicators];
			updatedIndicators[editingIndex] = config;
			onSelectedIndicatorsChange(updatedIndicators);
		} else {
			// Add new indicator
			onSelectedIndicatorsChange([...selectedIndicators, config]);
		}
		setIsDialogOpen(false);
		setFromIndicatorViewer(false); // Reset state after saving
	};

	const handleConfirmDelete = () => {
		performDelete();
	};

	const handleCancelDelete = () => {
		// Close confirmation dialog and clean up state
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
			return "Unknown configuration";
		}

		// Generate display text based on new configuration structure
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
				<span className="text-sm font-bold text-gray-700">
					{t("indicatorNode.technicalIndicators")}
				</span>
				<Button variant="ghost" size="icon" onClick={handleAddIndicator}>
					<PlusIcon className="w-4 h-4" />
				</Button>
			</div>

			<div className="space-y-2">
				{selectedIndicators.length === 0 ? (
					<div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
						{t("indicatorNode.addIndicatorHint")}
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

			{/* Edit dialog */}
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

			{/* Indicator viewer panel */}
			<IndicatorViewerDialog
				isOpen={showIndicatorViewer}
				onClose={() => setShowIndicatorViewer(false)}
				onSelectIndicator={handleSelectIndicator}
			/>

			{/* Confirm delete dialog */}
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
