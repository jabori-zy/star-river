import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { TradeMode } from "@/types/node";
import { Variable, X, Plus, Trash2, Clock, Filter } from 'lucide-react';
import { Strategy, SelectedAccount } from '@/types/strategy';
import { 
    StrategySysVariable,
    GetVariableNodeData, 
    GetVariableConfig,
    GetVariableType,
    TimerConfig
} from '@/types/node/getVariableNode';
import {
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getTradingModeName } from "@/utils/tradingModeHelper";
import { Checkbox } from "@/components/ui/checkbox";

interface GetVariableNodePanelProps {
    data: GetVariableNodeData;
    strategy: Strategy | null;
    nodeName: string;
    onNodeNameChange: (name: string) => void;
    handleSave: (data: GetVariableNodeData) => void;
    setIsEditing: (isEditing: boolean) => void;
}

function GetVariableNodePanel({
    data,
    strategy,
    nodeName,
    onNodeNameChange,
    handleSave,
    setIsEditing,
}: GetVariableNodePanelProps) {
    const [nodeNameEditing, setNodeNameEditing] = useState<boolean>(false);
    const [tempNodeName, setTempNodeName] = useState<string>(nodeName || "获取变量节点");
    
    // 交易模式
    const initialTradingMode = strategy?.tradeMode || TradeMode.SIMULATE;
    const [activeTab, setActiveTab] = useState<TradeMode>(initialTradingMode);
    
    // 各交易模式的账户和交易对设置
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

    // 各交易模式的触发方式和定时配置
    const [liveGetVariableType, setLiveGetVariableType] = useState<GetVariableType>(
        data.liveConfig?.getVariableType || GetVariableType.CONDITION
    );
    const [liveTimerConfig, setLiveTimerConfig] = useState<TimerConfig>(
        data.liveConfig?.timerConfig || { interval: 5, unit: "minute" }
    );

    const [simulateGetVariableType, setSimulateGetVariableType] = useState<GetVariableType>(
        data.simulateConfig?.getVariableType || GetVariableType.CONDITION
    );
    const [simulateTimerConfig, setSimulateTimerConfig] = useState<TimerConfig>(
        data.simulateConfig?.timerConfig || { interval: 5, unit: "minute" }
    );

    const [backtestGetVariableType, setBacktestGetVariableType] = useState<GetVariableType>(
        data.backtestConfig?.getVariableType || GetVariableType.CONDITION
    );
    const [backtestTimerConfig, setBacktestTimerConfig] = useState<TimerConfig>(
        data.backtestConfig?.timerConfig || { interval: 5, unit: "minute" }
    );
    
    // 初始化各个模式的配置
    const initVariables = (configVariables?: GetVariableConfig[]) => {
        if (configVariables && configVariables.length > 0) {
            return [...configVariables];
        }
        return [];
    };

    const [liveVariables, setLiveVariables] = useState<GetVariableConfig[]>(
        initVariables(data.liveConfig?.variables)
    );
    
    const [simulateVariables, setSimulateVariables] = useState<GetVariableConfig[]>(
        initVariables(data.simulateConfig?.variables)
    );
    
    const [backtestVariables, setBacktestVariables] = useState<GetVariableConfig[]>(
        initVariables(data.backtestConfig?.variables)
    );
    
    // 获取当前活动标签页的变量列表及其Setter
    const getActiveVariablesAndSetter = () => {
        switch (activeTab) {
            case TradeMode.LIVE:
                return { variables: liveVariables, setVariables: setLiveVariables };
            case TradeMode.SIMULATE:
                return { variables: simulateVariables, setVariables: setSimulateVariables };
            case TradeMode.BACKTEST:
                return { variables: backtestVariables, setVariables: setBacktestVariables };
            default:
                return { variables: simulateVariables, setVariables: setSimulateVariables }; 
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
                    setSymbol: setLiveSymbol,
                    getVariableType: liveGetVariableType,
                    setGetVariableType: setLiveGetVariableType,
                    timerConfig: liveTimerConfig,
                    setTimerConfig: setLiveTimerConfig
                };
            case TradeMode.SIMULATE:
                return { 
                    account: simulateAccount, 
                    setAccount: setSimulateAccount,
                    symbol: simulateSymbol,
                    setSymbol: setSimulateSymbol,
                    getVariableType: simulateGetVariableType,
                    setGetVariableType: setSimulateGetVariableType,
                    timerConfig: simulateTimerConfig,
                    setTimerConfig: setSimulateTimerConfig
                };
            case TradeMode.BACKTEST:
                return { 
                    account: null, 
                    setAccount: (() => {}) as React.Dispatch<React.SetStateAction<SelectedAccount | null>>,
                    symbol: backtestSymbol,
                    setSymbol: setBacktestSymbol,
                    getVariableType: backtestGetVariableType,
                    setGetVariableType: setBacktestGetVariableType,
                    timerConfig: backtestTimerConfig,
                    setTimerConfig: setBacktestTimerConfig
                };
            default:
                return { 
                    account: simulateAccount, 
                    setAccount: setSimulateAccount,
                    symbol: simulateSymbol,
                    setSymbol: setSimulateSymbol,
                    getVariableType: simulateGetVariableType,
                    setGetVariableType: setSimulateGetVariableType,
                    timerConfig: simulateTimerConfig,
                    setTimerConfig: setSimulateTimerConfig
                };
        }
    };
    
    // 当外部交易模式或数据变化时，更新活动标签
    useEffect(() => {
        setActiveTab(initialTradingMode);
    }, [initialTradingMode]);
    
    // 获取下一个可用的configId
    const getNextConfigId = (variables: GetVariableConfig[], variableType: string) => {
        // 直接返回基于变量类型的configId，不再附加序号
        return `get_variable_node_output_${variableType}`;
    };
    
    // 获取变量类型文本
    const getVariableTypeText = (variable: string = StrategySysVariable.POSITION_NUMBER) => {
        const option = variableTypeOptions.find(opt => opt.value === variable);
        return option ? option.label : "未知变量";
    };
    
    // 生成变量名称 - 基于变量类型而不是'变量1，变量2'
    const generateVariableName = (variableType: string, variables: GetVariableConfig[]) => {
        const typeText = getVariableTypeText(variableType);
        
        // 直接使用变量类型文本作为变量名称
        let newName = typeText;
        let counter = 1;
        
        // 确保名称唯一 (针对极少数情况，可能需要添加后缀)
        while (variables.some(v => v.variableName === newName)) {
            newName = `${typeText}_${counter}`;
            counter++;
        }
        
        return newName;
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
    
    // 添加新变量 (作用于当前活动标签页)
    const addVariable = () => {
        const { variables, setVariables } = getActiveVariablesAndSetter();
        
        // 查找一个未被使用的变量类型
        const availableVariableTypes = getAvailableVariableTypes();
        if (availableVariableTypes.length === 0) {
            return; // 如果所有变量类型都已使用，则不添加
        }
        
        const defaultVariableType = availableVariableTypes[0].value;
        
        const newVariable: GetVariableConfig = {
            configId: getNextConfigId(variables, defaultVariableType),
            variableName: generateVariableName(defaultVariableType, variables),
            variableValue: 0,
            variable: defaultVariableType
        };
        
        setVariables([...variables, newVariable]);
    };
    
    // 删除变量 (作用于当前活动标签页)
    const removeVariable = (configId: string) => {
        const { variables, setVariables } = getActiveVariablesAndSetter();
        setVariables(variables.filter(v => v.configId !== configId));
    };
    
    // 更新变量名称
    const updateVariableName = (configId: string, variableName: string) => {
        const { variables, setVariables } = getActiveVariablesAndSetter();
        setVariables(variables.map(v => 
            v.configId === configId ? { ...v, variableName } : v
        ));
    };
    
    // 更新变量类型
    const updateVariableType = (configId: string, variable: string) => {
        const { variables, setVariables } = getActiveVariablesAndSetter();
        setVariables(variables.map(v => 
            v.configId === configId ? { 
                ...v, 
                variable,
                configId: getNextConfigId(
                    variables.filter(item => item.configId !== configId), 
                    variable
                ),
                variableName: generateVariableName(variable, variables.filter(item => item.configId !== configId)),
                // 根据变量类型设置默认值
                variableValue: typeof v.variableValue === 'number' ? 0 : 
                               typeof v.variableValue === 'string' ? '' : 
                               typeof v.variableValue === 'boolean' ? false : 0
            } : v
        ));
    };

    // 更新当前模式的触发方式
    const updateGetVariableType = (getVariableType: GetVariableType) => {
        const { setGetVariableType } = getActiveGlobalConfig();
        setGetVariableType(getVariableType);
    };

    // 更新定时触发的时间间隔和单位（一次性更新两个属性）
    const updateTimerConfig = (interval: number, unit: "second" | "minute" | "hour" | "day") => {
        const { timerConfig, setTimerConfig } = getActiveGlobalConfig();
        setTimerConfig({ ...timerConfig, interval, unit });
    };
    
    // 处理账户选择
    const handleAccountSelect = (accountId: string) => {
        const { setAccount } = getActiveGlobalConfig();
        const accounts = getAccounts();
        const selectedAccount = accounts.find(account => account.id.toString() === accountId);
        setAccount(selectedAccount || null);
    };
    
    // 处理交易对变更
    const handleSymbolChange = (symbol: string) => {
        const { setSymbol } = getActiveGlobalConfig();
        setSymbol(symbol || null);
    };
    
    // 保存配置 (保存所有模式的数据)
    const handleSubmit = () => {
        const updatedData: GetVariableNodeData = {
            ...data,
            nodeName: tempNodeName,
            liveConfig: { 
                selectedLiveAccount: liveAccount,
                symbol: liveSymbol,
                getVariableType: liveGetVariableType,
                timerConfig: liveGetVariableType === GetVariableType.TIMER ? liveTimerConfig : undefined,
                variables: liveVariables 
            },
            simulateConfig: { 
                selectedSimulateAccount: simulateAccount,
                symbol: simulateSymbol,
                getVariableType: simulateGetVariableType,
                timerConfig: simulateGetVariableType === GetVariableType.TIMER ? simulateTimerConfig : undefined,
                variables: simulateVariables 
            },
            backtestConfig: { 
                symbol: backtestSymbol,
                getVariableType: backtestGetVariableType,
                timerConfig: backtestGetVariableType === GetVariableType.TIMER ? backtestTimerConfig : undefined,
                variables: backtestVariables 
            }
        };
        handleSave(updatedData);
    };
    
    const { variables: currentVariables } = getActiveVariablesAndSetter();
    const { 
        account: currentAccount, 
        symbol: currentSymbol,
        getVariableType: currentGetVariableType,
        timerConfig: currentTimerConfig
    } = getActiveGlobalConfig();
    
    // 变量类型选项
    const variableTypeOptions = [
        { value: StrategySysVariable.POSITION_NUMBER, label: "持仓数量" },
        { value: StrategySysVariable.Filled_ORDER_NUMBER, label: "已成交订单数量" }
    ];
    
    // 获取已使用的变量类型，排除当前编辑的变量
    const getUsedVariableTypes = (currentConfigId?: string) => {
        const { variables } = getActiveVariablesAndSetter();
        return variables
            .filter(v => v.configId !== currentConfigId)
            .map(v => v.variable);
    };
    
    // 获取可用的变量类型选项
    const getAvailableVariableTypes = (currentConfigId?: string) => {
        const usedTypes = getUsedVariableTypes(currentConfigId);
        return variableTypeOptions.filter(option => 
            !usedTypes.includes(option.value)
        );
    };
    
    // 处理交易模式切换
    const handleTabChange = (value: string) => {
        if (value === TradeMode.LIVE) {
            setActiveTab(TradeMode.LIVE);
        } else if (value === TradeMode.SIMULATE) {
            setActiveTab(TradeMode.SIMULATE);
        } else if (value === TradeMode.BACKTEST) {
            setActiveTab(TradeMode.BACKTEST);
        }
    };
    
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
    
    // 账户列表
    const accounts = getAccounts();
    // 判断是否禁用添加变量按钮（所有类型都已使用）
    const isAddVariableDisabled = getAvailableVariableTypes().length === 0;
    
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
                    配置获取变量节点参数
                </DrawerDescription>
            </DrawerHeader>
            
            <Tabs 
                value={activeTab.toString()} 
                onValueChange={handleTabChange}
                className="w-full"
            >
                <div className="px-4 pt-4">
                    <TabsList className="w-full">
                        <TabsTrigger value={TradeMode.LIVE.toString()} className="flex-1">
                            {getTradingModeName(TradeMode.LIVE)}
                        </TabsTrigger>
                        <TabsTrigger value={TradeMode.SIMULATE.toString()} className="flex-1">
                            {getTradingModeName(TradeMode.SIMULATE)}
                        </TabsTrigger>
                        <TabsTrigger value={TradeMode.BACKTEST.toString()} className="flex-1">
                            {getTradingModeName(TradeMode.BACKTEST)}
                        </TabsTrigger>
                    </TabsList>
                </div>
                
                <ScrollArea className="h-[calc(100vh-22rem)] px-4 py-2">
                    {/* 当前模式的账户和交易对配置 */}
                    <div className="space-y-4 mb-4">
                        {/* 账户选择 (仅适用于LIVE和SIMULATE模式) */}
                        {activeTab !== TradeMode.BACKTEST && (
                            <div className="space-y-1">
                                <Label className="text-xs">选择账户</Label>
                                <Select 
                                    value={currentAccount?.id.toString() || ""} 
                                    onValueChange={handleAccountSelect}
                                    disabled={accounts.length === 0}
                                >
                                    <SelectTrigger className="h-8">
                                        <SelectValue placeholder={accounts.length === 0 ? "请配置账户" : "选择账户"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(account => (
                                            <SelectItem key={account.id} value={account.id.toString()}>
                                                {`${account.accountName} (${account.exchange})`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        
                        {/* 交易对配置 */}
                        <div className="space-y-1">
                            <Label className="text-xs">交易对</Label>
                            <Input 
                                type="text"
                                value={currentSymbol || ''}
                                onChange={(e) => handleSymbolChange(e.target.value)}
                                placeholder="例如: BTCUSDT"
                                className="h-8"
                            />
                        </div>

                        {/* 触发方式 */}
                        <div className="space-y-1">
                            <Label className="text-xs">触发方式</Label>
                            <div className="flex items-center space-x-6 pt-1">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`condition-${activeTab}`}
                                        checked={currentGetVariableType === GetVariableType.CONDITION}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                updateGetVariableType(GetVariableType.CONDITION);
                                            }
                                        }}
                                    />
                                    <Label 
                                        htmlFor={`condition-${activeTab}`}
                                        className="text-xs cursor-pointer flex items-center"
                                    >
                                        <Filter className="h-3.5 w-3.5 mr-1 text-orange-500" />
                                        条件触发
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`timer-${activeTab}`}
                                        checked={currentGetVariableType === GetVariableType.TIMER}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                updateGetVariableType(GetVariableType.TIMER);
                                            }
                                        }}
                                    />
                                    <Label 
                                        htmlFor={`timer-${activeTab}`}
                                        className="text-xs cursor-pointer flex items-center"
                                    >
                                        <Clock className="h-3.5 w-3.5 mr-1 text-blue-500" />
                                        定时触发
                                    </Label>
                                </div>
                            </div>
                        </div>

                        {/* 定时触发配置 - 仅在选择定时触发时显示 */}
                        {currentGetVariableType === GetVariableType.TIMER && (
                            <div className="space-y-1">
                                <Label className="text-xs">定时配置</Label>
                                <div className="flex items-center space-x-2">
                                    <Input 
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={currentTimerConfig.interval}
                                        onChange={(e) => updateTimerConfig(parseInt(e.target.value) || 1, currentTimerConfig.unit)}
                                        className="h-8 w-20"
                                    />
                                    <Select 
                                        value={currentTimerConfig.unit} 
                                        onValueChange={(value: "second" | "minute" | "hour" | "day") => 
                                            updateTimerConfig(currentTimerConfig.interval, value)
                                        }
                                    >
                                        <SelectTrigger className="h-8 flex-1">
                                            <SelectValue placeholder="选择时间单位" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="second">秒</SelectItem>
                                            <SelectItem value="minute">分钟</SelectItem>
                                            <SelectItem value="hour">小时</SelectItem>
                                            <SelectItem value="day">天</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {/* 1s */}
                                    <Badge variant="outline" className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
                                        onClick={() => updateTimerConfig(1, "second")}
                                    >
                                        <Clock className="h-3 w-3 mr-1" />1s
                                    </Badge>
                                    
                                    <Badge variant="outline" className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
                                        onClick={() => updateTimerConfig(1, "minute")}
                                    >
                                        <Clock className="h-3 w-3 mr-1" />1m
                                    </Badge>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
                                        onClick={() => updateTimerConfig(5, "minute")}
                                    >
                                        <Clock className="h-3 w-3 mr-1" />5m
                                    </Badge>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
                                        onClick={() => updateTimerConfig(1, "hour")}
                                    >
                                        <Clock className="h-3 w-3 mr-1" />1h
                                    </Badge>
                                    <Badge variant="outline" className="bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100"
                                        onClick={() => updateTimerConfig(1, "day")}
                                    >
                                        <Clock className="h-3 w-3 mr-1" />1d
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* 变量配置面板 */}
                    <div className="space-y-4">
                        {/* 变量列表顶部添加按钮 */}
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">变量配置 ({getTradingModeName(activeTab)})</Label>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={addVariable}
                                disabled={isAddVariableDisabled}
                                title={isAddVariableDisabled ? "所有可用变量类型都已添加" : "添加变量"}
                            >
                                <Plus className="h-3.5 w-3.5 mr-1" />
                                添加变量
                            </Button>
                        </div>
                        
                        {/* 变量列表 */}
                        {currentVariables.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md bg-slate-50">
                                <div className="text-sm text-muted-foreground text-center mb-3">
                                    暂无变量配置
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={addVariable}
                                    disabled={isAddVariableDisabled}
                                >
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    添加第一个变量
                                </Button>
                            </div>
                        ) : (
                            <Accordion type="multiple" className="w-full space-y-2">
                                {currentVariables.map((variable) => (
                                    <AccordionItem 
                                        key={variable.configId} 
                                        value={variable.configId}
                                        className="border rounded-md bg-slate-50"
                                    >
                                        <AccordionTrigger className="px-3 py-2 hover:no-underline">
                                            <div className="flex items-center gap-3 w-full">
                                                <Variable className="h-3.5 w-3.5 text-green-500" />
                                                <span className="text-sm">{variable.variableName}</span>
                                                
                                                <Badge variant="outline" className="ml-auto text-[10px] bg-green-100 text-green-800">
                                                    {getVariableTypeText(variable.variable)}
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-3 py-2">
                                            <div className="space-y-3">
                                                {/* 变量名称 */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs">变量名称</Label>
                                                    <Input 
                                                        type="text"
                                                        value={variable.variableName}
                                                        onChange={(e) => updateVariableName(variable.configId, e.target.value)}
                                                        className="h-8"
                                                    />
                                                </div>
                                                
                                                {/* 变量类型 */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs">变量类型</Label>
                                                    <Select 
                                                        value={variable.variable} 
                                                        onValueChange={(value) => updateVariableType(variable.configId, value)}
                                                    >
                                                        <SelectTrigger className="h-8">
                                                            <SelectValue placeholder="选择变量类型" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {/* 当前变量已选类型 */}
                                                            <SelectItem key={variable.variable} value={variable.variable}>
                                                                {getVariableTypeText(variable.variable)}
                                                            </SelectItem>
                                                            
                                                            {/* 其他可用类型 */}
                                                            {getAvailableVariableTypes(variable.configId).map(option => (
                                                                option.value !== variable.variable && (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                )
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                
                                                {/* 删除变量按钮 */}
                                                <div className="pt-1 flex justify-end">
                                                    <Button 
                                                        variant="destructive" 
                                                        size="sm" 
                                                        onClick={() => removeVariable(variable.configId)}
                                                        className="h-7"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                                                        删除变量
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

export default GetVariableNodePanel; 