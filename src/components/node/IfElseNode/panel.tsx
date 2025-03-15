// 条件节点面板
import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CaseItem, Condition, ComparisonOperator, VarType, LogicalOperator } from "@/types/node"
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { X, Trash2, RefreshCw } from 'lucide-react'
import { Node } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';

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




interface IfElseNodePanelProps {
    id: string;
    data: any;
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    sourceNodes: Node[];
    cases: CaseItem[];
    setCases: (cases: CaseItem[]) => void;
}

const IfElseNodePanel = ({
    id,
    data,
    isEditing,
    setIsEditing,
    sourceNodes,
    cases,
    setCases
}: IfElseNodePanelProps) => {
    const { getNode } = useReactFlow();

    // 获取变量的名称
    const getVariableNames = (nodeId: string | null) => {
        if (!nodeId) return [];
        const node = getNode(nodeId);
        if (!node) return [];
        
        const indicatorValue = (node.data as any).indicatorValue || {};
        return Object.keys(indicatorValue);
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

    const handleSave = () => {
        setIsEditing(false);
        // 保存条件到 data
        if (data) {
            data.cases = cases;
        }
    };

    const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
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
        <Drawer open={isEditing} onOpenChange={setIsEditing} direction="right">
            <div 
                onDragStart={preventDragHandler}
                onDrag={preventDragHandler}
                onDragEnd={preventDragHandler}
                style={{ isolation: 'isolate' }}
            >
                <DrawerContent className="h-[calc(100vh-2rem)] max-w-[400px] rounded-l-xl shadow-2xl mx-0 my-4">
                    <DrawerHeader className="border-b">
                        <DrawerTitle>编辑条件节点</DrawerTitle>
                        <DrawerDescription>
                            配置条件判断参数
                        </DrawerDescription>
                    </DrawerHeader>
                    
                    <ScrollArea className="flex-1 px-4">
                        <div className="py-6 space-y-6">
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
                                                            getVariableNames(condition.leftVariable?.nodeId ?? null).map(name => ({
                                                                id: name,
                                                                label: name
                                                            }))
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
                                                            (value) => updateCondition(caseItem.caseId, condition.conditionId!, {
                                                                rightVariable: { ...condition.rightVariable!, varType: value as VarType }
                                                            }),
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
                                                                    rightVariable: { ...condition.rightVariable!, varibale: e.target.value }
                                                                })}
                                                                className="h-7 text-xs border-0 bg-transparent"
                                                                placeholder="输入值"
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                {renderSelectWithClear(
                                                                    condition.rightVariable?.nodeId ?? null,
                                                                    (value) => updateCondition(caseItem.caseId, condition.conditionId!, {
                                                                        rightVariable: { ...condition.rightVariable!, nodeId: value }
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
                                                                        rightVariable: { ...condition.rightVariable!, varibale: value }
                                                                    }),
                                                                    "选择变量",
                                                                    getVariableNames(condition.rightVariable?.nodeId ?? null).map(name => ({
                                                                        id: name,
                                                                        label: name
                                                                    }))
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
                    </ScrollArea>

                    <DrawerFooter className="border-t">
                        <div className="flex gap-2">
                            <DrawerClose asChild>
                                <Button className="flex-1" variant="outline">
                                    取消
                                </Button>
                            </DrawerClose>
                            <Button 
                                className="flex-1"
                                onClick={handleSave}
                            >
                                保存
                            </Button>
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </div>
        </Drawer>
    );
};

export default IfElseNodePanel;