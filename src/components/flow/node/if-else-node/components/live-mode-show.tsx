import { IfElseNodeData } from "@/types/node/if-else-node";
import { IfElseCaseItem, ElseCaseItem } from "./case-handle-item/index";

interface LiveModeShowProps {
    id: string;
    data: IfElseNodeData;
}

const LiveModeShow: React.FC<LiveModeShowProps> = ({ id, data }) => {
    // 获取回测模式配置
    const liveConfig = data.liveConfig;
    
    // 如果没有配置或者没有cases，显示提示信息
    if (!liveConfig || !liveConfig.cases || liveConfig.cases.length === 0) {
        return (
            <div className="text-sm text-muted-foreground p-2 text-center">
                暂无条件配置
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* 渲染所有的条件case */}
            {liveConfig.cases.map((caseItem) => (
                <IfElseCaseItem
                    key={caseItem.caseId}
                    caseItem={caseItem}
                    handleId={`${id}-case-${caseItem.caseId}`}
                />
            ))}
            
            {/* 固定的ELSE分支 */}
            <ElseCaseItem
                handleId={`${id}-else`}
            />
        </div>
    );
};

export default LiveModeShow;
