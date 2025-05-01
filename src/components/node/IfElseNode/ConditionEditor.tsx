import { Node, useReactFlow } from '@xyflow/react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CaseItem, Condition, ComparisonOperator, VarType, LogicalOperator, RightVariable } from "@/types/ifElseNode"
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { X, Trash2 } from 'lucide-react'
import { IndicatorNodeData } from '@/types/indicatorNode';
import { IndicatorValueItem } from '@/types/indicatorValue';

// 渲染带清除按钮的选择器组件
const renderSelectWithClear = (
    value: string | null, 
    onChange: (value: string | null) => void, 
    placeholder: string,
    items: Array<{id: string, label: string}>,
    width?: string
) => (
    <div className="relative group">
        <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className={`h-7 text-xs border-0 bg-transparent ${width || ''}`}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                        {item.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
        {value && (
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

interface ConditionEditorProps {
    cases: CaseItem[];
    setCases: (cases: CaseItem[]) => void;
    sourceNodes: Node[];
}

const ConditionEditor = ({ cases, setCases, sourceNodes }: ConditionEditorProps) => {
    const { getNode } = useReactFlow();

    // 获取节点的输出值
    const getOutputValue = (nodeId: string | null) => {
        if (!nodeId) return [];
        const node = getNode(nodeId);
        if (!node) return [];

        // 判断节点的类型
        if (node.type === 'indicatorNode') {
            // 这里可以转换成具体的类型
            const indicatorValue = (node.data as IndicatorNodeData).indicatorValue;
            if (!indicatorValue) return [];
            // 迭代indicatorValue的每个属性,取出key和showName
            const result = Object.keys(indicatorValue).map(key => {
                // 使用类型断言告诉TypeScript我们知道这个属性存在
                return {
                    id: key,
                    label: (indicatorValue as Record<string, IndicatorValueItem>)[key].showName
                }
            });
            // console.log(result);
            return result;

        } else {
            return [];
        }
    };

    const updateCondition = (caseId: number, conditionId: string, updates: Partial<Condition>) => {
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

    // 当右侧变量类型发生变化时的处理函数
    const handleRightVarTypeChange = (caseId: number, conditionId: string, newType: VarType | null) => {
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
            logicalOperator: LogicalOperator.and,
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
                            varType: null,
                            nodeId: null,
                            varibale: null
                        },
                        comparisonOperator: null,
                        rightVariable: {
                            varType: null,
                            nodeId: null,
                            varibale: null
                        }
                    }]
                }
                : caseItem
        ));
    };

    const deleteCondition = (caseId: number, conditionId: string) => {
        setCases(cases.map(caseItem => 
            caseItem.caseId === caseId 
                ? {
                    ...caseItem,
                    conditions: caseItem.conditions.filter(condition => condition.conditionId !== conditionId)
                }
                : caseItem
        ));
    };

    const setLogicalOperator = (caseId: number, logicalOperator: LogicalOperator) => {
        setCases(cases.map(caseItem => 
            caseItem.caseId === caseId 
                ? { ...caseItem, logicalOperator }
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
                                        caseItem.logicalOperator === LogicalOperator.and 
                                            ? LogicalOperator.or 
                                            : LogicalOperator.and
                                    )}
                                >
                                    {caseItem.logicalOperator === LogicalOperator.and ? 'AND' : 'OR'}
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
                                            (value) => updateCondition(caseItem.caseId, condition.conditionId!, { 
                                                leftVariable: { ...condition.leftVariable!, nodeId: value, varType: VarType.variable }
                                            }),
                                            "选择节点",
                                            sourceNodes.map(node => ({
                                                id: node.id,
                                                label: String(node.data.nodeName || node.id)
                                            }))
                                        )}
                                        {renderSelectWithClear(
                                            condition.leftVariable?.varibale ?? null,
                                            (value) => updateCondition(caseItem.caseId, condition.conditionId!, {
                                                leftVariable: { ...condition.leftVariable!, varibale: value }
                                            }),
                                            "选择变量",
                                            getOutputValue(condition.leftVariable?.nodeId ?? null)
                                        )}
                                        {renderSelectWithClear(
                                            condition.comparisonOperator,
                                            (value) => updateCondition(caseItem.caseId, condition.conditionId!, {
                                                comparisonOperator: value as ComparisonOperator
                                            }),
                                            "运算符",
                                            Object.values(ComparisonOperator).map(op => ({
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
                                                        nodeId: null,  // 确保常量时 nodeId 为 null
                                                        varibale: e.target.value 
                                                    }
                                                })}
                                                className="h-7 text-xs border-0 bg-transparent"
                                                placeholder="输入值"
                                            />
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {renderSelectWithClear(
                                                    condition.rightVariable?.nodeId ?? null,
                                                    (value) => updateCondition(caseItem.caseId, condition.conditionId!, {
                                                        rightVariable: { 
                                                            ...condition.rightVariable!,
                                                            nodeId: value,
                                                            varType: VarType.variable
                                                        }
                                                    }),
                                                    "选择节点",
                                                    sourceNodes.map(node => ({
                                                        id: node.id,
                                                        label: String(node.data.nodeName || node.id)
                                                    }))
                                                )}
                                                {renderSelectWithClear(
                                                    condition.rightVariable?.varibale ?? null,
                                                    (value) => updateCondition(caseItem.caseId, condition.conditionId!, {
                                                        rightVariable: { 
                                                            ...condition.rightVariable!,
                                                            varibale: value,
                                                            varType: VarType.variable
                                                        }
                                                    }),
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