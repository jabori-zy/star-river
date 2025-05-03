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
import { Variable, X, Plus, Trash2 } from 'lucide-react';
import { Strategy, SelectedAccount } from '@/types/strategy';
import { 
    StrategySysVariable,
    GetVariableNodeData, 
    GetVariableConfig
} from '@/types/getVariableNode';
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
import { MultiSelect } from "@/components/ui/multi-select";

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
    
    // 记录MultiSelect默认选中值的状态
    const [accountSelectKey, setAccountSelectKey] = useState<number>(0);
    
    // 交易模式
    const initialTradingMode = strategy?.tradeMode || TradeMode.SIMULATE;
    const [activeTab, setActiveTab] = useState<TradeMode>(initialTradingMode);
    
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
    
    // 当外部交易模式或数据变化时，更新活动标签
    useEffect(() => {
        setActiveTab(initialTradingMode);
    }, [initialTradingMode]);
    
    // 获取下一个可用的configId
    const getNextConfigId = (variables: GetVariableConfig[]) => {
        if (variables.length === 0) return 1;
        return Math.max(...variables.map(v => v.configId)) + 1;
    };
    
    // 生成变量名称
    const generateVariableName = (variables: GetVariableConfig[]) => {
        const baseName = "变量";
        let newName = `${baseName}${variables.length + 1}`;
        let counter = 1;
        
        while (variables.some(v => v.variableName === newName)) {
            newName = `${baseName}${variables.length + 1}_${counter}`;
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
        const newVariable: GetVariableConfig = {
            configId: getNextConfigId(variables),
            variableName: generateVariableName(variables),
            variableValue: 0,
            variable: StrategySysVariable.POSITION_NUMBER,
            selectedAccount: [],
            symbol: null
        };
        
        setVariables([...variables, newVariable]);
    };
    
    // 删除变量 (作用于当前活动标签页)
    const removeVariable = (configId: number) => {
        const { variables, setVariables } = getActiveVariablesAndSetter();
        setVariables(variables.filter(v => v.configId !== configId));
    };
    
    // 更新变量名称
    const updateVariableName = (configId: number, variableName: string) => {
        const { variables, setVariables } = getActiveVariablesAndSetter();
        setVariables(variables.map(v => 
            v.configId === configId ? { ...v, variableName } : v
        ));
    };
    
    // 更新交易对
    const updateSymbol = (configId: number, symbol: string) => {
        const { variables, setVariables } = getActiveVariablesAndSetter();
        setVariables(variables.map(v => 
            v.configId === configId ? { ...v, symbol } : v
        ));
    };
    
    // 更新变量类型
    const updateVariableType = (configId: number, variable: string) => {
        const { variables, setVariables } = getActiveVariablesAndSetter();
        setVariables(variables.map(v => 
            v.configId === configId ? { 
                ...v, 
                variable,
                // 根据变量类型设置默认值
                variableValue: typeof v.variableValue === 'number' ? 0 : 
                               typeof v.variableValue === 'string' ? '' : 
                               typeof v.variableValue === 'boolean' ? false : 0
            } : v
        ));
    };
    
    // 更新某个变量的账户选择
    const updateSelectedAccounts = (configId: number, selectedAccounts: SelectedAccount[]) => {
        const { variables, setVariables } = getActiveVariablesAndSetter();
        setVariables(variables.map(v => 
            v.configId === configId ? { ...v, selectedAccount: selectedAccounts } : v
        ));
        // 更新key强制重新渲染MultiSelect组件
        setAccountSelectKey(prev => prev + 1);
    };
    
    // 保存配置 (保存所有模式的数据)
    const handleSubmit = () => {
        const updatedData: GetVariableNodeData = {
            ...data,
            nodeName: tempNodeName,
            liveConfig: { variables: liveVariables },
            simulateConfig: { variables: simulateVariables },
            backtestConfig: { variables: backtestVariables }
        };
        handleSave(updatedData);
    };
    
    const { variables: currentVariables } = getActiveVariablesAndSetter();
    
    // 变量类型选项
    const variableTypeOptions = [
        { value: StrategySysVariable.POSITION_NUMBER, label: "持仓数量" },
        { value: StrategySysVariable.Filled_ORDER_NUMBER, label: "已成交订单数量" }
    ];
    
    // 获取变量类型文本
    const getVariableTypeText = (variable: string = StrategySysVariable.POSITION_NUMBER) => {
        const option = variableTypeOptions.find(opt => opt.value === variable);
        return option ? option.label : "未知变量";
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
                    {/* 变量配置面板 */}
                    <div className="space-y-4">
                        {/* 变量列表顶部添加按钮 */}
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">变量配置 ({getTradingModeName(activeTab)})</Label>
                            <Button variant="outline" size="sm" onClick={addVariable}>
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
                                <Button variant="outline" size="sm" onClick={addVariable}>
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    添加第一个变量
                                </Button>
                            </div>
                        ) : (
                            <Accordion type="multiple" className="w-full space-y-2">
                                {currentVariables.map((variable) => (
                                    <AccordionItem 
                                        key={variable.configId} 
                                        value={variable.configId.toString()}
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
                                                            {variableTypeOptions.map(option => (
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
                                                        <Label className="text-xs mb-1 flex justify-between items-center">
                                                            <span>选择账户</span>
                                                            <span className="text-[10px] text-muted-foreground">
                                                                {variable.selectedAccount.length > 0 
                                                                    ? `已选择 ${variable.selectedAccount.length} 个账户` 
                                                                    : "未选择账户"}
                                                            </span>
                                                        </Label>
                                                        
                                                        {/* 使用MultiSelect组件替换原有的账户选择器 */}
                                                        <MultiSelect
                                                            key={`account-select-${variable.configId}-${accountSelectKey}`}
                                                            options={getAccounts().map(account => ({
                                                                label: `${account.accountName} (${account.exchange})`,
                                                                value: account.id.toString()
                                                            }))}
                                                            placeholder="选择账户"
                                                            defaultValue={variable.selectedAccount.map(acc => acc.id.toString())}
                                                            modalPopover={true}
                                                            className="h-8 text-xs"
                                                            onValueChange={(selectedValues) => {
                                                                const allAccounts = getAccounts();
                                                                const selectedAccounts = selectedValues.map(val => 
                                                                    allAccounts.find(acc => acc.id.toString() === val)
                                                                ).filter(acc => acc !== undefined) as SelectedAccount[];
                                                                
                                                                updateSelectedAccounts(variable.configId, selectedAccounts);
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* 交易对 */}
                                                <div className="space-y-1">
                                                    <Label className="text-xs">交易对</Label>
                                                    <Input 
                                                        type="text"
                                                        value={variable.symbol || ''}
                                                        onChange={(e) => updateSymbol(variable.configId, e.target.value)}
                                                        placeholder="例如: BTCUSDT"
                                                        className="h-8"
                                                    />
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