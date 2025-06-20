import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { VariableItem } from "../../index";
import { SelectedIndicator } from "@/types/node/indicator-node";
import { SelectedSymbol } from "@/types/node/kline-node";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Variable } from "@/types/node/if-else-node";

interface VariableSelectorProps {
    variableItemList: VariableItem[];
    variable: Variable | null
    onNodeChange: (nodeId: string, nodeName: string) => void; // 节点选择回调
    onVariableChange: (variableId: number, variableName: string, handleId: string) => void; // 变量选择回调
}

const VariableSelector: React.FC<VariableSelectorProps> = ({
    variableItemList,
    variable,
    onNodeChange,
    onVariableChange
}) => {
    const [selectedNodeId, setSelectedNodeId] = useState<string>(variable?.nodeId || "");
    const [variableString, setVariableString] = useState<string>("");

    // 类型守卫：判断是否为SelectedIndicator
    const isSelectedIndicator = (variable: SelectedIndicator | SelectedSymbol): variable is SelectedIndicator => {
        return 'value' in variable;
    };

    // 生成选项value，格式：nodeId|handleId|valueKey
    const generateOptionValue = (nodeId: string, handleId: string, valueKey: string | number) => {
        return `${nodeId}|${handleId}|${valueKey}`;
    };

    // 当传入的variable发生变化时，同步更新本地状态
    useEffect(() => {
        if (variable) {
            // 更新选中的节点ID
            setSelectedNodeId(variable.nodeId || "");
            
            // 更新变量字符串
            if(variable.nodeId && variable.handleId && variable.variable){
                const variableString = generateOptionValue(variable.nodeId, variable.handleId, variable.variable);
                setVariableString(variableString);
                console.log("variableString", variableString);
            } else {
                setVariableString("");
            }
        } else {
            // 如果variable为null，清空状态
            setSelectedNodeId("");
            setVariableString("");
        }
    }, [variable]);

    // 处理节点选择
    const handleNodeChange = (nodeId: string) => {
        console.log('🔍 节点选择:', {
            nodeId,
            nodeName: variableItemList.find(item => item.nodeId === nodeId)?.nodeName,
            nodeType: variableItemList.find(item => item.nodeId === nodeId)?.nodeType
        });
        setSelectedNodeId(nodeId);
        // 清空当前选择
        onNodeChange(nodeId, variableItemList.find(item => item.nodeId === nodeId)?.nodeName || "");
    };

    // 处理变量选择
    const handleVariableChange = (variableValue: string) => {

        const [nodeId, handleId, valueKey] = variableValue.split('|');
        const selectedNode = variableItemList.find(item => item.nodeId === nodeId);
        const selectedVar = selectedNode?.variables.find(v => v.handleId === handleId);

        let variableId = 0;
        if (selectedVar) {
            variableId = isSelectedIndicator(selectedVar) ? selectedVar.indicatorId : selectedVar.symbolId;
        }

        console.log('📊 变量选择:', {
            variableValue,
            parsed: { nodeId, handleId, valueKey },
            nodeName: selectedNode?.nodeName,
            variableType: selectedVar ? (isSelectedIndicator(selectedVar) ? selectedVar.type : 'kline') : 'unknown',
            indicatorId: selectedVar && isSelectedIndicator(selectedVar) ? selectedVar.indicatorId : undefined,
            symbol: selectedVar && !isSelectedIndicator(selectedVar) ? selectedVar.symbol : undefined,
            interval: selectedVar && !isSelectedIndicator(selectedVar) ? selectedVar.interval : undefined
        });
        
        setVariableString(variableValue);
        onVariableChange(variableId, valueKey, handleId);
    };

    // 获取选中节点的变量列表
    const getSelectedNodeVariables = () => {
        const selectedNode = variableItemList.find(item => item.nodeId === selectedNodeId);
        return selectedNode?.variables || [];
    };

    // 渲染变量选项
    const renderVariableOptions = () => {
        const variables = getSelectedNodeVariables();
        if (variables.length === 0) return null;

        const indicators = variables.filter(v => isSelectedIndicator(v)) as SelectedIndicator[];
        const klineNodes = variables.filter(v => !isSelectedIndicator(v)) as SelectedSymbol[];
        
        const result: React.ReactNode[] = [];
        
        // 处理指标节点 - 按indicatorId分组
        if (indicators.length > 0) {
            const groupedByIndicatorId = indicators.reduce((groups, variable) => {
                const key = variable.indicatorId;
                if (!groups[key]) {
                    groups[key] = [];
                }
                groups[key].push(variable);
                return groups;
            }, {} as Record<number, SelectedIndicator[]>);
            
            const indicatorIds = Object.keys(groupedByIndicatorId).map(Number).sort();
            
            indicatorIds.forEach((indicatorId, groupIndex) => {
                const variables = groupedByIndicatorId[indicatorId];
                
                // 创建指标组的所有选项
                const groupItems: React.ReactNode[] = [];
                
                // 添加每个指标的选项
                variables.forEach((variable) => {
                    const variableName = Object.keys(variable.value);
                    variableName.forEach((varName) => {
                        groupItems.push(
                            <SelectItem
                                className="text-xs font-normal py-2" 
                                key={`${variable.handleId}_${varName}`}
                                value={generateOptionValue(selectedNodeId, variable.handleId, varName)}
                                textValue={`指标${variable.indicatorId} • ${varName}`}
                            >
                                <div className="flex items-center justify-between w-full gap-1">
                                        <Badge variant="outline" className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm">
                                            {variable.indicatorId} | {variable.type.toUpperCase()}
                                        </Badge>

                                    <span className="font-medium text-gray-900 text-right">{varName}</span>
                                </div>
                            </SelectItem>
                        );
                    });
                });
                
                // 用SelectGroup包装
                result.push(
                    <SelectGroup key={`indicator_group_${indicatorId}`}>
                        <SelectLabel className="text-xs font-semibold text-blue-600 px-2 py-1.5">
                            指标 {indicatorId}
                        </SelectLabel>
                        {groupItems}
                    </SelectGroup>
                );
                
                // 在不同指标ID组之间添加分隔符（除了最后一组）
                if (groupIndex < indicatorIds.length - 1) {
                    result.push(
                        <SelectSeparator key={`separator_${indicatorId}`} className="my-1" />
                    );
                }
            });
        }
        
        // 如果同时有指标和K线节点，在它们之间添加分隔符
        if (indicators.length > 0 && klineNodes.length > 0) {
            result.push(
                <SelectSeparator key="separator_indicator_kline" className="my-1" />
            );
        }
        
        // 处理K线节点
        if (klineNodes.length > 0) {
            const klineItems: React.ReactNode[] = [];
            
            klineNodes.forEach((variable) => {
                const klineFields = ['open', 'high', 'low', 'close', 'volume'];
                
                klineFields.forEach((field) => {
                    klineItems.push(
                        <SelectItem 
                            className="text-xs font-normal py-2 px-3 hover:bg-green-50 focus:bg-green-50" 
                            key={`${variable.handleId}_${field}`}
                            value={generateOptionValue(selectedNodeId, variable.handleId, field)}
                            textValue={`${variable.symbol} ${variable.interval} • ${field}`}
                        >
                            <div className="flex items-center justify-between w-full gap-4">
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge variant="secondary" className="flex items-center justify-center text-[10px] leading-none py-1 bg-green-100 text-green-700 border-green-200">
                                        KLINE
                                    </Badge>
                                    <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                        {variable.symbol} • {variable.interval}
                                    </span>
                                </div>
                                <span className="font-medium text-gray-900 text-right">{field}</span>
                            </div>
                        </SelectItem>
                    );
                });
            });
            
            result.push(
                <SelectGroup key="kline_group">
                    <SelectLabel className="text-xs font-semibold text-green-600 px-2 py-1.5">
                        K线数据
                    </SelectLabel>
                    {klineItems}
                </SelectGroup>
            );
        }
        
        return result;
    };

    return (
        <div className="flex gap-2">
            {/* 节点选择器 */}
            <Select value={selectedNodeId} onValueChange={handleNodeChange}>
                <SelectTrigger className={cn("h-8 text-xs font-normal hover:bg-gray-200 ")}>
                    <SelectValue placeholder="选择节点" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                    {variableItemList.map((item) => (
                        <SelectItem
                            key={item.nodeId}
                            value={item.nodeId}
                            className="text-xs font-normal py-2 px-3"
                            textValue={item.nodeName}
                        >
                            <div className="flex items-center gap-1">
                                <Badge variant="outline" className="flex items-center justify-center text-[10px] leading-none py-1 border-gray-400 rounded-sm">
                                    {item.nodeType === 'indicatorNode' ? '指标' : 'K线'}
                                </Badge>
                                <span className="font-medium text-gray-900">{item.nodeName}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* 变量选择器 */}
            <Select 
                value={variableString} 
                onValueChange={handleVariableChange}
                disabled={!selectedNodeId}
            >
                <SelectTrigger className={cn("h-8 text-xs font-normal hover:bg-gray-200", !selectedNodeId && "opacity-50 cursor-not-allowed")}>
                    <SelectValue placeholder="选择变量" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                    {renderVariableOptions()}
                </SelectContent>
            </Select>
        </div>
    );
};

export default VariableSelector;