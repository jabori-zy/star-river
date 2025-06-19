import { NodeData } from "@/types/node/index";
import ConditionSetting from "./condition-setting";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Trash2 } from "lucide-react";
import { VariableItem } from "../../index"
import { CaseItem, Condition, ComparisonSymbol, VarType, LogicalSymbol } from "@/types/node/if-else-node";
import { useState, useEffect } from "react";


interface CaseEditorProps {
    id: string;
    data: NodeData;
    variableItemList: VariableItem[]; // 变量列表
    caseItem: CaseItem; // 条件
    onCaseChange: (caseItem: CaseItem) => void;
    onCaseRemove: (caseId: number) => void;
}


const CaseEditor: React.FC<CaseEditorProps> = ({variableItemList,caseItem,onCaseChange,onCaseRemove}) => {


    // 本地的条件状态，用于编辑时，避免影响其他分支
    const [localCaseItem, setLocalCaseItem] = useState<CaseItem>(caseItem);

    // 当caseItem prop变化时，更新本地状态
    useEffect(() => {
        setLocalCaseItem(caseItem);
    }, [caseItem]);

    // 添加条件
    const handleAddCondition = () => {
        const newCondition: Condition = {
            conditionId: localCaseItem.conditions.length + 1, // 列表长度+1
            leftVariable: null,
            comparisonSymbol: ComparisonSymbol.equal, 
            rightVariable: {
                varType: VarType.variable,
                nodeId: null,
                handleId: null,
                variableId: null,
                variable: null,
            }
        }
        const updatedCaseItem = {...localCaseItem, conditions: [...localCaseItem.conditions, newCondition]};
        setLocalCaseItem(updatedCaseItem);
        onCaseChange(updatedCaseItem);
    }

    // 删除条件
    const handleRemoveCondition = (conditionId: number) => {
        const updatedCaseItem = {...localCaseItem, conditions: localCaseItem.conditions.filter(condition => condition.conditionId !== conditionId)};
        setLocalCaseItem(updatedCaseItem);
        onCaseChange(updatedCaseItem);
    }

    // 更新条件
    const handleUpdateCondition = (condition: Condition) => {
        // 更新本地case中的条件
        const updatedConditions = localCaseItem.conditions.map(c => c.conditionId === condition.conditionId ? condition : c);
        const updatedCaseItem = {...localCaseItem, conditions: updatedConditions};
        setLocalCaseItem(updatedCaseItem);
        onCaseChange(updatedCaseItem);
    }

    // 更新case的逻辑运算符
    const handleUpdateLogicalSymbol = (logicalSymbol: LogicalSymbol) => {
        const updatedCaseItem = {...localCaseItem, logicalSymbol: logicalSymbol};
        setLocalCaseItem(updatedCaseItem);
        onCaseChange(updatedCaseItem);
    }

    return (
        <div className="flex flex-col gap-2">
            {/* 标题 */}
            <div className="flex flex-row gap-2 items-center h-8 p-2 justify-between">
                <div className="flex flex-row gap-2 items-center ">
                    <h3 className="text-sm font-bold">{caseItem.caseId === 1 ? `IF${caseItem.caseId}` : `ELIF${caseItem.caseId}`}</h3>
                    <Button variant="ghost" className="w-16 h-6 bg-red-100" onClick={() => handleUpdateLogicalSymbol(localCaseItem.logicalSymbol === LogicalSymbol.AND ? LogicalSymbol.Or : LogicalSymbol.AND)}>
                        <RefreshCcw className="w-2 h-2"/>
                        <span className="text-xs">{localCaseItem.logicalSymbol?.toUpperCase()}</span>
                    </Button>

                </div>
                <div className="flex flex-row gap-2 items-center"> 
                    <Button variant="ghost" className="w-22 h-6 text-muted-foreground hover:text-red-500" onClick={() => onCaseRemove(localCaseItem.caseId)}>
                        <Trash2 className="w-2 h-2"/>
                        <span className="text-xs">删除分支</span>
                    </Button>
                </div>
                
            </div>
            {/* 条件 */}
            {/* 如果caseItem为空，则默认显示一个空的case */}
            {localCaseItem?.conditions?.length >0 && (
                localCaseItem?.conditions?.map((condition, index) => (
                    <div className="flex flex-row">
                        <ConditionSetting key={index} variableItemList={variableItemList} condition={condition} onConditionChange={handleUpdateCondition} />
                        <div className="pt-2 pr-2">
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 p-1 h-6 w-6" onClick={() => handleRemoveCondition(condition.conditionId)}>
                                <Trash2 className="w-2 h-2"/>
                            </Button>
                        </div>
                    </div>
                ))
            )}
            
            {/* 添加条件按钮 */}
            <div className="flex justify-start pl-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs px-3"
                    onClick={handleAddCondition}
                >
                    添加条件
                </Button>
            </div>
            {/* 用div模拟分割线 */}
            <div className="w-full h-px bg-gray-300 px-4 m-2 "></div>
            
        </div>
    )
    
}


export default CaseEditor;