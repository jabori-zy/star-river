import { PositionManagementNodeData } from "@/types/node/position-management-node";
import { PositionHandleItem } from "../position-handle-item/index";

interface BacktestModeShowProps {
    id: string;
    data: PositionManagementNodeData;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({ id, data }) => {
    // 获取回测模式配置
    const backtestConfig = data.backtestConfig;
    
    // 如果没有配置或者没有仓位操作，显示提示信息
    if (!backtestConfig || !backtestConfig.positionOperations || backtestConfig.positionOperations.length === 0) {
        return (
            <div className="text-sm text-muted-foreground p-2 text-center">
                暂无仓位操作配置
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* 渲染所有的仓位操作 */}
            {backtestConfig.positionOperations.map((operationConfig) => (
                <PositionHandleItem
                    key={operationConfig.positionOperationId}
                    id={id}
                    operationConfig={operationConfig}
                />
            ))}
        </div>
    );
};

export default BacktestModeShow;
