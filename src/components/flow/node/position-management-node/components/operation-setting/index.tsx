import { useState } from "react";
import { type PositionOperationConfig } from "@/types/node/position-management-node";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import OperationConfigItem from "./operation-config-item";
import OperationConfigDialog from "./operation-config-dialog";

interface OperationSettingProps {
    nodeId: string;
    operationConfigs: PositionOperationConfig[];
    onOperationConfigsChange: (operationConfigs: PositionOperationConfig[]) => void;
}

const OperationSetting: React.FC<OperationSettingProps> = ({ 
    nodeId,
    operationConfigs,
    onOperationConfigsChange 
}) => {
    // 本地状态管理
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);  
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleAddOperation = () => {
        setIsEditing(false);
        setEditingIndex(null);
        setIsDialogOpen(true);
    };

    const handleEditOperation = (index: number) => {
        setIsEditing(true);
        setEditingIndex(index);
        setIsDialogOpen(true);
    };

    const handleDeleteOperation = (index: number) => {
        const updatedOperations = operationConfigs
            .filter((_, i) => i !== index)
            .map((operation, newIndex) => ({
                ...operation,
                positionOperationId: newIndex + 1, // 重新分配id，保持连续性
                inputHandleId: `${nodeId}_input${newIndex + 1}` // 重新分配inputHandleId
            }));
        onOperationConfigsChange(updatedOperations);
    };

    // 检查交易对+操作类型的唯一性
    const checkUniqueness = (symbol: string | null, operation: string, excludeIndex?: number) => {
        return !operationConfigs.some((config, index) => 
            index !== excludeIndex && 
            config.symbol === symbol && 
            config.positionOperation === operation
        );
    };

    const handleSave = (operationConfig: PositionOperationConfig) => {
        // 检查唯一性
        if (!checkUniqueness(
            operationConfig.symbol, 
            operationConfig.positionOperation, 
            isEditing ? editingIndex || undefined : undefined
        )) {
            // 如果不唯一，可以在这里显示错误信息
            alert('相同交易对和操作类型的配置已存在！');
            return;
        }

        if (isEditing && editingIndex !== null) {
            const updatedOperations = [...operationConfigs];
            updatedOperations[editingIndex] = operationConfig;
            onOperationConfigsChange(updatedOperations);
        } else {
            // 新增操作时，设置positionOperationId和inputHandleId
            const newOperationId = operationConfigs.length + 1;
            const newOperationConfig = {
                ...operationConfig,
                positionOperationId: newOperationId,
                inputHandleId: `${nodeId}_input${newOperationId}`
            };
            onOperationConfigsChange([...operationConfigs, newOperationConfig]);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">
                    操作配置
                </label>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleAddOperation}
                >
                    <PlusIcon className="w-4 h-4" />
                </Button>
            </div>
            
            <div className="space-y-2">
                {operationConfigs.length === 0 ? (
                    <div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
                        点击+号添加操作配置
                    </div>
                ) : (
                    operationConfigs.map((config, index) => (
                        <OperationConfigItem
                            key={index}
                            config={config}
                            index={index}
                            onEdit={handleEditOperation}
                            onDelete={handleDeleteOperation}
                        />
                    ))
                )}
            </div>

            <OperationConfigDialog
                isOpen={isDialogOpen}
                isEditing={isEditing}
                editingConfig={editingIndex !== null ? operationConfigs[editingIndex] : undefined}
                onOpenChange={setIsDialogOpen}
                onSave={handleSave}
                existingConfigs={operationConfigs}
                editingIndex={editingIndex}
            />
        </div>
    );
};

export default OperationSetting;
