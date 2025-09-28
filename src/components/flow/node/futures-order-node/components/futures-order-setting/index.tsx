import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { FuturesOrderConfig } from "@/types/order";
import OrderConfigDialog from "./order-config-dialog";
import OrderConfigItem from "./order-config-item";

interface FuturesOrderSettingProps {
	accountId: number | undefined;
	nodeId: string;
	orderConfigs: FuturesOrderConfig[];
	onOrderConfigsChange: (orderConfigs: FuturesOrderConfig[]) => void;
}

const FuturesOrderSetting: React.FC<FuturesOrderSettingProps> = ({
	accountId,
	nodeId,
	orderConfigs,
	onOrderConfigsChange,
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
				orderConfigId: newIndex + 1, // 重新分配orderConfigId，保持连续性
				inputHandleId: `${nodeId}_input_${newIndex + 1}`, // 重新分配inputHandleId
			}));
		onOrderConfigsChange(updatedOrders);
	};

	const handleSave = (orderConfig: FuturesOrderConfig) => {
		if (isEditing && editingIndex !== null) {
			const updatedOrders = [...orderConfigs];
			updatedOrders[editingIndex] = orderConfig;
			onOrderConfigsChange(updatedOrders);
		} else {
			// 新增订单时，设置orderConfigId和inputHandleId
			const newOrderConfigId = orderConfigs.length + 1;
			const newOrderConfig = {
				...orderConfig,
				orderConfigId: newOrderConfigId,
				inputHandleId: `${nodeId}_input_${newOrderConfigId}`,
			};
			onOrderConfigsChange([...orderConfigs, newOrderConfig]);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<Label className="text-sm font-bold text-gray-700">订单配置</Label>
				<Button variant="ghost" size="icon" onClick={handleAddOrder} disabled={!accountId}>
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
							key={config.orderConfigId}
							config={config}
							index={index}
							onEdit={handleEditOrder}
							onDelete={handleDeleteOrder}
						/>
					))
				)}
			</div>

			<OrderConfigDialog
				accountId={accountId}
				isOpen={isDialogOpen}
				isEditing={isEditing}
				editingConfig={
					editingIndex !== null ? orderConfigs[editingIndex] : undefined
				}
				onOpenChange={setIsDialogOpen}
				onSave={handleSave}
			/>
		</div>
	);
};

export default FuturesOrderSetting;
