import { useState, useCallback, useMemo } from 'react';
import { 
    Handle, 
    type NodeProps, 
    Position,
    useReactFlow,
    useNodeConnections,
    Node
} from '@xyflow/react';
import { Button } from "@/components/ui/button"
import { PencilIcon, GitFork } from 'lucide-react';
import { Condition, CaseItem, VarType, LogicalOperator } from "@/types/ifElseNode";
import { TradeMode } from '@/types/node';
import IfElseNodePanel from './panel';
import { Badge } from '@/components/ui/badge';
import { getTradingModeName, getTradingModeColor } from '@/utils/tradingModeHelper';
import { useStrategyStore } from '@/store/useStrategyStore';

// 节点数据接口
interface NodeData {
    nodeName?: string;
    liveConfig?: { cases: CaseItem[] };
    simulateConfig?: { cases: CaseItem[] };
    backtestConfig?: { cases: CaseItem[] };
    cases?: CaseItem[];
}

function IfElseNode({ id, data }: NodeProps) {
    const nodeData = data as NodeData;
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [nodeName, setNodeName] = useState<string>(nodeData.nodeName || "条件分支节点");
    const { strategy } = useStrategyStore();
    const tradingMode = strategy?.tradeMode;
    const { setNodes } = useReactFlow();
    
    // 根据当前交易模式获取cases
    const getCurrentCases = useCallback(() => {
        if (!tradingMode) {
            return nodeData.cases || [];
        }
        
        switch (tradingMode) {
            case TradeMode.LIVE:
                return nodeData.liveConfig?.cases || nodeData.cases || [];
            case TradeMode.SIMULATE:
                return nodeData.simulateConfig?.cases || nodeData.cases || [];
            case TradeMode.BACKTEST:
                return nodeData.backtestConfig?.cases || nodeData.cases || [];
            default:
                return nodeData.cases || [];
        }
    }, [nodeData, tradingMode]);
    
    const initialCases = useMemo(() => {
        const cases = getCurrentCases();
        return cases.length > 0 ? cases : [{
            caseId: 1,
            logicalOperator: LogicalOperator.and,
            conditions: []
        }];
    }, [getCurrentCases]);
    
    const [cases, setCases] = useState<CaseItem[]>(initialCases);
    
    // 当节点数据或交易模式改变时，更新cases
    useMemo(() => {
        setCases(initialCases);
    }, [initialCases]);
    
    const { getNode } = useReactFlow();
    const connections = useNodeConnections({
        handleType: 'target',
    });

    const sourceNodes = connections
        .map(connection => getNode(connection.source))
        .filter((node): node is Node => node !== null);

    const handleSave = useCallback((newData: Partial<NodeData>) => {
        setNodes(nodes => 
            nodes.map(node => 
                node.id === id 
                    ? { ...node, data: { ...node.data, ...newData } }
                    : node
            )
        );
        
        // 如果存在cases字段但现在有了特定的配置，则迁移数据
        if (newData.liveConfig && newData.simulateConfig && newData.backtestConfig && nodeData.cases) {
            setNodes(nodes =>
                nodes.map(node =>
                    node.id === id
                        ? {
                            ...node,
                            data: {
                                ...node.data,
                                cases: undefined // 移除旧的cases字段
                            }
                        }
                        : node
                )
            );
        }
        setIsEditing(false);
    }, [id, setNodes, nodeData.cases]);

    // 格式化条件表达式，返回完整可读的条件
    const formatCondition = (condition: Condition) => {
        if (!condition.leftVariable || !condition.rightVariable || !condition.comparisonOperator) {
            return '未完成的条件';
        }
        
        const leftVarName = condition.leftVariable.varibale;
        const rightVarType = condition.rightVariable.varType;
        const rightVarName = condition.rightVariable.varibale;
        
        // 显示完整的变量名
        const leftPart = leftVarName || '未选择变量';
        
        const rightPart = rightVarType === VarType.constant
            ? rightVarName || '未设置'
            : rightVarName || '未选择变量';
            
        return `${leftPart} ${condition.comparisonOperator} ${rightPart}`;
    };

    // 渲染单个 case 的 Handle 和内容
    const renderCase = (caseItem: CaseItem) => (
        <div key={caseItem.caseId} 
            className="px-4 py-2 border-b border-gray-100 relative"
        >
            <div className="flex items-start gap-2">
                <Badge variant="outline" className="h-5 px-2 bg-gray-900 text-white hover:bg-gray-900 text-[10px] shrink-0">
                    条件 {caseItem.caseId}
                </Badge>
                
                <div className="flex-1 space-y-1">
                    {caseItem.conditions.length > 0 ? (
                        caseItem.conditions.map((condition, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                                {idx > 0 && caseItem.logicalOperator && (
                                    <Badge variant="outline" className="h-4 px-1 text-[9px] bg-gray-700 text-white hover:bg-gray-700">
                                        {caseItem.logicalOperator}
                                    </Badge>
                                )}
                                <div className="text-xs text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                    {formatCondition(condition)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-xs text-gray-400 italic">未设置条件</div>
                    )}
                </div>
            </div>
            <Handle 
                type="source" 
                position={Position.Right}
                id={`if_else_node_case_${caseItem.caseId}_output`}
                className="!w-3 !h-3 !border-2 !border-white !bg-gray-700 !top-[14px]"
            />
        </div>
    );

    return (
        <>
            <div 
                className="relative"
                onMouseEnter={() => setShowEditButton(true)}
                onMouseLeave={() => setShowEditButton(false)}
            >
                <div className="w-[240px] bg-white border-2 rounded-lg shadow-sm">
                    {showEditButton && (
                        <Button 
                            variant="outline" 
                            size="icon"
                            className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-white shadow-md hover:bg-gray-100 z-10"
                            onClick={() => setIsEditing(true)}
                        >
                            <PencilIcon className="h-3 w-3" />
                        </Button>
                    )}
                    
                    {/* 标题部分 */}
                    <div className="flex items-center gap-2 p-2 border-b">
                        <GitFork className="h-3.5 w-3.5 text-indigo-500" />
                        <div className="text-xs font-medium">{nodeName}</div>
                        {tradingMode && (
                            <Badge variant="secondary" className={`h-5 text-xs ${getTradingModeColor(tradingMode)}`}>
                                {getTradingModeName(tradingMode)}
                            </Badge>
                        )}
                    </div>

                    {/* 输入 Handle */}
                    <Handle 
                        type="target" 
                        position={Position.Left}
                        id="if_else_node_input"
                        className="!w-3 !h-3 !border-2 !border-white !bg-gray-700 !top-[18px]"
                    />

                    {/* 渲染所有 case */}
                    {cases.map((caseItem) => renderCase(caseItem))}

                    {/* ELSE部分 */}
                    <div className="px-4 py-2 bg-gray-50 relative">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="h-5 px-2 bg-gray-800 text-white hover:bg-gray-800 text-[10px]">
                                ELSE
                            </Badge>
                            <div className="flex-1">
                                <span className="text-xs text-gray-500">其他情况执行</span>
                            </div>
                        </div>
                        <Handle 
                            type="source" 
                            position={Position.Right}
                            id="if_else_node_else_output" 
                            className="!w-3 !h-3 !border-2 !border-white !bg-gray-700 !top-[14px]"
                        />
                    </div>
                </div>
            </div>

            <IfElseNodePanel
                id={id}
                data={{
                    nodeName,
                    liveConfig: nodeData.liveConfig,
                    simulateConfig: nodeData.simulateConfig,
                    backtestConfig: nodeData.backtestConfig,
                }}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                sourceNodes={sourceNodes}
                cases={cases}
                setCases={setCases}
                nodeName={nodeName}
                onNodeNameChange={setNodeName}
                handleSave={handleSave}
            />
        </>
    );
}

export default IfElseNode;
