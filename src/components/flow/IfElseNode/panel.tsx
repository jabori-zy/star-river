// 条件节点面板
import { useState, useEffect, useRef } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CaseItem, VarType } from "@/types/node/ifElseNode"
import { TradeMode } from "@/types/node"
import { X, CreditCard } from 'lucide-react'
import { Node } from '@xyflow/react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStrategyStore } from '@/store/useStrategyStore';
import { Label } from "@/components/ui/label"
import { IfElseNodeData } from '@/types/node/ifElseNode';
import ConditionEditor from './ConditionEditor';

interface IfElseNodePanelProps {
    id: string;
    data: IfElseNodeData;
    isEditing: boolean;
    setIsEditing: (value: boolean) => void;
    sourceNodes: Node[];
    cases: CaseItem[];
    setCases: (cases: CaseItem[]) => void;
    nodeName: string;
    onNodeNameChange: (name: string) => void;
    handleSave: (data: Partial<IfElseNodeData>) => void;
}

const IfElseNodePanel = ({
    isEditing,
    setIsEditing,
    sourceNodes,
    cases: defaultCases,
    setCases: setDefaultCases,
    nodeName,
    onNodeNameChange,
    handleSave,
    data
}: IfElseNodePanelProps) => {
    const { strategy } = useStrategyStore();
    const tradingMode = strategy?.tradeMode || TradeMode.SIMULATE;
    
    const [nodeNameEditing, setNodeNameEditing] = useState(false);
    const [tempNodeName, setTempNodeName] = useState(nodeName);
    const [activeTab, setActiveTab] = useState<string>(tradingMode);

    // 不同交易模式下的条件配置
    const [liveCases, setLiveCases] = useState<CaseItem[]>(
        data.liveConfig?.cases || []
    );
    const [simulateCases, setSimulateCases] = useState<CaseItem[]>(
        data.simulateConfig?.cases || []
    );
    const [backtestCases, setBacktestCases] = useState<CaseItem[]>(
        data.backtestConfig?.cases || []
    );

    // 获取当前活动标签页的条件和设置函数
    const getActiveCasesAndSetter = () => {
        switch (activeTab) {
            case TradeMode.LIVE:
                return {
                    // 如果liveCases为空且当前交易模式为LIVE，则使用defaultCases
                    cases: liveCases.length > 0 ? liveCases : 
                           (tradingMode === TradeMode.LIVE ? defaultCases : liveCases),
                    setCases: setLiveCases
                };
            case TradeMode.SIMULATE:
                return {
                    // 如果simulateCases为空且当前交易模式为SIMULATE，则使用defaultCases
                    cases: simulateCases.length > 0 ? simulateCases : 
                           (tradingMode === TradeMode.SIMULATE ? defaultCases : simulateCases),
                    setCases: setSimulateCases
                };
            case TradeMode.BACKTEST:
                return {
                    // 如果backtestCases为空且当前交易模式为BACKTEST，则使用defaultCases
                    cases: backtestCases.length > 0 ? backtestCases : 
                           (tradingMode === TradeMode.BACKTEST ? defaultCases : backtestCases),
                    setCases: setBacktestCases
                };
            default:
                return { cases: defaultCases, setCases: setDefaultCases };
        }
    };

    const { cases: currentCases, setCases: setCurrentCases } = getActiveCasesAndSetter();

    // 更新临时节点名称
    useEffect(() => {
        setTempNodeName(nodeName);
    }, [nodeName]);

    // 当交易模式变化时，更新活动标签
    useEffect(() => {
        setActiveTab(tradingMode);
    }, [tradingMode]);

    // 当标签切换时，使用当前标签的cases更新默认cases
    useEffect(() => {
        const { cases } = getActiveCasesAndSetter();
        // 只在组件初始化时设置默认cases，而不是每次标签切换
        if (cases.length > 0) {
            setDefaultCases(cases);
        }
    }, []);  // 依赖数组设为空，只在挂载时执行一次

    // 跟踪是否已清理过节点引用，避免重复处理
    const hasCleanedRef = useRef(false);

    // 当isEditing变化时（面板打开时），重新初始化状态
    useEffect(() => {
        if (isEditing && !hasCleanedRef.current) {
            // 获取当前存在的节点ID集合
            const existingNodeIds = new Set(sourceNodes.map(node => node.id));
            const nodeIdsString = sourceNodes.map(n => n.id).join(',');
            console.log('面板打开，当前可用节点:', nodeIdsString);
            
            // 检查条件并清除已删除的节点引用
            const cleanCases = (cases: CaseItem[]): CaseItem[] => {
                let hasChanges = false;
                
                const cleanedCases = cases.map(caseItem => {
                    const cleanedConditions = caseItem.conditions.map(condition => {
                        let updatedCondition = { ...condition };
                        
                        // 检查左侧变量节点是否存在
                        if (condition.leftVariable?.nodeId && !existingNodeIds.has(condition.leftVariable.nodeId)) {
                            console.log(`面板初始化: 节点 ${condition.leftVariable.nodeId} 已不存在，重置左侧变量`);
                            updatedCondition = {
                                ...updatedCondition,
                                leftVariable: {
                                    ...condition.leftVariable,
                                    nodeId: null,
                                    nodeName: null,
                                    varibale: null,
                                    variableName: null
                                }
                            };
                            hasChanges = true;
                        }
                        
                        // 检查右侧变量节点是否存在
                        if (
                            condition.rightVariable?.varType === VarType.variable &&
                            condition.rightVariable?.nodeId && 
                            !existingNodeIds.has(condition.rightVariable.nodeId)
                        ) {
                            console.log(`面板初始化: 节点 ${condition.rightVariable.nodeId} 已不存在，重置右侧变量`);
                            updatedCondition = {
                                ...updatedCondition,
                                rightVariable: {
                                    ...condition.rightVariable,
                                    nodeId: null,
                                    nodeName: null,
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
                        conditions: cleanedConditions
                    };
                });
                
                return hasChanges ? cleanedCases : cases;
            };
            
            // 处理所有交易模式的cases
            const cleanedLiveCases = cleanCases(data.liveConfig?.cases || []);
            const cleanedSimulateCases = cleanCases(data.simulateConfig?.cases || []);
            const cleanedBacktestCases = cleanCases(data.backtestConfig?.cases || []);
            
            // 仅当存在清理过的数据才更新状态，避免不必要的渲染
            setLiveCases(cleanedLiveCases);
            setSimulateCases(cleanedSimulateCases);
            setBacktestCases(cleanedBacktestCases);
            
            // 更新模式切换
            setActiveTab(tradingMode);
            
            // 标记已清理过，避免重复处理
            hasCleanedRef.current = true;
        } else if (!isEditing) {
            // 面板关闭时重置标记，下次打开时重新检查
            hasCleanedRef.current = false;
        }
    }, [isEditing, data, tradingMode, sourceNodes]);

    const onSave = () => {
        // 获取当前存在的节点ID集合
        const existingNodeIds = new Set(sourceNodes.map(node => node.id));
        
        // 清理数据的通用函数
        const cleanCases = (cases: CaseItem[]): CaseItem[] => {
            let hasChanges = false;
            
            const cleanedCases = cases.map(caseItem => ({
                ...caseItem,
                conditions: caseItem.conditions.map(condition => {
                    let updatedCondition = { ...condition };
                    
                    // 检查左侧节点
                    if (condition.leftVariable?.nodeId && !existingNodeIds.has(condition.leftVariable.nodeId)) {
                        console.log(`保存时清理: 左侧节点 ${condition.leftVariable.nodeId} 不存在`);
                        updatedCondition = {
                            ...updatedCondition,
                            leftVariable: {
                                ...condition.leftVariable,
                                nodeId: null,
                                nodeName: null,
                                varibale: null,
                                variableName: null
                            }
                        };
                        hasChanges = true;
                    }
                    
                    // 检查右侧节点
                    if (
                        condition.rightVariable?.varType === VarType.variable && 
                        condition.rightVariable?.nodeId && 
                        !existingNodeIds.has(condition.rightVariable.nodeId)
                    ) {
                        console.log(`保存时清理: 右侧节点 ${condition.rightVariable.nodeId} 不存在`);
                        updatedCondition = {
                            ...updatedCondition,
                            rightVariable: {
                                ...condition.rightVariable,
                                nodeId: null,
                                nodeName: null,
                                varibale: null,
                                variableName: null
                            }
                        };
                        hasChanges = true;
                    }
                    
                    return updatedCondition;
                })
            }));
            
            return hasChanges ? cleanedCases : cases;
        };
        
        // 使用批量更新来减少渲染次数
        const prepareAndSave = () => {
            // 清理当前标签页的数据
            const cleanedCurrentCases = cleanCases(currentCases);
            
            // 清理所有交易模式的cases
            const cleanedLiveCases = activeTab === TradeMode.LIVE 
                ? cleanedCurrentCases 
                : cleanCases(liveCases);
                
            const cleanedSimulateCases = activeTab === TradeMode.SIMULATE 
                ? cleanedCurrentCases 
                : cleanCases(simulateCases);
                
            const cleanedBacktestCases = activeTab === TradeMode.BACKTEST 
                ? cleanedCurrentCases 
                : cleanCases(backtestCases);
    
            // 使用最新的内存中数据准备更新
            const updatedData: Partial<IfElseNodeData> = {
                nodeName: tempNodeName,
                // 保存所有交易模式的配置
                liveConfig: { cases: cleanedLiveCases },
                simulateConfig: { cases: cleanedSimulateCases },
                backtestConfig: { cases: cleanedBacktestCases }
            };
    
            console.log("面板保存的数据:", updatedData);
    
            // 调用父组件的保存方法
            handleSave(updatedData);
        };
        
        // 在下一个事件循环执行，避免可能的冲突
        setTimeout(prepareAndSave, 0);
    };

    const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
    };

    // 节点名称相关函数
    const handleDoubleClick = () => {
        setNodeNameEditing(true);
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempNodeName(e.target.value);
    };

    const saveNodeName = () => {
        onNodeNameChange(tempNodeName);
        setNodeNameEditing(false);
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveNodeName();
        }
    };

    // 获取交易模式描述
    const getTradingModeDescription = (mode: TradeMode) => {
        switch (mode) {
            case TradeMode.LIVE:
                return "实盘交易条件配置";
            case TradeMode.SIMULATE:
                return "模拟交易条件配置";
            case TradeMode.BACKTEST:
                return "回测条件配置";
            default:
                return "未知模式";
        }
    };

    // 处理标签切换事件
    const handleTabChange = (value: string) => {
        if (activeTab === value) {
            return; // 如果标签没有变化，直接返回
        }
        
        // 获取当前存在的节点ID集合
        const existingNodeIds = new Set(sourceNodes.map(node => node.id));
        
        // 检查条件并清除已删除的节点引用
        const cleanConditionsInCases = (cases: CaseItem[]): CaseItem[] => {
            let hasChanges = false;
            
            const cleanedCases = cases.map(caseItem => ({
                ...caseItem,
                conditions: caseItem.conditions.map(condition => {
                    let updatedCondition = { ...condition };
                    
                    // 检查左侧节点
                    if (condition.leftVariable?.nodeId && !existingNodeIds.has(condition.leftVariable.nodeId)) {
                        updatedCondition = {
                            ...updatedCondition,
                            leftVariable: {
                                ...condition.leftVariable,
                                nodeId: null,
                                nodeName: null,
                                varibale: null,
                                variableName: null
                            }
                        };
                        hasChanges = true;
                    }
                    
                    // 检查右侧节点
                    if (
                        condition.rightVariable?.varType === VarType.variable && 
                        condition.rightVariable?.nodeId && 
                        !existingNodeIds.has(condition.rightVariable.nodeId)
                    ) {
                        updatedCondition = {
                            ...updatedCondition,
                            rightVariable: {
                                ...condition.rightVariable,
                                nodeId: null,
                                nodeName: null,
                                varibale: null,
                                variableName: null
                            }
                        };
                        hasChanges = true;
                    }
                    
                    return updatedCondition;
                })
            }));
            
            return hasChanges ? cleanedCases : cases;
        };
        
        // 使用React的批量更新减少渲染次数
        // React 18默认就是批量更新，但显式使用有助于确保行为一致
        const savePreviousTabData = () => {
            // 保存当前标签页的数据到对应的状态，并清除无效节点引用
            const cleanedCurrentCases = cleanConditionsInCases([...currentCases]);
            
            switch (activeTab) {
                case TradeMode.LIVE:
                    setLiveCases(cleanedCurrentCases);
                    break;
                case TradeMode.SIMULATE:
                    setSimulateCases(cleanedCurrentCases);
                    break;
                case TradeMode.BACKTEST:
                    setBacktestCases(cleanedCurrentCases);
                    break;
            }
            
            // 切换到新的标签页
            setActiveTab(value);
        };
        
        // 在下一个事件循环执行，避免可能的冲突
        setTimeout(savePreviousTabData, 0);
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
                        <DrawerTitle>
                            <div>
                              {nodeNameEditing ? (
                                <Input
                                  type="text"
                                  value={tempNodeName}
                                  onChange={handleNameChange}
                                  onBlur={saveNodeName}
                                  onKeyDown={handleKeyDown}
                                  autoFocus
                                  className="w-full px-1 text-sm border rounded focus:outline-none"
                                />
                              ) : (
                                <span onDoubleClick={handleDoubleClick}>
                                  {nodeName}
                                </span>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-4 top-4"
                                onClick={() => setIsEditing(false)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                        </DrawerTitle>
                        <DrawerDescription>
                            配置条件判断参数
                        </DrawerDescription>
                    </DrawerHeader>
                    
                    <ScrollArea className="flex-1 px-4">
                        <div className="py-6 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                    <Label className="font-medium">交易模式</Label>
                                </div>
                                <Tabs 
                                    defaultValue={activeTab}
                                    value={activeTab}
                                    onValueChange={handleTabChange}
                                    className="w-full"
                                >
                                    <TabsList className="grid grid-cols-3 h-8">
                                        <TabsTrigger value={TradeMode.LIVE} className="text-xs">
                                            实盘交易
                                        </TabsTrigger>
                                        <TabsTrigger value={TradeMode.SIMULATE} className="text-xs">
                                            模拟交易
                                        </TabsTrigger>
                                        <TabsTrigger value={TradeMode.BACKTEST} className="text-xs">
                                            历史回测
                                        </TabsTrigger>
                                    </TabsList>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        {getTradingModeDescription(activeTab as TradeMode)}
                                    </div>
                                </Tabs>
                            </div>

                            {/* 条件编辑器组件 */}
                            <ConditionEditor 
                                cases={currentCases}
                                setCases={setCurrentCases}
                                sourceNodes={sourceNodes}
                            />
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
                                onClick={onSave}
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