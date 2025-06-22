import { SettingProps } from "@/components/flow/base/BasePanel/setting-panel";
import CaseEditor from "../components/condition-editor/case-editor";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCallback, useEffect, useState } from "react";
import { useNodeConnections, useReactFlow } from "@xyflow/react";
import { NodeType } from "@/types/node/index";
import { IndicatorNodeData, SelectedIndicator } from "@/types/node/indicator-node";
import { VariableItem } from "../index";
import { CaseItem, IfElseNodeData } from "@/types/node/if-else-node";
import { LogicalSymbol } from "@/types/node/if-else-node";
import { useUpdateLiveConfig } from "@/hooks/node/if-else-node/use-update-live-config";
import { ReactSortable } from "react-sortablejs";
import { KlineNodeData } from "@/types/node/kline-node";


const IfElseNodeLiveSettingPanel: React.FC<SettingProps> = ({ id, data }) => {

    const ifElseNodeData = data as IfElseNodeData;

    const [localLiveCases, setLocalLiveCases] = useState<CaseItem[]>(ifElseNodeData?.liveConfig?.cases || []);

    const { getNode } = useReactFlow();
    const { updateCase, removeCase, updateCases } = useUpdateLiveConfig({ id, initialConfig: ifElseNodeData?.liveConfig });

    // 获取所有连接
    const connections = useNodeConnections({id, handleType: 'target'});
    const [variableItemList, setVariableItemList] = useState<VariableItem[]>([]);

    // 获取连接节点的变量信息
    const getConnectedNodeVariables = useCallback(() => {
        // 创建临时变量列表，避免在循环中多次setState
        const tempVariableItemList: VariableItem[] = [];
        
        for (const connection of connections) {
            // 获取连接的节点
            const nodeId = connection.source;
            // 获取source HandleId
            
            const node = getNode(nodeId);
            if (node) {
                // 节点类型
                const nodeType = node.type;
                const sourceHandleId = connection.sourceHandle!;
                                 // 如果是指标节点，则获取selectedIndicators
                if (nodeType === NodeType.IndicatorNode) {
                    const indicatorNodeData = node.data as IndicatorNodeData;
                    const indicatorNodeLiveConfig = indicatorNodeData.liveConfig;
                    const selectedIndicators = indicatorNodeLiveConfig?.selectedIndicators;
                    // 找到selectedIndicators中handleId为sourceHandleId的指标
                    const selectedIndicator = selectedIndicators?.find((indicator: SelectedIndicator) => indicator.handleId === sourceHandleId);
                    // console.log('selectedIndicator:', selectedIndicator)
                    if (selectedIndicator) {
                        // 在临时列表中查找是否已经存在该节点
                        const existingItem = tempVariableItemList.find(item => item.nodeId === nodeId);
                        if (existingItem) {
                            // 如果已存在，则添加到variables中
                            existingItem.variables.push(selectedIndicator);
                        } else {
                            // 如果不存在，则创建新项
                            tempVariableItemList.push({
                                nodeId: nodeId,
                                nodeName: indicatorNodeData.nodeName,
                                nodeType: nodeType,
                                variables: [selectedIndicator]
                            });
                        }
                    }
                }
                // 如果是K线节点，则获取selectedSymbols
                else if (nodeType === NodeType.KlineNode) {
                    const klineNodeData = node.data as KlineNodeData;
                    const klineNodeLiveConfig = klineNodeData.liveConfig;
                    const selectedSymbols = klineNodeLiveConfig?.selectedSymbols;
                    // 找到selectedSymbols中handleId为sourceHandleId的symbol
                    const selectedSymbol = selectedSymbols?.find(symbol => symbol.handleId === sourceHandleId);
                    if (selectedSymbol) {
                        // 在临时列表中查找是否已经存在该节点
                        const existingItem = tempVariableItemList.find(item => item.nodeId === nodeId);
                        if (existingItem) {
                            // 如果已存在，则添加到variables中
                            existingItem.variables.push(selectedSymbol);
                        } else {
                            // 如果不存在，则创建新项
                            tempVariableItemList.push({
                                nodeId: nodeId,
                                nodeName: klineNodeData.nodeName,
                                nodeType: nodeType,
                                variables: [selectedSymbol]
                            });
                        }
                    }
                }
            }
        }
        
        return tempVariableItemList;
    }, [connections, getNode]);

    useEffect(() => {
        // 获取连接节点的变量并更新状态
        const variables = getConnectedNodeVariables();
        setVariableItemList(variables);
    }, [connections, getNode, getConnectedNodeVariables]);

    // 更新case
    const handleCaseChange = (caseItem: CaseItem) => {
        // 如果当前配置为空，先初始化一个case
        if (!localLiveCases || localLiveCases.length === 0) {
            console.log('initializing first case in empty config');
            // 确保第一个case的ID为1，符合其他地方的预期
            const normalizedCase = { ...caseItem, caseId: 1 };
            setLocalLiveCases([normalizedCase]);
            updateCase(normalizedCase);
        } else {
            setLocalLiveCases(localLiveCases.map(c => c.caseId === caseItem.caseId ? caseItem : c));
            updateCase(caseItem);
        }
    }

    // 添加ELIF分支
    const handleAddElif = () => {
        const newCaseItem: CaseItem = {
            caseId: localLiveCases?.length + 1 || 1,
            logicalSymbol: LogicalSymbol.AND,
            conditions: []
        }
        setLocalLiveCases([...localLiveCases, newCaseItem]);
        updateCase(newCaseItem);
    }

    // 删除case
    const handleRemoveCase = (caseId: number) => {
        console.log('删除case', caseId);
        removeCase(caseId);
        
        // 先过滤掉要删除的case
        const filteredCases = localLiveCases.filter(c => c.caseId !== caseId);
        console.log("重置id前", filteredCases);

        // 判断filteredCases是否为空
        // 如果为空，则添加一个id为1的case
        if (filteredCases.length === 0) {
            const newCase: CaseItem = {
                caseId: 1,
                logicalSymbol: LogicalSymbol.AND,
                conditions: []
            }
            setLocalLiveCases([newCase]);
            updateCases([newCase]);
            return;
        } else {
            // 重新设置caseId，确保连续性（1,2,3...）
            const resetCases = filteredCases.map((c, index) => ({
                ...c, 
                caseId: index + 1
            }));
            console.log("重置id后", resetCases);
            
            // 更新本地状态
            setLocalLiveCases(resetCases);
        
            // 同步更新后的case到配置中
            updateCases(resetCases);
        }
    }

    // 处理拖拽排序
    const handleSortCases = (newList: (CaseItem & { id: number })[]) => {
        // 保留所有原有数据，只重新设置caseId，确保连续性（1,2,3...）
        const resetCases = newList.map((c, index) => ({
            ...c,  // 保留所有原有属性
            caseId: index + 1  // 只更新caseId
        }));
        
        // 更新本地状态
        setLocalLiveCases(resetCases);
        
        // 同步更新后的case到配置中
        updateCases(resetCases);
    }

    // 为ReactSortable准备的带有id的cases
    const casesWithId = localLiveCases.map(caseItem => ({
        ...caseItem,
        id: caseItem.caseId
    }));

    return (
        <div className="flex flex-col gap-2 ">
            {/* 如果cases为空，则传一个空的case */}
            {(!localLiveCases || localLiveCases.length === 0) ? (
                <CaseEditor 
                    id={id} 
                    data={data} 
                    variableItemList={variableItemList} 
                    caseItem={{caseId: 1, logicalSymbol: LogicalSymbol.AND, conditions: []}} 
                    onCaseChange={handleCaseChange}
                    onCaseRemove={handleRemoveCase}
                />
            ) : (
                <ReactSortable 
                    list={casesWithId} 
                    setList={handleSortCases}
                    handle=".drag-handle"
                    animation={200}
                    className="flex flex-col gap-2"
                >
                    {casesWithId.map((caseItem) => (
                        <div key={caseItem.caseId}>
                            <CaseEditor 
                                id={id} 
                                data={data} 
                                variableItemList={variableItemList} 
                                caseItem={caseItem} 
                                onCaseChange={handleCaseChange} 
                                onCaseRemove={handleRemoveCase}
                            />
                        </div>
                    ))}
                </ReactSortable>
            )}
            {/* 添加分支按钮 */}
            <div className="px-2">
                <Button variant="outline" className="w-full h-8 border-dashed hover:font-bold" onClick={handleAddElif}>
                    <span className="text-xs">+ELIF</span>
                </Button>
            </div>
            {/* 分支 */}
            <Separator orientation="horizontal" className="h-px bg-gray-200"/>
            <div className="flex flex-col gap-2 p-2">
                <h3 className="text-sm font-bold">ELSE</h3>
                <div className="text-xs text-muted-foreground">
                    当所有条件都不满足时，则会执行ELSE分支
                </div>
            </div>
        </div>
    )
}

export default IfElseNodeLiveSettingPanel;