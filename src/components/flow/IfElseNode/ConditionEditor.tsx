import { Node, useReactFlow } from '@xyflow/react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CaseItem, Condition, ComparisonSymbol, VarType, LogicalSymbol, RightVariable } from "@/types/node/if-else-node"
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { X, Trash2 } from 'lucide-react'
import { IndicatorNodeData } from '@/types/node/indicator-node';
import { IndicatorValueItem } from '@/types/indicator/indicatorValue';
import { GetVariableNodeData } from '@/types/node/getVariableNode';

// 渲染带清除按钮的选择器组件
const renderSelectWithClear = (
    value: string | null | undefined, 
    onChange: (value: string | null) => void, 
    placeholder: string,
    items: Array<{id: string, label: string}>,
    width?: string
) => {
    // 确保null、undefined或空字符串值被转换为undefined以显示占位符
    const displayValue = value && value.trim() !== '' ? value : undefined;
    
    return (
        <div className="relative group">
            <Select value={displayValue} onValueChange={onChange}>
                <SelectTrigger className={`h-7 text-xs border-0 bg-transparent ${width || ''}`}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {items.length > 0 ? (
                        items.map(item => (
                            <SelectItem key={item.id} value={item.id}>
                                {item.label}
                            </SelectItem>
                        ))
                    ) : (
                        <div className="py-2 px-2 text-xs text-muted-foreground">无节点连接</div>
                    )}
                </SelectContent>
            </Select>
            {value && value.trim() !== '' && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onChange(null)}
                >
                    <X className="h-3 w-3" />
                </Button>
            )}
        </div>
    );
};

interface ConditionEditorProps {
    cases: CaseItem[];
    setCases: (cases: CaseItem[]) => void;
    sourceNodes: Node[];
}

const ConditionEditor = ({ cases, setCases, sourceNodes }: ConditionEditorProps) => {
    const { getNode } = useReactFlow();

    // 从IndicatorNode获取变量
    const getIndicatorNodeVariables = (node: Node) => {
        const indicatorValue = (node.data as IndicatorNodeData).indicatorValue;
        if (!indicatorValue) return [];
        
        // 迭代indicatorValue的每个属性,取出key和showName
        return Object.keys(indicatorValue).map(key => {
            // 使用类型断言告诉TypeScript我们知道这个属性存在
            return {
                id: key,
                label: (indicatorValue as Record<string, IndicatorValueItem>)[key].showName
            }
        });
    };

    // 从GetVariableNode获取变量
    const getVariableNodeVariables = (node: Node) => {
        // 确保我们能够正确识别GetVariableNode
        if (!node || !node.data) return [];
        
        // 从节点中获取变量列表，处理不同交易模式的配置
        const variables = (node.data as GetVariableNodeData).liveConfig?.variables || 
                          (node.data as GetVariableNodeData).simulateConfig?.variables || 
                          (node.data as GetVariableNodeData).backtestConfig?.variables || [];
        
        // 确保我们能够正确处理变量数据
        if (!Array.isArray(variables) || variables.length === 0) return [];
        
        // 映射变量列表为选择器所需的格式
        return variables.map(varConfig => ({
            id: varConfig.variable, // 存储值使用variable
            label: varConfig.variableName // 显示值使用variableName
        }));
    };

    // 从LiveDataNode获取KlineData变量
    const getLiveDataNodeVariables = (node: Node) => {
        // 确保我们能够正确识别LiveDataNode
        if (!node || !node.data) return [];
        
        // 记录节点信息以排查问题
        console.log('处理LiveDataNode:', node.id, node.type);
        console.log('LiveDataNode节点数据:', node.data);
        
        // 定义LiveDataNode的固定变量列表
        return [
            { id: 'timestamp', label: '时间' },
            { id: 'open', label: '开盘价' },
            { id: 'high', label: '最高价' },
            { id: 'low', label: '最低价' },
            { id: 'close', label: '收盘价' },
            { id: 'volume', label: '成交量' }
        ];
    };

    // 获取节点的输出值
    const getOutputValue = (nodeId: string | null) => {
        if (!nodeId) return [];
        const node = getNode(nodeId);
        if (!node) return [];

        // 记录节点类型以排查问题
        console.log('正在获取节点输出值:', nodeId, node.type);

        // 判断节点的类型，确保使用正确的节点类型名称
        if (node.type === 'indicatorNode') {
            return getIndicatorNodeVariables(node);
        } else if (node.type === 'getVariableNode') {
            return getVariableNodeVariables(node);
        } else if (node.type === 'liveDataNode') {
            return getLiveDataNodeVariables(node);
        } else {
            // 调试信息，帮助确定当前节点类型
            console.log('未知节点类型:', node.type, node);
            return [];
        }
    };

    const updateCondition = (caseId: number, conditionId: string | number, updates: Partial<Condition>) => {
        setCases(cases.map(caseItem => 
            caseItem.caseId === caseId 
                ? {
                    ...caseItem,
                    conditions: caseItem.conditions.map(condition =>
                        condition.conditionId === conditionId
                            ? { ...condition, ...updates }
                            : condition
                    )
                }
                : caseItem
        ));
    };

    // 更新左侧变量时保存变量名和节点名
    const updateLeftVariable = (caseId: number, conditionId: string | number, nodeId: string | null, variableId: string | null) => {
        // 如果节点ID为null（用户清除了节点选择），则清除所有相关信息
        if (nodeId === null) {
            setCases(cases.map(caseItem => 
                caseItem.caseId === caseId 
                    ? {
                        ...caseItem,
                        conditions: caseItem.conditions.map(condition =>
                            condition.conditionId === conditionId
                                ? { 
                                    ...condition, 
                                    leftVariable: { 
                                        ...condition.leftVariable,
                                        varType: VarType.variable,
                                        nodeId: null,
                                        nodeName: null,
                                        varibale: null,
                                        variableName: null
                                    } 
                                }
                                : condition
                        )
                    }
                    : caseItem
            ));
            return;
        }
        
        const node = getNode(nodeId);
        const nodeName = node ? String(node.data.nodeName || node.id) : null;
        
        // 获取变量显示名
        let variableName = null;
        if (nodeId && variableId) {
            const outputValues = getOutputValue(nodeId);
            const selectedVariable = outputValues.find(v => v.id === variableId);
            variableName = selectedVariable ? selectedVariable.label : null;
        }
        
        // 更新条件数据
        setCases(cases.map(caseItem => 
            caseItem.caseId === caseId 
                ? {
                    ...caseItem,
                    conditions: caseItem.conditions.map(condition =>
                        condition.conditionId === conditionId
                            ? { 
                                ...condition, 
                                leftVariable: { 
                                    varType: VarType.variable,
                                    nodeId: nodeId,
                                    varibale: variableId,
                                    variableName: variableName,
                                    nodeName: nodeName
                                } 
                            }
                            : condition
                    )
                }
                : caseItem
        ));
    };

    // 更新右侧变量时保存变量名和节点名
    const updateRightVariable = (caseId: number, conditionId: string | number, nodeId: string | null, variableId: string | null) => {
        // 如果节点ID为null（用户清除了节点选择），则清除所有相关信息，但保留变量类型
        if (nodeId === null) {
            setCases(cases.map(caseItem => 
                caseItem.caseId === caseId 
                    ? {
                        ...caseItem,
                        conditions: caseItem.conditions.map(condition =>
                            condition.conditionId === conditionId
                                ? { 
                                    ...condition, 
                                    rightVariable: { 
                                        ...(condition.rightVariable || {}),
                                        varType: condition.rightVariable?.varType || VarType.variable,
                                        nodeId: null,
                                        nodeName: null,
                                        varibale: null,
                                        variableName: null
                                    } 
                                }
                                : condition
                        )
                    }
                    : caseItem
            ));
            return;
        }
        
        const node = getNode(nodeId);
        const nodeName = node ? String(node.data.nodeName || node.id) : null;
        
        // 获取变量显示名
        let variableName = null;
        if (nodeId && variableId) {
            const outputValues = getOutputValue(nodeId);
            const selectedVariable = outputValues.find(v => v.id === variableId);
            variableName = selectedVariable ? selectedVariable.label : null;
        }
        
        // 更新条件数据
        setCases(cases.map(caseItem => 
            caseItem.caseId === caseId 
                ? {
                    ...caseItem,
                    conditions: caseItem.conditions.map(condition =>
                        condition.conditionId === conditionId
                            ? { 
                                ...condition, 
                                rightVariable: { 
                                    ...(condition.rightVariable || {}),
                                    varType: VarType.variable,
                                    nodeId: nodeId,
                                    varibale: variableId,
                                    variableName: variableName,
                                    nodeName: nodeName
                                } 
                            }
                            : condition
                    )
                }
                : caseItem
        ));
    };

    // 当右侧变量类型发生变化时的处理函数
    const handleRightVarTypeChange = (caseId: number, conditionId: string | number, newType: VarType | null) => {
        setCases(cases.map(caseItem => 
            caseItem.caseId === caseId 
                ? {
                    ...caseItem,
                    conditions: caseItem.conditions.map(condition => {
                        if (condition.conditionId === conditionId) {
                            let updatedRightVar: RightVariable;

                            // 如果选择了常量类型，重置右侧变量的节点ID和变量名
                            if (newType === VarType.constant) {
                                updatedRightVar = {
                                    varType: VarType.constant,
                                    nodeId: null,
                                    varibale: condition.rightVariable?.varibale || null
                                };
                            } else {
                                // 如果选择了变量类型，保留现有值或设为null
                                updatedRightVar = {
                                    varType: VarType.variable,
                                    nodeId: condition.rightVariable?.nodeId || null,
                                    varibale: condition.rightVariable?.varibale || null
                                };
                            }

                            return {
                                ...condition,
                                rightVariable: updatedRightVar
                            };
                        }
                        return condition;
                    })
                }
                : caseItem
        ));
    };

    const addCase = () => {
        setCases([...cases, {
            caseId: cases.length + 1,
            logicalSymbol: LogicalSymbol.AND,
            conditions: []
        }]);
    };

    const deleteCase = (caseId: number) => {
        setCases(cases.filter(caseItem => caseItem.caseId !== caseId));
    };

    const addCondition = (caseId: number) => {
        setCases(cases.map(caseItem =>
            caseItem.caseId === caseId
                ? {
                    ...caseItem,
                    conditions: [...caseItem.conditions, {
                        conditionId: uuidv4(),
                        leftVariable: {
                            varType: VarType.variable,
                            nodeId: null,
                            varibale: null,
                            variableName: null,
                            nodeName: null
                        },
                        ComparisonSymbol: null,
                        rightVariable: {
                            varType: VarType.variable,
                            nodeId: null,
                            varibale: null,
                            variableName: null,
                            nodeName: null
                        }
                    }]
                }
                : caseItem
        ));
    };

    const deleteCondition = (caseId: number, conditionId: string | number) => {
        setCases(cases.map(caseItem => 
            caseItem.caseId === caseId 
                ? {
                    ...caseItem,
                    conditions: caseItem.conditions.filter(condition => condition.conditionId !== conditionId)
                }
                : caseItem
        ));
    };

    const setLogicalOperator = (caseId: number, logicalOperator: LogicalSymbol) => {
        setCases(cases.map(caseItem => 
            caseItem.caseId === caseId 
                ? { ...caseItem, logicalSymbol: logicalOperator }
                : caseItem
        ));
    };

    return (
        <div className="space-y-6">
            {cases.map((caseItem) => (
                <div key={caseItem.caseId} className="space-y-4">
                    <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                            <div className="font-medium text-sm">
                                {caseItem.caseId === 1 ? 'IF' : 'ELIF'}
                            </div>
                            {caseItem.conditions.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => setLogicalOperator(
                                        caseItem.caseId, 
                                        caseItem.logicalSymbol === LogicalSymbol.AND 
                                            ? LogicalSymbol.Or 
                                            : LogicalSymbol.AND
                                    )}
                                >
                                    {caseItem.logicalSymbol === LogicalSymbol.AND ? 'AND' : 'OR'}
                                </Button>
                            )}
                        </div>
                        {caseItem.caseId !== 1 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-muted-foreground hover:text-red-500"
                                onClick={() => deleteCase(caseItem.caseId)}
                            >
                                删除 <Trash2 className="h-3 w-3 ml-1" />
                            </Button>
                        )}
                    </div>
                    {caseItem.conditions.map((condition) => (
                        <div key={condition.conditionId} className="space-y-4 flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-md p-2 space-y-2">
                                    <div className="flex items-center gap-2">
                                        {renderSelectWithClear(
                                            condition.leftVariable?.nodeId ?? null,
                                            (value) => updateLeftVariable(
                                                caseItem.caseId, 
                                                condition.conditionId!, 
                                                value, 
                                                condition.leftVariable?.varibale ?? null
                                            ),
                                            "选择节点",
                                            sourceNodes.map(node => ({
                                                id: node.id,
                                                label: String(node.data.nodeName || node.id)
                                            }))
                                        )}
                                        {renderSelectWithClear(
                                            condition.leftVariable?.varibale ?? null,
                                            (value) => updateLeftVariable(
                                                caseItem.caseId, 
                                                condition.conditionId!, 
                                                condition.leftVariable?.nodeId ?? null, 
                                                value
                                            ),
                                            "选择变量",
                                            getOutputValue(condition.leftVariable?.nodeId ?? null)
                                        )}
                                        {renderSelectWithClear(
                                            condition.ComparisonSymbol ?? null,
                                            (value) => updateCondition(caseItem.caseId, condition.conditionId!, {
                                                ComparisonSymbol: value as ComparisonSymbol
                                            }),
                                            "运算符",
                                            Object.values(ComparisonSymbol).map(op => ({
                                                id: op,
                                                label: op
                                            })),
                                            "w-[80px]"
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {renderSelectWithClear(
                                            condition.rightVariable?.varType ?? null,
                                            (value) => handleRightVarTypeChange(caseItem.caseId, condition.conditionId!, value as VarType),
                                            "类型",
                                            Object.values(VarType).map(type => ({
                                                id: type,
                                                label: type === VarType.constant ? "常量" : "变量"
                                            })),
                                            "w-[80px]"
                                        )}
                                        {condition.rightVariable?.varType === VarType.constant ? (
                                            <Input 
                                                type="number"
                                                value={condition.rightVariable.varibale || ''}
                                                onChange={(e) => updateCondition(caseItem.caseId, condition.conditionId!, {
                                                    rightVariable: { 
                                                        varType: VarType.constant,
                                                        nodeId: null,
                                                        varibale: e.target.value,
                                                        variableName: null,
                                                        nodeName: null
                                                    }
                                                })}
                                                className="h-7 text-xs border-0 bg-transparent"
                                                placeholder="输入值"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {renderSelectWithClear(
                                                    condition.rightVariable?.nodeId ?? null,
                                                    (value) => updateRightVariable(
                                                        caseItem.caseId, 
                                                        condition.conditionId!, 
                                                        value, 
                                                        condition.rightVariable?.varibale ?? null
                                                    ),
                                                    "选择节点",
                                                    sourceNodes.map(node => ({
                                                        id: node.id,
                                                        label: String(node.data.nodeName || node.id)
                                                    }))
                                                )}
                                                {renderSelectWithClear(
                                                    condition.rightVariable?.varibale ?? null,
                                                    (value) => updateRightVariable(
                                                        caseItem.caseId, 
                                                        condition.conditionId!, 
                                                        condition.rightVariable?.nodeId ?? null, 
                                                        value
                                                    ),
                                                    "选择变量",
                                                    getOutputValue(condition.rightVariable?.nodeId ?? null)
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 group"
                                onClick={() => deleteCondition(caseItem.caseId, condition.conditionId!)}
                            >
                                <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
                            </Button>
                        </div>
                    ))}
                    <div className="flex justify-start mt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs px-3"
                            onClick={() => addCondition(caseItem.caseId)}
                        >
                            添加条件
                        </Button>
                    </div>
                </div>
            ))}
            <Button
                variant="outline"
                size="sm"
                className="w-full h-9 mt-6 border-dashed"
                onClick={() => addCase()}
            >
                +ELIF
            </Button>
        </div>
    );
};

export default ConditionEditor; 