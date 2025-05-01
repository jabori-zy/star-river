// 条件节点面板
import { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CaseItem } from "@/types/ifElseNode"
import { TradeMode } from "@/types/node"
import { X, CreditCard } from 'lucide-react'
import { Node } from '@xyflow/react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStrategyStore } from '@/store/useStrategyStore';
import { Label } from "@/components/ui/label"
import { IfElseNodeData } from '@/types/ifElseNode';
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
                    cases: liveCases.length > 0 ? liveCases : defaultCases,
                    setCases: setLiveCases
                };
            case TradeMode.SIMULATE:
                return {
                    cases: simulateCases.length > 0 ? simulateCases : defaultCases,
                    setCases: setSimulateCases
                };
            case TradeMode.BACKTEST:
                return {
                    cases: backtestCases.length > 0 ? backtestCases : defaultCases,
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
        setDefaultCases(cases);
    }, [activeTab]);

    const onSave = () => {
        // 准备更新数据
        const updatedData: Partial<IfElseNodeData> = {
            nodeName: tempNodeName,
            // 保存所有交易模式的配置
            liveConfig: { cases: liveCases },
            simulateConfig: { cases: simulateCases },
            backtestConfig: { cases: backtestCases }
        };

        // 调用父组件的保存方法
        handleSave(updatedData);
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
        // 保存当前标签页的数据
        switch (activeTab) {
            case TradeMode.LIVE:
                setLiveCases(currentCases);
                break;
            case TradeMode.SIMULATE:
                setSimulateCases(currentCases);
                break;
            case TradeMode.BACKTEST:
                setBacktestCases(currentCases);
                break;
        }
        
        // 切换到新的标签页
        setActiveTab(value);
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