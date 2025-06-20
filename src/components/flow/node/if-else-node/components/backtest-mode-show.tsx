import { IfElseNodeData } from "@/types/node/if-else-node";
import { IfElseCaseItem, ElseCaseItem } from "./case-handle-item/index";

interface BacktestModeShowProps {
    id: string;
    data: IfElseNodeData;
}

const BacktestModeShow: React.FC<BacktestModeShowProps> = ({ id, data }) => {
    // 获取回测模式配置
    const backtestConfig = data.backtestConfig;
    
    // 如果没有配置或者没有cases，显示提示信息
    if (!backtestConfig || !backtestConfig.cases || backtestConfig.cases.length === 0) {
        return (
            <div className="text-sm text-muted-foreground p-2 text-center">
                暂无条件配置
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* 渲染所有的条件case */}
            {backtestConfig.cases.map((caseItem) => (
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

export default BacktestModeShow;
