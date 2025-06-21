import { useState } from "react";
import { type FuturesOrderConfig } from "@/types/order";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import OrderConfigItem from "./order-config-item";
import OrderConfigDialog from "./order-config-dialog";

interface FuturesOrderSettingProps {
    orderConfigs: FuturesOrderConfig[];
    onOrderConfigsChange: (orderConfigs: FuturesOrderConfig[]) => void;
}

const FuturesOrderSetting: React.FC<FuturesOrderSettingProps> = ({ 
    orderConfigs,
    onOrderConfigsChange 
}) => {
    // 本地状态管理
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);  
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleAddOrder = () => {
        setIsEditing(false);
        setEditingIndex(null);
        setIsDialogOpen(true);
    };

    const handleEditOrder = (index: number) => {
        setIsEditing(true);
        setEditingIndex(index);
        setIsDialogOpen(true);
    };

    const handleDeleteOrder = (index: number) => {
        const updatedOrders = orderConfigs
            .filter((_, i) => i !== index)
            .map((order, newIndex) => ({
                ...order,
                id: newIndex + 1 // 重新分配id，保持连续性
            }));
        onOrderConfigsChange(updatedOrders);
    };

    const handleSave = (orderConfig: FuturesOrderConfig) => {
        if (isEditing && editingIndex !== null) {
            const updatedOrders = [...orderConfigs];
            updatedOrders[editingIndex] = orderConfig;
            onOrderConfigsChange(updatedOrders);
        } else {
            // 新增订单时，设置id为当前列表长度+1
            const newOrderConfig = {
                ...orderConfig,
                id: orderConfigs.length + 1
            };
            onOrderConfigsChange([...orderConfigs, newOrderConfig]);
        }
    };



    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">
                    订单配置
                </label>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleAddOrder}
                >
                    <PlusIcon className="w-4 h-4" />
                </Button>
            </div>
            
            <div className="space-y-2">
                {orderConfigs.length === 0 ? (
                    <div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
                        点击+号添加订单配置
                    </div>
                ) : (
                    orderConfigs.map((config, index) => (
                        <OrderConfigItem
                            key={index}
                            config={config}
                            index={index}
                            onEdit={handleEditOrder}
                            onDelete={handleDeleteOrder}
                        />
                    ))
                )}
            </div>

            <OrderConfigDialog
                isOpen={isDialogOpen}
                isEditing={isEditing}
                editingConfig={editingIndex !== null ? orderConfigs[editingIndex] : undefined}
                onOpenChange={setIsDialogOpen}
                onSave={handleSave}
            />
        </div>
    );
};

export default FuturesOrderSetting;
