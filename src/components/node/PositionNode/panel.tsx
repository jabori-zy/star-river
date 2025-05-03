import { useState, useEffect } from "react";
import { PositionNode, PositionOperationConfig, PositionOperationType, OperationConfig } from "@/types/positionNode";
import { Strategy, SelectedAccount } from "@/types/strategy";
import { TradeMode } from "@/types/node";
import {
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Trash2, LayoutGrid } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTradingModeName } from "@/utils/tradingModeHelper";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface PositionNodePanelProps {
    data: PositionNode["data"];
    strategy: Strategy | null;
    setIsEditing: (value: boolean) => void;
    handleSave: (updatedData: PositionNode["data"]) => void;
    nodeName: string;
    onNodeNameChange: (name: string) => void;
}

function PositionNodePanel({
    data,
    strategy,
    setIsEditing,
    handleSave,
    nodeName,
    onNodeNameChange,
}: PositionNodePanelProps) {
    const [nodeNameEditing, setNodeNameEditing] = useState<boolean>(false);
    const [tempNodeName, setTempNodeName] = useState<string>(nodeName || "仓位管理节点");
    
    // 交易模式
    const initialTradingMode = strategy?.tradeMode || TradeMode.SIMULATE;
    const [activeTab, setActiveTab] = useState<TradeMode>(initialTradingMode);
    
    // 获取下一个配置ID
    const getNextConfigId = (operations: PositionOperationConfig[]) => {
        if (operations.length === 0) return 1;
        return Math.max(...operations.map(op => op.configId)) + 1;
    };
    
    // 生成操作名称，根据操作类型和已有操作数量生成
    const generateOperationName = (operationType: PositionOperationType, operations: PositionOperationConfig[]) => {
        const typeName = operationType === PositionOperationType.UPDATE ? "更新仓位" : "全部平仓";
        
        // 检查是否有重名
        let newName = typeName;
        let counter = 1;
        while (operations.some(op => op.operationName === newName)) {
            newName = `${typeName} ${counter}`;
            counter++;
        }
        
        return newName;
    };
    
    // 初始化各种配置状态 - 不再默认添加操作
    const initOperations = (configOperations?: PositionOperationConfig[]) => {
        if (configOperations && configOperations.length > 0) {
            return [...configOperations];
        }
        return [];
    };
    
    const [liveOperations, setLiveOperations] = useState<PositionOperationConfig[]>(
        initOperations(data.liveConfig?.operations)
    );
    
    const [simulateOperations, setSimulateOperations] = useState<PositionOperationConfig[]>(
        initOperations(data.simulateConfig?.operations)
    );
    
    const [backtestOperations, setBacktestOperations] = useState<PositionOperationConfig[]>(
        initOperations(data.backtestConfig?.operations)
    );
    
    // 获取当前活动标签页的操作列表及其Setter
    const getActiveOperationsAndSetter = () => {
        switch (activeTab) {
            case TradeMode.LIVE:
                return { operations: liveOperations, setOperations: setLiveOperations };
            case TradeMode.SIMULATE:
                return { operations: simulateOperations, setOperations: setSimulateOperations };
            case TradeMode.BACKTEST:
                return { operations: backtestOperations, setOperations: setBacktestOperations };
            default:
                return { operations: simulateOperations, setOperations: setSimulateOperations }; 
        }
    };
    
    // 当外部交易模式或数据变化时，更新活动标签
    useEffect(() => {
        setActiveTab(initialTradingMode);
    }, [initialTradingMode]);
    
    // 获取当前模式的可用账户列表
    const getAccounts = () => {
        // 账户列表基于活动标签页
        if (activeTab === TradeMode.LIVE && strategy?.config.liveConfig) {
            return strategy.config.liveConfig.liveAccounts || [];
        } else if (activeTab === TradeMode.SIMULATE && strategy?.config.simulateConfig) {
            return strategy.config.simulateConfig.simulateAccounts || [];
        }
        return [];
    };
    
    // 处理节点名称双击编辑
    const handleDoubleClick = () => {
        setNodeNameEditing(true);
    };
    
    // 处理节点名称输入变化
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempNodeName(e.target.value);
    };
    
    // 保存节点名称
    const saveNodeName = () => {
        onNodeNameChange(tempNodeName);
        setNodeNameEditing(false);
    };
    
    // 处理回车键保存
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveNodeName();
        }
    };
    
    // 添加新操作 (作用于当前活动标签页)
    const addOperation = () => {
        const { operations, setOperations } = getActiveOperationsAndSetter();
        const newConfigId = getNextConfigId(operations);
        const operationType = PositionOperationType.UPDATE;
        
        const newOperation: PositionOperationConfig = {
            configId: newConfigId,
            operationType,
            operationName: generateOperationName(operationType, operations),
            operationConfig: { symbol: "" }
        };
        
        setOperations([...operations, newOperation]);
    };
    
    // 删除操作 (作用于当前活动标签页)
    const removeOperation = (configId: number) => {
        const { operations, setOperations } = getActiveOperationsAndSetter();
        setOperations(operations.filter(op => op.configId !== configId));
    };
    
    // 更新操作名称 (作用于当前活动标签页)
    const updateOperationName = (configId: number, name: string) => {
        const { operations, setOperations } = getActiveOperationsAndSetter();
        setOperations(operations.map(op => 
            op.configId === configId ? { ...op, operationName: name } : op
        ));
    };
    
    // 更新操作类型 (作用于当前活动标签页)
    const updateOperationType = (configId: number, type: PositionOperationType) => {
        const { operations, setOperations } = getActiveOperationsAndSetter();
        const operation = operations.find(op => op.configId === configId);
        if (!operation || operation.operationType === type) return;

        const otherOperations = operations.filter(op => op.configId !== configId);
        const shouldUpdateName = operation.operationName === "更新仓位" || 
                               operation.operationName === "全部平仓" ||
                               operation.operationName.startsWith("更新仓位 ") || 
                               operation.operationName.startsWith("全部平仓 ");
        
        setOperations(operations.map(op => {
            if (op.configId === configId) {
                return { 
                    ...op, 
                    operationType: type,
                    operationName: shouldUpdateName ? generateOperationName(type, otherOperations) : op.operationName
                };
            }
            return op;
        }));
    };
    
    // 更新操作配置 (作用于当前活动标签页)
    const updateOperationConfig = (configId: number, config: Partial<OperationConfig>) => {
        const { operations, setOperations } = getActiveOperationsAndSetter();
        setOperations(operations.map(op => {
            if (op.configId === configId) {
                // 处理 selectedAccount 为 undefined 的情况
                const updatedOpConfig = { ...op.operationConfig, ...config };
                if ('selectedAccount' in config && config.selectedAccount === undefined) {
                    delete updatedOpConfig.selectedAccount;
                }
                return { ...op, operationConfig: updatedOpConfig };
            }
            return op;
        }));
    };
    
    // 选择账户 (作用于当前活动标签页)
    const handleAccountSelect = (configId: number, accountId: string) => {
        const accounts = getAccounts(); // 获取当前活动标签页的账户列表
        const selectedAccount = accounts.find(account => account.id.toString() === accountId);
        updateOperationConfig(configId, { selectedAccount });
    };
    
    // 保存配置 (保存所有模式的数据)
    const handleSubmit = () => {
        const updatedData = {
            ...data,
            nodeName: tempNodeName,
            liveConfig: { operations: liveOperations },
            simulateConfig: { operations: simulateOperations },
            backtestConfig: { operations: backtestOperations }
        };
        handleSave(updatedData);
    };
    
    const { operations: currentOperations } = getActiveOperationsAndSetter();
    
    // 获取操作类型的选项列表
    const operationTypeOptions = [
        { value: PositionOperationType.UPDATE, label: "更新仓位" },
        { value: PositionOperationType.CLOSEALL, label: "全部平仓" }
    ];
    
    return (
        <DrawerContent 
            className="h-[calc(100vh-2rem)] max-w-[420px] rounded-l-xl shadow-2xl mx-0 my-4"
            onOpenAutoFocus={(e) => e.preventDefault()}
        >
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
                                {tempNodeName}
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
                    配置仓位管理节点参数
                </DrawerDescription>
            </DrawerHeader>
            
            <Tabs 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as TradeMode)}
                className="w-full"
            >
                <div className="px-4 pt-4">
                    <TabsList className="w-full">
                        <TabsTrigger value={TradeMode.LIVE} className="flex-1">
                            {getTradingModeName(TradeMode.LIVE)}
                        </TabsTrigger>
                        <TabsTrigger value={TradeMode.SIMULATE} className="flex-1">
                            {getTradingModeName(TradeMode.SIMULATE)}
                        </TabsTrigger>
                        <TabsTrigger value={TradeMode.BACKTEST} className="flex-1">
                            {getTradingModeName(TradeMode.BACKTEST)}
                        </TabsTrigger>
                    </TabsList>
                </div>
                
                <ScrollArea className="h-[calc(100vh-22rem)] px-4 py-2">
                    {/* 操作配置面板 */}
                    <div className="space-y-4">
                        {/* 操作列表顶部添加按钮 */}
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">仓位操作配置 ({getTradingModeName(activeTab)})</Label>
                            <Button variant="outline" size="sm" onClick={addOperation}>
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                添加操作
                            </Button>
                        </div>
                        
                        {/* 操作列表 */}
                        {currentOperations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md bg-slate-50">
                                <div className="text-sm text-muted-foreground text-center mb-3">
                                    暂无操作配置
                                </div>
                                <Button variant="outline" size="sm" onClick={addOperation}>
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    添加第一个操作
                                </Button>
                            </div>
                        ) : (
                            <Accordion type="multiple" className="w-full space-y-2">
                                {currentOperations.map((operation) => (
                                    <AccordionItem 
                                        key={operation.configId} 
                                        value={operation.configId.toString()}
                                        className="border rounded-md bg-slate-50"
                                    >
                                        <AccordionTrigger className="px-3 py-2 hover:no-underline">
                                            <div className="flex items-center gap-3 w-full">
                                                <LayoutGrid className="h-3.5 w-3.5 text-blue-500" />
                                                <span className="text-sm">{operation.operationName}</span>
                                                
                                                <Badge variant="outline" className="ml-auto text-[10px]">
                                                    {operation.operationType === PositionOperationType.UPDATE ? "更新仓位" : "全部平仓"}
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-3 py-2">
                                            <div className="space-y-3">
                                                {/* 操作名称 */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs">操作名称</Label>
                                                    <Input 
                                                        type="text"
                                                        value={operation.operationName}
                                                        onChange={(e) => updateOperationName(operation.configId, e.target.value)}
                                                        className="h-8"
                                                    />
                                                </div>
                                                
                                                {/* 操作类型 */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs">操作类型</Label>
                                                    <Select 
                                                        value={operation.operationType} 
                                                        onValueChange={(value) => updateOperationType(operation.configId, value as PositionOperationType)}
                                                    >
                                                        <SelectTrigger className="h-8">
                                                            <SelectValue placeholder="选择操作类型" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {operationTypeOptions.map(option => (
                                                                <SelectItem key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                {/* 账户选择 (仅在实盘和模拟交易模式下显示) */}
                                                {(activeTab === TradeMode.LIVE || activeTab === TradeMode.SIMULATE) && (
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">选择账户</Label>
                                                        <Select 
                                                            value={operation.operationConfig.selectedAccount?.id?.toString() ?? ''} 
                                                            onValueChange={(accountId) => handleAccountSelect(operation.configId, accountId)}
                                                        >
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue placeholder="选择交易账户" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {getAccounts().map((account: SelectedAccount) => (
                                                                    <SelectItem key={account.id} value={account.id.toString()}>
                                                                        {account.accountName} ({account.exchange})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                                
                                                {/* 交易对 */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs">交易对</Label>
                                                    <Input 
                                                        type="text"
                                                        value={operation.operationConfig.symbol}
                                                        onChange={(e) => updateOperationConfig(operation.configId, { symbol: e.target.value })}
                                                        placeholder="例如: BTCUSDT"
                                                        className="h-8"
                                                    />
                                                </div>
                                                
                                                {/* 删除操作按钮 */}
                                                <div className="pt-1 flex justify-end">
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm" 
                                                        onClick={() => removeOperation(operation.configId)}
                                                        className="h-7"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                        删除操作
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </div>
                </ScrollArea>
            </Tabs>
            
            <DrawerFooter className="border-t">
                <div className="flex gap-2">
                    <DrawerClose asChild>
                        <Button className="flex-1" variant="outline">
                            取消
                        </Button>
                    </DrawerClose>
                    <Button 
                        className="flex-1"
                        onClick={handleSubmit}
                    >
                        保存
                    </Button>
                </div>
            </DrawerFooter>
        </DrawerContent>
    );
}

export default PositionNodePanel; 