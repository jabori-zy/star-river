import { ComparisonSymbol, Condition, VarType, Variable } from "@/types/node/if-else-node";
import { VariableItem } from "@/hooks/flow/use-strategy-workflow"
import VariableSelector from "./variable-selector";
import { useState, useEffect } from "react";
import ComparisonSymbolSelector from "./comparison-symbol-selector";
import VarTypeSelector from "./var-type-selector";
import ConstantInput from "./constant-input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ConditionSettingProps {
    variableItemList: VariableItem[];
    condition: Condition;
    onConditionChange: (condition: Condition) => void;
    onConditionRemove: (conditionId: number) => void;
    // updateCondition: (caseId: number, conditionId: number, condition: Condition) => void; // 更新条件
}


// 变量拉下选择框




const ConditionSetting: React.FC<ConditionSettingProps> = ({variableItemList,condition,onConditionChange,onConditionRemove}) => {

    // 本地的条件状态，用于编辑时
    const [localCondition, setLocalCondition] = useState<Condition>(condition);

    // 当传入的condition发生变化时，同步更新本地状态
    useEffect(() => {
        setLocalCondition(condition);
    }, [condition]);

    // 更新左节点
    const handleUpdateLeftNode = (nodeId: string, nodeName: string) => {
        const newLeftVariable: Variable = {
            varType: VarType.variable,
            nodeId: nodeId,
            handleId: localCondition.leftVariable?.handleId || null,
            variableId: localCondition.leftVariable?.variableId || null,
            variable: localCondition.leftVariable?.variable || null,
            nodeName: nodeName,
        }
        const newCondition = {...localCondition, leftVariable: newLeftVariable};
        setLocalCondition(newCondition);
        // 执行回调，更新条件
        onConditionChange(newCondition);
    }
    // 更新左变量
    const handleUpdateLeftVariable = (variableId: number, variableName: string, handleId: string) => {
        const newLeftVariable: Variable = {
            varType: VarType.variable,
            nodeId: localCondition.leftVariable?.nodeId || null,
            handleId: handleId,
            variableId: variableId,
            variable: variableName,
            nodeName: localCondition.leftVariable?.nodeName || null,
        }
        const newCondition = {...localCondition, leftVariable: newLeftVariable};
        setLocalCondition(newCondition);
        // 执行回调，更新条件
        onConditionChange(newCondition);
    }

    // 更新右节点
    const handleUpdateRightNode = (nodeId: string, nodeName: string) => {
        const newRightVariable: Variable = {   
            varType: VarType.variable,
            nodeId: nodeId,
            handleId: localCondition.rightVariable?.handleId || null,
            variableId: localCondition.rightVariable?.variableId || null,
            variable: localCondition.rightVariable?.variable || null,
            nodeName: nodeName,
        }
        const newCondition = {...localCondition, rightVariable: newRightVariable};
        setLocalCondition(newCondition);
        // 执行回调，更新条件
        onConditionChange(newCondition);
    }
    // 更新右变量
    const handleUpdateRightVariable = (variableId: number, variableName: string, handleId: string) => {
        const newRightVariable: Variable = {
            varType: VarType.variable,
            nodeId: localCondition.rightVariable?.nodeId || null,
            handleId: handleId,
            variableId: variableId,
            variable: variableName,
            nodeName: localCondition.rightVariable?.nodeName || null,
        }
        const newCondition = {...localCondition, rightVariable: newRightVariable};
        setLocalCondition(newCondition);
        // 执行回调，更新条件
        onConditionChange(newCondition);
    }

    // 更新比较符号
    const handleUpdateComparisonSymbol = (comparisonSymbol: ComparisonSymbol) => {
        const newCondition = {...localCondition, comparisonSymbol: comparisonSymbol};
        setLocalCondition(newCondition);
        // 执行回调，更新条件
        onConditionChange(newCondition);
    }

    // 更新右变量类型
    const handleUpdateRightVarType = (varType: VarType) => {
        const newRightVariable: Variable = {
            varType: varType,
            nodeId: null,
            handleId: null,
            variableId: null,
            variable: null,
            nodeName: null,
        }
        const newCondition = {...localCondition, rightVariable: newRightVariable};
        setLocalCondition(newCondition);
        // 执行回调，更新条件
        onConditionChange(newCondition);
    }

    const handleUpdateRightConstantValue = (value: number) => {
        const newRightVariable: Variable = {
            varType: VarType.constant,
            nodeId: null,
            handleId: null,
            variableId: null,
            variable: value,
            nodeName: null,
        }
        const newCondition = {...localCondition, rightVariable: newRightVariable};
        setLocalCondition(newCondition);
        // 执行回调，更新条件
        onConditionChange(newCondition);
    }
    


    return (
        <div className="flex flex-row justify-between px-2 rounded-md bg-gray-100 w-full">
            <div className="flex flex-col flex-1">
                <div className="flex flex-col gap-1 p-2 min-h-16">
                    <div className="flex flex-row justify-between" >
                        <span className="text-sm font-bold text-left">左值</span>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 p-1 h-6 w-6" onClick={() => onConditionRemove(condition.conditionId)}>
                            <Trash2 className="w-2 h-2"/>
                        </Button>
                    </div>
                    {/* 左边变量选择器 */}
                    <VariableSelector 
                        variableItemList={variableItemList} 
                        variable={localCondition.leftVariable || null}
                        onNodeChange={handleUpdateLeftNode}
                        onVariableChange={handleUpdateLeftVariable}
                    />
                </div>
                <div className="flex flex-col gap-1 px-2 min-h-16">
                    <div className="text-sm font-bold text-left" >符号</div>
                    <div className="flex flex-row gap-2 items-center">
                        <ComparisonSymbolSelector
                            className="w-16"
                            comparisonSymbol={localCondition.comparisonSymbol || ComparisonSymbol.equal}
                            onComparisonSymbolChange={handleUpdateComparisonSymbol}
                        />
                        <div className="w-px h-4 bg-gray-300"></div>
                        <VarTypeSelector className="w-24" varType={localCondition.rightVariable?.varType || VarType.variable} onVarTypeChange={handleUpdateRightVarType}/>
                    </div>
                </div>
                <div className="flex flex-col gap-1 px-2 min-h-16">
                    <div className="text-sm font-bold text-left" >右值</div>
                    {localCondition.rightVariable?.varType === VarType.variable ? (

                    <VariableSelector 
                        variableItemList={variableItemList} 
                        variable={localCondition.rightVariable || null}
                        onNodeChange={handleUpdateRightNode}
                        onVariableChange={handleUpdateRightVariable}
                    />
                    ) : (
                    <ConstantInput 
                        className="w-full"
                        value={localCondition.rightVariable?.variable as number || 0}
                        onValueChange={handleUpdateRightConstantValue}
                    />
                    )}

                </div>
            </div>
            
        </div>
    )
}



export default ConditionSetting;