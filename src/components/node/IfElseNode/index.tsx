import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
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
import { Condition, CaseItem, VarType, LogicalOperator, ComparisonOperator } from "@/types/ifElseNode";
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

// 使用memo优化组件，防止不必要的重新渲染
const IfElseNode = memo(function IfElseNode({ id, data }: NodeProps) {
    const nodeData = data as NodeData;
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [nodeName, setNodeName] = useState<string>(nodeData.nodeName || "条件分支节点");
    const { strategy } = useStrategyStore();
    const tradingMode = strategy?.tradeMode;
    const { setNodes, getNode } = useReactFlow();
    
    // 首先获取连接的节点
    const connections = useNodeConnections({
        handleType: 'target',
    });

    const sourceNodes = connections
        .map(connection => getNode(connection.source))
        .filter((node): node is Node => node !== null);
    
    // 在获取sourceNodes后计算initialCases
    const initialCases = useMemo(() => {
        // 首先从ReactFlow中获取当前节点，确保使用最新的数据
        const currentNode = getNode(id);
        const currentNodeData = currentNode ? currentNode.data as NodeData : nodeData;
        
        // 根据最新的节点数据获取cases
        const getCasesFromCurrentNodeData = () => {
            if (!tradingMode) {
                return currentNodeData.cases || [];
            }
            
            switch (tradingMode) {
                case TradeMode.LIVE:
                    return currentNodeData.liveConfig?.cases || currentNodeData.cases || [];
                case TradeMode.SIMULATE:
                    return currentNodeData.simulateConfig?.cases || currentNodeData.cases || [];
                case TradeMode.BACKTEST:
                    return currentNodeData.backtestConfig?.cases || currentNodeData.cases || [];
                default:
                    return currentNodeData.cases || [];
            }
        };
        
        const cases = getCasesFromCurrentNodeData();
        
        // 创建一个默认case如果没有案例
        if (cases.length === 0) {
            return [{
                caseId: 1,
                logicalOperator: LogicalOperator.and,
                conditions: []
            }];
        }
        
        // 获取当前所有可用节点的ID集合
        const currentNodeIds = new Set(sourceNodes.map(node => node.id));
        
        // 检查加载的cases是否包含已被删除的节点变量，并进行清理
        // 这确保当我们加载保存的状态时，已删除节点的变量引用被正确重置
        const updatedCases = cases.map(caseItem => {
            const updatedConditions = caseItem.conditions.map(condition => {
                let updatedCondition = { ...condition };
                
                // 检查左侧变量
                if (condition.leftVariable?.nodeId && !currentNodeIds.has(condition.leftVariable.nodeId)) {
                    console.log(`初始化: 节点 ${condition.leftVariable.nodeId} 已不存在，清除左侧变量引用`);
                    updatedCondition = {
                        ...updatedCondition,
                        leftVariable: {
                            ...condition.leftVariable,
                            nodeId: null, // 清除节点ID
                            nodeName: null, // 清除节点名称
                            varibale: null,
                            variableName: null
                        }
                    };
                }
                
                // 检查右侧变量（仅当类型为变量时）
                if (
                    condition.rightVariable?.varType === VarType.variable &&
                    condition.rightVariable?.nodeId && 
                    !currentNodeIds.has(condition.rightVariable.nodeId)
                ) {
                    console.log(`初始化: 节点 ${condition.rightVariable.nodeId} 已不存在，清除右侧变量引用`);
                    updatedCondition = {
                        ...updatedCondition,
                        rightVariable: {
                            ...condition.rightVariable,
                            nodeId: null, // 清除节点ID
                            nodeName: null, // 清除节点名称
                            varibale: null,
                            variableName: null
                        }
                    };
                }
                
                return updatedCondition;
            });
            
            return {
                ...caseItem,
                conditions: updatedConditions
            };
        });
        
        return updatedCases;
    // 优化依赖项，使用sourceNodes的nodeId数组的稳定引用，避免每次渲染重新创建依赖
    }, [id, getNode, tradingMode, nodeData, 
        sourceNodes.length > 0 ? sourceNodes.map(node => node.id).join(',') : '']);
    
    const [cases, setCases] = useState<CaseItem[]>(initialCases);
    
    // 当节点数据或交易模式改变时，更新cases
    useEffect(() => {
        // 使用函数式更新，确保我们只在initialCases确实变化时更新
        setCases(prevCases => {
            // 检查initialCases和prevCases是否相等（浅比较）
            if (initialCases === prevCases) {
                return prevCases; // 返回原始状态，避免不必要的更新
            }
            return initialCases;
        });
    }, [initialCases]);
    
    // 用于记录在处理useEffect时是否手动更新了cases
    const skipNextUpdate = useRef(false);
    
    // 跟踪上一次的sourceNodes，避免不必要的更新
    const prevSourceNodesRef = useRef<string>('');
    
    // 监听sourceNodes变化，当节点被删除时重置相关条件
    useEffect(() => {
        // 如果当前正在跳过更新，则重置标志并返回
        if (skipNextUpdate.current) {
            skipNextUpdate.current = false;
            return;
        }
        
        // 创建记录当前连接的节点ID集合
        const currentNodeIds = new Set(sourceNodes.map(node => node.id));
        const currentNodeIdsString = sourceNodes.map(n => n.id).join(',');
        
        // 如果sourceNodes没有变化，直接返回
        if (prevSourceNodesRef.current === currentNodeIdsString) {
            return;
        }
        
        console.log(`${id} - 当前连接的节点:`, currentNodeIdsString);
        
        // 更新引用，用于下次比较
        prevSourceNodesRef.current = currentNodeIdsString;
        
        // 跟踪是否有节点被删除
        let hasDeletedNodes = false;
        
        // 使用函数式更新避免依赖循环
        setCases(prevCases => {
            // 检查cases中的条件，如果引用了不存在的节点，重置变量选择
            let hasChanges = false;
            
            // 检查每个条件中引用的节点是否存在
            const updatedCases = prevCases.map(caseItem => {
                const updatedConditions = caseItem.conditions.map(condition => {
                    let updatedCondition = { ...condition };
                    
                    // 检查左侧变量
                    if (condition.leftVariable?.nodeId && !currentNodeIds.has(condition.leftVariable.nodeId)) {
                        hasDeletedNodes = true;
                        // 节点不存在了，完全清除节点相关信息
                        console.log(`节点 ${condition.leftVariable.nodeId} (${condition.leftVariable.nodeName || 'unknown'}) 已被删除，重置左侧节点和变量信息`);
                        updatedCondition = {
                            ...updatedCondition,
                            leftVariable: {
                                ...condition.leftVariable,
                                nodeId: null, // 清除节点ID
                                nodeName: null, // 清除节点名称
                                varibale: null,
                                variableName: null
                            }
                        };
                        hasChanges = true;
                    }
                    
                    // 检查右侧变量（仅当类型为变量时）
                    if (
                        condition.rightVariable?.varType === VarType.variable &&
                        condition.rightVariable?.nodeId && 
                        !currentNodeIds.has(condition.rightVariable.nodeId)
                    ) {
                        hasDeletedNodes = true;
                        // 节点不存在了，完全清除节点相关信息
                        console.log(`节点 ${condition.rightVariable.nodeId} (${condition.rightVariable.nodeName || 'unknown'}) 已被删除，重置右侧节点和变量信息`);
                        updatedCondition = {
                            ...updatedCondition,
                            rightVariable: {
                                ...condition.rightVariable,
                                nodeId: null, // 清除节点ID
                                nodeName: null, // 清除节点名称
                                varibale: null,
                                variableName: null
                            }
                        };
                        hasChanges = true;
                    }
                    
                    return updatedCondition;
                });
                
                return {
                    ...caseItem,
                    conditions: updatedConditions
                };
            });
            
            // 如果存在被删除的节点，打印调试信息
            if (hasDeletedNodes) {
                console.log(`检测到节点删除事件，有 ${sourceNodes.length} 个前置节点保留`);
            }
            
            // 只有在有变化时才返回新状态，否则返回原状态避免不必要的渲染
            if (hasChanges) {
                // 标记我们手动更新了cases，这样initialCases的useEffect不会再次更新
                skipNextUpdate.current = true;
                
                // 重要：同时更新节点数据，确保UI状态和底层数据一致
                // 使用setTimeout将ReactFlow更新推迟到下一个事件循环
                // 这样可以避免同一个事件循环内的连锁反应
                setTimeout(() => {
                    // 根据当前的交易模式，更新相应配置中的cases
                    setNodes(nodes => {
                        return nodes.map(node => {
                            if (node.id === id) {
                                const updatedData = { ...node.data };
                                
                                // 根据当前交易模式更新对应配置
                                if (tradingMode === TradeMode.LIVE) {
                                    updatedData.liveConfig = {
                                        ...(updatedData.liveConfig || {}),
                                        cases: updatedCases
                                    };
                                } else if (tradingMode === TradeMode.SIMULATE) {
                                    updatedData.simulateConfig = {
                                        ...(updatedData.simulateConfig || {}),
                                        cases: updatedCases
                                    };
                                } else if (tradingMode === TradeMode.BACKTEST) {
                                    updatedData.backtestConfig = {
                                        ...(updatedData.backtestConfig || {}),
                                        cases: updatedCases
                                    };
                                } else {
                                    // 如果没有特定的交易模式，则更新通用cases
                                    updatedData.cases = updatedCases;
                                }
                                
                                return {
                                    ...node,
                                    data: updatedData
                                };
                            }
                            return node;
                        });
                    });
                }, 0);
                
                return updatedCases;
            }
            return prevCases;
        });
    }, [sourceNodes, id, tradingMode, setNodes]); // 不变的依赖

    const handleSave = useCallback((newData: Partial<NodeData>) => {
        console.log("准备保存新数据:", newData);
        console.log("当前节点数据:", nodeData);
        console.log("当前cases状态:", cases);
        
        // 创建一个全新的对象来保存数据，确保引用更新
        const dataToSave = { 
            ...newData,
            nodeName: newData.nodeName  // 确保节点名称被保存
        };
        
        // 直接从面板接收最新的配置数据，而不是从cases状态中获取
        // 因为面板中可能包含了最新的多个交易模式的配置
        
        // 使用setTimeout将ReactFlow更新推迟到下一个事件循环
        // 这样可以避免同一个事件循环内的连锁反应
        setTimeout(() => {
            // 使用函数式更新减少渲染并确保原子操作
            setNodes(nodes => {
                return nodes.map(node => 
                    node.id === id 
                        ? { 
                            ...node, 
                            data: {
                                ...node.data,
                                nodeName: dataToSave.nodeName, // 确保节点名称更新
                                liveConfig: dataToSave.liveConfig,
                                simulateConfig: dataToSave.simulateConfig,
                                backtestConfig: dataToSave.backtestConfig,
                                cases: undefined // 迁移到特定配置，不再使用通用cases
                            } 
                        }
                        : node
                );
            });
            
            // 更新本地状态以同步UI
            setNodeName(dataToSave.nodeName || nodeName);
            
            // 根据当前的交易模式更新cases状态，确保UI显示正确
            if (tradingMode === TradeMode.LIVE && dataToSave.liveConfig?.cases) {
                setCases(dataToSave.liveConfig.cases);
            } else if (tradingMode === TradeMode.SIMULATE && dataToSave.simulateConfig?.cases) {
                setCases(dataToSave.simulateConfig.cases);
            } else if (tradingMode === TradeMode.BACKTEST && dataToSave.backtestConfig?.cases) {
                setCases(dataToSave.backtestConfig.cases);
            }
        }, 0);
        
        setIsEditing(false);
    }, [id, setNodes, nodeName, setNodeName, tradingMode]);

    // 确保cases更新时重新检查条件状态
    useEffect(() => {
        // 这个空effect确保当cases更新时，整个组件会重新渲染
    }, [cases]);
    
    // 获取最新的节点名称
    const getLatestNodeName = (nodeId: string | null) => {
        if (!nodeId) return null;
        const node = getNode(nodeId);
        return node ? String(node.data.nodeName || node.id) : null;
    };

    // 获取比较运算符的颜色
    const getComparisonOpColor = (op: ComparisonOperator) => {
        switch (op) {
            case ComparisonOperator.equal:
                return "bg-blue-50 text-blue-700 border-blue-100";
            case ComparisonOperator.notEqual:
                return "bg-rose-50 text-rose-700 border-rose-100";
            case ComparisonOperator.greaterThan:
                return "bg-green-50 text-green-700 border-green-100";
            case ComparisonOperator.lessThan:
                return "bg-orange-50 text-orange-700 border-orange-100";
            case ComparisonOperator.greaterThanOrEqual:
                return "bg-teal-50 text-teal-700 border-teal-100";
            case ComparisonOperator.lessThanOrEqual:
                return "bg-purple-50 text-purple-700 border-purple-100";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    // 格式化条件表达式，返回完整可读的条件
    const formatCondition = (condition: Condition) => {
        if (!condition.leftVariable || !condition.rightVariable || !condition.comparisonOperator) {
            return '未完成的条件';
        }
        
        // 获取左侧节点和变量信息
        const leftVarName = condition.leftVariable.variableName || condition.leftVariable.varibale;
        // 实时获取最新的左侧节点名称，如果节点ID为null，则不尝试获取
        const leftNodeName = condition.leftVariable.nodeId 
            ? (getLatestNodeName(condition.leftVariable.nodeId) || condition.leftVariable.nodeName)
            : null;
            
        // 只有当两者都存在时才组合它们，否则只显示存在的部分
        let leftFullName = '未选择变量';
        if (leftNodeName && leftVarName) {
            leftFullName = `${leftNodeName} @${leftVarName}`;
        } else if (leftVarName) {
            leftFullName = leftVarName;
        } else if (leftNodeName) {
            leftFullName = `${leftNodeName}.<未选择>`;
        }
        
        const comparisonOp = condition.comparisonOperator;
        const rightVarType = condition.rightVariable.varType;
        
        // 获取右侧信息
        let rightPart = '';
        let rightFullName = '';
        
        if (rightVarType === VarType.constant) {
            // 常量直接显示值
            rightPart = condition.rightVariable.varibale || '未设置';
        } else {
            // 实时获取最新的右侧节点名称，如果节点ID为null，则不尝试获取
            const rightVarName = condition.rightVariable.variableName || condition.rightVariable.varibale;
            const rightNodeName = condition.rightVariable.nodeId
                ? (getLatestNodeName(condition.rightVariable.nodeId) || condition.rightVariable.nodeName)
                : null;
                
            // 只有当两者都存在时才组合它们，否则只显示存在的部分
            rightFullName = '未选择变量';
            if (rightNodeName && rightVarName) {
                rightFullName = `${rightNodeName} @${rightVarName}`;
            } else if (rightVarName) {
                rightFullName = rightVarName;
            } else if (rightNodeName) {
                rightFullName = `${rightNodeName}.<未选择>`;
            }
        }
        
        // 返回格式化后的条件各部分
        return {
            leftFullName,
            comparisonOp,
            rightVarType,
            rightFullName,
            rightConstantValue: rightVarType === VarType.constant ? rightPart : undefined
        };
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
                        caseItem.conditions.map((condition, idx) => {
                            const conditionData = formatCondition(condition);
                            
                            if (typeof conditionData === 'string') {
                                return (
                                    <div key={idx} className="flex items-center gap-1">
                                        {idx > 0 && caseItem.logicalOperator && (
                                            <Badge variant="outline" className="h-4 px-1 text-[9px] bg-gray-700 text-white hover:bg-gray-700">
                                                {caseItem.logicalOperator}
                                            </Badge>
                                        )}
                                        <div className="text-xs text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                            {conditionData}
                                        </div>
                                    </div>
                                );
                            }
                            
                            return (
                                <div 
                                    key={idx} 
                                    className={`flex items-center gap-1 whitespace-nowrap ${idx > 0 ? 'ml-4' : ''}`}
                                >
                                    {idx > 0 && caseItem.logicalOperator && (
                                        <Badge variant="outline" className="h-4 px-1 text-[9px] bg-gray-700 text-white hover:bg-gray-700 -ml-4">
                                            {caseItem.logicalOperator}
                                        </Badge>
                                    )}
                                    
                                    {/* 左边变量（合并节点名和变量名） */}
                                    <Badge variant="outline" className="h-5 px-1.5 text-[9px] bg-violet-50 text-violet-700 border-violet-100">
                                        {conditionData.leftFullName || '未选择变量'}
                                    </Badge>
                                    
                                    {/* 比较运算符 */}
                                    <Badge 
                                        variant="outline" 
                                        className={`h-5 px-1.5 text-[9px] ${getComparisonOpColor(conditionData.comparisonOp as ComparisonOperator)}`}
                                    >
                                        {conditionData.comparisonOp}
                                    </Badge>
                                    
                                    {/* 右边变量或常量 */}
                                    {conditionData.rightVarType === VarType.constant ? (
                                        <Badge variant="outline" className="h-5 px-1.5 text-[9px] bg-amber-50 text-amber-700 border-amber-100">
                                            {conditionData.rightConstantValue}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="h-5 px-1.5 text-[9px] bg-violet-50 text-violet-700 border-violet-100">
                                            {conditionData.rightFullName || '未选择变量'}
                                        </Badge>
                                    )}
                                </div>
                            );
                        })
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
                <div className="bg-white border-2 rounded-lg shadow-sm transition-all duration-300">
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
});

export default IfElseNode;