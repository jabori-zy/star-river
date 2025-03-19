import { useState } from 'react';
import { 
    Handle, 
    type NodeProps, 
    Position,
    useReactFlow,
    useNodeConnections,
    Node
} from '@xyflow/react';
import { Button } from "@/components/ui/button"
import { PencilIcon } from 'lucide-react';
import { Condition, CaseItem, VarType } from "@/types/node";
import IfElseNodePanel from './panel';
import { LogicalOperator } from '@/types/node';


function IfElseNode({id, data}:NodeProps) {
    const [showEditButton, setShowEditButton] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [cases, setCases] = useState<CaseItem[]>(data.cases as CaseItem[] || [{
        caseId: 1,
        logicalOperator: LogicalOperator.and,
        conditions: []
    }]);
    const { getNode } = useReactFlow();
    const connections = useNodeConnections({
        handleType: 'target',
    });

    const sourceNodes = connections
        .map(connection => getNode(connection.source))
        .filter((node): node is Node => node !== null);

    // 格式化条件表达式
    const formatCondition = (condition: Condition) => {
        const rightValue = condition.rightVariable?.varType === VarType.constant 
            ? condition.rightVariable.varibale 
            : `${condition.rightVariable?.nodeId}-${condition.rightVariable?.varibale}`;
            
        return `${condition.leftVariable?.nodeId}-${condition.leftVariable?.varibale} ${condition.comparisonOperator} ${rightValue}`;
    };

    // 渲染单个 case 的 Handle 和内容
    const renderCase = (caseItem: CaseItem) => (
        <div key={caseItem.caseId} className="px-4 py-3 border-b bg-gradient-to-r from-blue-50/30 to-transparent relative">
            <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-6 rounded-md bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 text-[11px] font-medium shadow-sm border border-indigo-200/50 whitespace-nowrap">
                    条件{caseItem.caseId}
                </div>
                <div className="flex-1">
                    <div className="text-xs text-gray-500">
                        {caseItem.conditions.length > 0 ? (
                            <div className="space-y-1">
                                {caseItem.conditions.map((condition, index) => (
                                    <div key={index} className="flex items-center gap-1">
                                        {index > 0 && (
                                            <span className="text-[10px] font-medium text-blue-400">
                                                {caseItem.logicalOperator}
                                            </span>
                                        )}
                                        <span className="truncate">
                                            {formatCondition(condition)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-gray-400 italic">未设置条件</span>
                        )}
                    </div>
                </div>
            </div>
            <Handle 
                type="source" 
                position={Position.Right}
                id={`if_else_node_case_${caseItem.caseId}_output`}
                className="!w-3 !h-3 !border-2 !border-white !bg-blue-400 !top-[22px]"
            />
        </div>
    );

    return (
        <div 
            className="flex"
            onMouseEnter={() => setShowEditButton(true)}
            onMouseLeave={() => setShowEditButton(false)}
        >
            <div className="relative min-w-[240px] bg-white rounded-lg border-2 border-gray-200 shadow-sm">
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
                <div className="px-4 py-3 border-b bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-t-lg">
                    <div className="text-sm font-medium text-gray-700">条件分支</div>
                </div>

                {/* 输入 Handle */}
                <Handle 
                    type="target" 
                    position={Position.Left}
                    id="if_else_node_input"
                    className="!w-3 !h-3 !border-2 !border-white !bg-blue-400 !top-[22px]"
                />

                {/* 渲染所有 case */}
                {cases.map(caseItem => renderCase(caseItem))}

                {/* ELSE部分 */}
                <div className="px-4 py-3 bg-gradient-to-r from-orange-50/30 to-transparent rounded-b-lg relative">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-xs font-medium shadow-sm">
                            ELSE
                        </div>
                        <div className="flex-1">
                            <span className="text-xs text-gray-500">其他情况执行</span>
                        </div>
                    </div>
                    <Handle 
                        type="source" 
                        position={Position.Right}
                        id="if_else_node_else_output" 
                        className="!-right-[6px] !w-3 !h-3 !border-2 !border-white !bg-orange-400"
                    />
                </div>
            </div>

            <IfElseNodePanel
                id={id}
                data={data}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                sourceNodes={sourceNodes}
                cases={cases}
                setCases={setCases}
            />
        </div>
    );
}

export default IfElseNode;
