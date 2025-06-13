import { useState, useEffect } from "react";
import { PositionNode, PositionOperationConfig, PositionOperationType } from "@/types/node/positionNode";
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
    
    // 初始化各种配置状态
    const initOperations = (configOperations?: PositionOperationConfig[]) => {
        if (configOperations && configOperations.length > 0) {
            return [...configOperations];
        }
        // 默认添加一个更新仓位操作
        return [{
            configId: 1,
            operationType: PositionOperationType.UPDATE,
            operationName: "更新仓位"
        }];
    };
    
    // 初始化账户和交易对的全局配置
    const [liveAccount, setLiveAccount] = useState<SelectedAccount | null>(
        data.liveConfig?.selectedLiveAccount || null
    );
    const [liveSymbol, setLiveSymbol] = useState<string | null>(
        data.liveConfig?.symbol || null
    );
    
    const [simulateAccount, setSimulateAccount] = useState<SelectedAccount | null>(
        data.simulateConfig?.selectedSimulateAccount || null
    );
    const [simulateSymbol, setSimulateSymbol] = useState<string | null>(
        data.simulateConfig?.symbol || null
    );
    
    const [backtestSymbol, setBacktestSymbol] = useState<string | null>(
        data.backtestConfig?.symbol || null
    );
    
    // 操作列表状态
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
    
    // 获取当前活动标签页的全局配置
    const getActiveGlobalConfig = () => {
        switch (activeTab) {
            case TradeMode.LIVE:
                return { 
                    account: liveAccount, 
                    setAccount: setLiveAccount,
                    symbol: liveSymbol,
                    setSymbol: setLiveSymbol
                };
            case TradeMode.SIMULATE:
                return { 
                    account: simulateAccount, 
                    setAccount: setSimulateAccount,
                    symbol: simulateSymbol,
                    setSymbol: setSimulateSymbol
                };
            case TradeMode.BACKTEST:
                return { 
                    account: null, 
                    setAccount: (() => {}) as React.Dispatch<React.SetStateAction<SelectedAccount | null>>,
                    symbol: backtestSymbol,
                    setSymbol: setBacktestSymbol
                };
            default:
                return { 
                    account: simulateAccount, 
                    setAccount: setSimulateAccount,
                    symbol: simulateSymbol,
                    setSymbol: setSimulateSymbol
                };
        }
    };
    
    // 当外部交易模式或数据变化时，更新活动标签
    useEffect(() => {
        setActiveTab(initialTradingMode);
    }, [initialTradingMode]);
    
    // 确保当前活动标签页有操作
    useEffect(() => {
        const { operations, setOperations } = getActiveOperationsAndSetter();
        
        // 如果当前操作列表为空，添加默认的更新仓位操作
        if (operations.length === 0) {
            setOperations([{
                configId: 1,
                operationType: PositionOperationType.UPDATE,
                operationName: "更新仓位"
            }]);
        }
    }, [activeTab]); // 当标签切换时检查
    
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
        
        // 检查当前已有的操作类型，选择可用的操作类型
        // 如果已有全部平仓操作，则不应再添加操作
        if (operations.some(op => op.operationType === PositionOperationType.CLOSEALL)) {
            return;
        }
        
        // 判断是否有更新仓位操作，如果有则添加全部平仓，否则添加更新仓位
        const hasUpdateOperation = operations.some(op => op.operationType === PositionOperationType.UPDATE);
        const operationType = hasUpdateOperation ? PositionOperationType.CLOSEALL : PositionOperationType.UPDATE;
        
        const newOperation: PositionOperationConfig = {
            configId: newConfigId,
            operationType,
            operationName: generateOperationName(operationType, operations)
        };
        
        setOperations([...operations, newOperation]);
    };
    
    // 删除操作 (作用于当前活动标签页)
    const removeOperation = (configId: number) => {
        const { operations, setOperations } = getActiveOperationsAndSetter();
        
        // 查找要删除的操作
        const targetOperation = operations.find(op => op.configId === configId);
        
        // 如果是UPDATE类型操作，检查是否是唯一的UPDATE操作
        if (targetOperation?.operationType === PositionOperationType.UPDATE) {
            // 计算UPDATE操作的数量
            const updateOperationsCount = operations.filter(
                op => op.operationType === PositionOperationType.UPDATE
            ).length;
            
            // 如果是唯一的UPDATE操作，不允许删除
            if (updateOperationsCount <= 1) {
                return; // 阻止删除
            }
        }
        
        // 允许删除非UPDATE操作或者有多个UPDATE操作时删除其中一个
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

        // 如果是将UPDATE类型更改为其他类型，需要检查是否是唯一的UPDATE操作
        if (operation.operationType === PositionOperationType.UPDATE && type !== PositionOperationType.UPDATE) {
            // 计算UPDATE操作的数量
            const updateOperationsCount = operations.filter(
                op => op.operationType === PositionOperationType.UPDATE
            ).length;
            
            // 如果是唯一的UPDATE操作，不允许修改类型
            if (updateOperationsCount <= 1) {
                return; // 阻止类型修改
            }
        }

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
    
    // 选择账户 (作用于当前活动标签页)
    const handleAccountSelect = (accountId: string) => {
        const accounts = getAccounts(); // 获取当前活动标签页的账户列表
        const selectedAccount = accounts.find(account => account.id.toString() === accountId);
        const { setAccount } = getActiveGlobalConfig();
        setAccount(selectedAccount || null);
    };
    
    // 更新交易对 (作用于当前活动标签页)
    const handleSymbolChange = (symbol: string) => {
        const { setSymbol } = getActiveGlobalConfig();
        // 空字符串转换为null，否则保留输入值
        setSymbol(symbol.trim() === "" ? null : symbol);
    };
    
    // 保存配置 (保存所有模式的数据)
    const handleSubmit = () => {
        // 确保操作列表不为空且包含至少一个UPDATE操作
        const ensureOperationsWithUpdate = (operations: PositionOperationConfig[]): PositionOperationConfig[] => {
            // 首先确保不为空
            if (operations.length === 0) {
                return [{
                    configId: 1,
                    operationType: PositionOperationType.UPDATE,
                    operationName: "更新仓位"
                }];
            }
            
            // 检查是否包含UPDATE操作
            const hasUpdateOperation = operations.some(op => op.operationType === PositionOperationType.UPDATE);
            
            // 如果不包含UPDATE操作，添加一个
            if (!hasUpdateOperation) {
                const newConfigId = getNextConfigId(operations);
                return [
                    ...operations,
                    {
                        configId: newConfigId,
                        operationType: PositionOperationType.UPDATE,
                        operationName: generateOperationName(PositionOperationType.UPDATE, operations)
                    }
                ];
            }
            
            return operations;
        };
        
        const updatedData = {
            ...data,
            nodeName: tempNodeName,
            liveConfig: { 
                selectedLiveAccount: liveAccount,
                symbol: liveSymbol,
                operations: ensureOperationsWithUpdate(liveOperations)
            },
            simulateConfig: {
                selectedSimulateAccount: simulateAccount,
                symbol: simulateSymbol,
                operations: ensureOperationsWithUpdate(simulateOperations)
            },
            backtestConfig: { 
                symbol: backtestSymbol,
                operations: ensureOperationsWithUpdate(backtestOperations)
            }
        };
        handleSave(updatedData);
    };
    
    const { operations: currentOperations } = getActiveOperationsAndSetter();
    const { account: currentAccount, symbol: currentSymbol } = getActiveGlobalConfig();
    
    // 获取操作类型的选项列表
    const operationTypeOptions = [
        { value: PositionOperationType.UPDATE, label: "更新仓位" },
        { value: PositionOperationType.CLOSEALL, label: "全部平仓" }
    ];
    
    // 判断操作类型是否已被选择
    const isOperationTypeUsed = (type: PositionOperationType, currentConfigId: number) => {
        return currentOperations.some(op => 
            op.operationType === type && op.configId !== currentConfigId
        );
    };
    
    // 获取可选的操作类型选项（排除当前操作已经选择的类型）
    const getAvailableOperationTypes = (currentConfigId: number) => {
        return operationTypeOptions.filter(option => 
            !isOperationTypeUsed(option.value as PositionOperationType, currentConfigId)
        );
    };
    
    // 判断是否已存在全部平仓操作
    const hasCloseAllOperation = () => {
        return currentOperations.some(op => op.operationType === PositionOperationType.CLOSEALL);
    };
    
    // 判断添加按钮是否应该禁用
    const isAddOperationDisabled = () => {
        // 如果已有全部平仓操作，则不允许添加更多操作
        return hasCloseAllOperation();
    };
    
    // 判断操作是否可删除
    const isOperationRemovable = (operation: PositionOperationConfig): boolean => {
        // 非UPDATE类型操作总是可以删除
        if (operation.operationType !== PositionOperationType.UPDATE) {
            return true;
        }
        
        // UPDATE类型操作，需要检查是否是唯一的UPDATE操作
        const { operations } = getActiveOperationsAndSetter();
        const updateOperationsCount = operations.filter(
            op => op.operationType === PositionOperationType.UPDATE
        ).length;
        
        // 只有当有多个UPDATE操作时，才允许删除
        return updateOperationsCount > 1;
    };
    
    // 判断操作类型是否可修改
    const isOperationTypeChangeable = (operation: PositionOperationConfig): boolean => {
        // 如果不是UPDATE类型，总是可以修改
        if (operation.operationType !== PositionOperationType.UPDATE) {
            return true;
        }
        
        // 如果是UPDATE类型，检查是否是唯一的UPDATE操作
        const { operations } = getActiveOperationsAndSetter();
        const updateOperationsCount = operations.filter(
            op => op.operationType === PositionOperationType.UPDATE
        ).length;
        
        // 只有当有多个UPDATE操作时，才允许修改类型
        return updateOperationsCount > 1;
    };
    
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
                    {/* 全局配置区域 */}
                    <div className="space-y-4 mb-6 p-3 border rounded-md bg-slate-50">
                        <Label className="text-sm font-semibold">全局配置</Label>
                        
                        {/* 账户选择 (仅在实盘和模拟交易模式下显示) */}
                        {(activeTab === TradeMode.LIVE || activeTab === TradeMode.SIMULATE) && (
                            <div className="space-y-1">
                                <Label className="text-xs">选择账户</Label>
                                <Select 
                                    value={currentAccount?.id?.toString() || ''}
                                    onValueChange={handleAccountSelect}
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
                                value={currentSymbol || ""}
                                onChange={(e) => handleSymbolChange(e.target.value)}
                                placeholder="例如: BTCUSDT"
                                className="h-8"
                            />
                        </div>
                    </div>
                    
                    {/* 操作配置面板 */}
                    <div className="space-y-4">
                        {/* 操作列表顶部添加按钮 */}
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">仓位操作配置 ({getTradingModeName(activeTab)})</Label>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={addOperation}
                                disabled={isAddOperationDisabled()}
                            >
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
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={addOperation}
                                    disabled={isAddOperationDisabled()}
                                >
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
                                                        disabled={!isOperationTypeChangeable(operation)}
                                                    >
                                                        <SelectTrigger className="h-8">
                                                            <SelectValue placeholder="选择操作类型" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {getAvailableOperationTypes(operation.configId).map(option => (
                                                                <SelectItem 
                                                                    key={option.value} 
                                                                    value={option.value}
                                                                >
                                                                    {option.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                {/* 删除操作按钮 */}
                                                <div className="pt-1 flex justify-end">
                                                    {isOperationRemovable(operation) && (
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm" 
                                                            onClick={() => removeOperation(operation.configId)}
                                                            className="h-7"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                            删除操作
                                                        </Button>
                                                    )}
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