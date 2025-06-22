import React from "react";
import { VariableNodeData } from "@/types/node/variable-node";
import { VariableHandleItem } from "../variable-handle-item/index";

interface SimulateModeShowProps {
    id: string;
    data: VariableNodeData;
}

const SimulateModeShow: React.FC<SimulateModeShowProps> = ({ id, data }) => {
    // 获取模拟模式配置
    const simulateConfig = data.simulateConfig;
    
    // 如果没有配置或者没有变量配置，显示提示信息
    if (!simulateConfig || !simulateConfig.variableConfigs || simulateConfig.variableConfigs.length === 0) {
        return (
            <div className="text-sm text-muted-foreground p-2 text-center">
                暂无变量配置
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* 渲染所有的变量配置 */}
            {simulateConfig.variableConfigs.map((variableConfig) => (
                <VariableHandleItem
                    key={variableConfig.configId}
                    id={id}
                    variableConfig={variableConfig}
                />
            ))}
        </div>
    );
};

export default SimulateModeShow;
