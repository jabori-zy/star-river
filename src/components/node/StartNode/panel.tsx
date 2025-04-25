// 策略起点节点面板
import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, DrawerOverlay, DrawerPortal } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { X, Plus, CreditCard, Settings, Variable, Code, Hash, AlignLeft } from 'lucide-react'
import { StartNodeData, StrategyVariable, StrategyVariableType } from '@/types/start_node';
import { TradeMode } from '@/types/node';
import { Badge } from "@/components/ui/badge";
import { AccountItem } from '@/types/start_node';
import useTradingModeStore from '@/store/useTradingModeStore';
import useTradingConfigStore from '@/store/useTradingConfigStore';

// 导入拆分后的账户设置组件
import LiveAccount from './AccountSetting/LiveAccount';
// import SimulateAccount from './AccountSetting/SimulateAccount';
// import BacktestAccount from './AccountSetting/BacktestAccount';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

interface StartNodePanelProps {
  id: string;
  data: StartNodeData;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSave: (data: StartNodeData) => void;
}

// 变量编辑对话框的属性
interface VariableDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (variable: StrategyVariable) => void;
  editingVariable?: StrategyVariable;
}

// 变量显示项组件的属性
interface VariableItemProps {
  variable: StrategyVariable;
  onEdit: (variable: StrategyVariable) => void;
  onDelete: (name: string) => void;
}

const StartNodePanel = ({
  data,
  isEditing,
  setIsEditing,
  handleSave
}: StartNodePanelProps) => {
  // 策略标题
  const [strategyTitle, setStrategyTitle] = useState<string>(data?.strategyTitle || "我的策略");
  // 交易模式
  const [tradingMode, setTradingMode] = useState<TradeMode>(data?.tradingMode || TradeMode.LIVE);
  // 引入tradingMode全局状态的更新函数
  const { setTradingMode: setGlobalTradingMode } = useTradingModeStore();
  // 引入各交易模式配置的更新函数
  const { 
    setLiveModeConfig, 
    setSimulateModeConfig, 
    setBacktestModeConfig 
  } = useTradingConfigStore();
  
  // 实盘交易配置
  const [liveAccounts, setLiveAccounts] = useState<AccountItem[]>(data?.liveTradingConfig?.liveAccounts || []);
  const [liveVariables, setLiveVariables] = useState<StrategyVariable[]>(data?.liveTradingConfig?.variables || []);

  // 模拟交易配置
  const [simulateAccounts] = useState<AccountItem[]>(data?.simulateTradingConfig?.simulateAccounts || []);
  const [simulateVariables, setSimulateVariables] = useState<StrategyVariable[]>(data?.simulateTradingConfig?.variables || []);

  // 回测交易配置
  const [backtestStartDate] = useState<string>(data?.backtestTradingConfig?.backtestStartDate || "");
  const [backtestEndDate] = useState<string>(data?.backtestTradingConfig?.backtestEndDate || "");
  const [backtestVariables, setBacktestVariables] = useState<StrategyVariable[]>(data?.backtestTradingConfig?.variables || []);

  // 变量编辑对话框状态
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState<boolean>(false);
  const [editingVariable, setEditingVariable] = useState<StrategyVariable | undefined>(undefined);

  // 获取当前模式的变量列表
  const getCurrentVariables = () => {
    switch (tradingMode) {
      case TradeMode.LIVE:
        return liveVariables;
      case TradeMode.SIMULATE:
        return simulateVariables;
      case TradeMode.BACKTEST:
        return backtestVariables;
      default:
        return [];
    }
  };

  // 设置当前模式的变量列表
  const setCurrentVariables = (variables: StrategyVariable[]) => {
    switch (tradingMode) {
      case TradeMode.LIVE:
        setLiveVariables(variables);
        break;
      case TradeMode.SIMULATE:
        setSimulateVariables(variables);
        break;
      case TradeMode.BACKTEST:
        setBacktestVariables(variables);
        break;
    }
  };

  // 添加或更新变量
  const handleVariableSave = (variable: StrategyVariable) => {
    const currentVariables = getCurrentVariables();
    const index = currentVariables.findIndex(v => v.name === variable.name);
    
    if (index !== -1) {
      // 更新现有变量
      const updatedVariables = [...currentVariables];
      updatedVariables[index] = variable;
      setCurrentVariables(updatedVariables);
    } else {
      // 添加新变量
      setCurrentVariables([...currentVariables, variable]);
    }
    
    setEditingVariable(undefined);
    setIsVariableDialogOpen(false);
  };

  // 编辑变量
  const handleEditVariable = (variable: StrategyVariable) => {
    setEditingVariable(variable);
    setIsVariableDialogOpen(true);
  };

  // 删除变量
  const handleDeleteVariable = (name: string) => {
    const currentVariables = getCurrentVariables();
    setCurrentVariables(currentVariables.filter(v => v.name !== name));
  };

  // 添加新变量
  const handleAddVariable = () => {
    setEditingVariable(undefined);
    setIsVariableDialogOpen(true);
  };

  const preventDragHandler = (e: React.MouseEvent | React.DragEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // 根据不同的交易模式返回不同的描述文本
  const getTradingModeDescription = (mode: TradeMode) => {
    switch (mode) {
      case TradeMode.LIVE:
        return "使用真实资金进行交易";
      case TradeMode.SIMULATE:
        return "使用虚拟资金进行模拟交易，使用实时行情数据";
      case TradeMode.BACKTEST:
        return "使用历史数据进行快速迭代策略测试";
      default:
        return "";
    }
  };

  // 变量编辑对话框组件
  const VariableDialog = ({ isOpen, onOpenChange, onSave, editingVariable }: VariableDialogProps) => {
    const [variableName, setVariableName] = useState<string>(editingVariable?.name || "");
    const [variableDisplayName, setVariableDisplayName] = useState<string>(editingVariable?.displayName || "");
    const [variableType, setVariableType] = useState<StrategyVariableType>(editingVariable?.type || StrategyVariableType.NUMBER);
    const [variableValue, setVariableValue] = useState<string>(editingVariable?.value?.toString() || "");
    const [nameError, setNameError] = useState<string>("");

    // 检查变量名是否符合规则
    const validateVariableName = (name: string): boolean => {
      if (!name) {
        setNameError("变量名不能为空");
        return false;
      }
      
      const nameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
      if (!nameRegex.test(name)) {
        setNameError("变量名必须以字母或下划线开头，只能包含字母、数字和下划线");
        return false;
      }
      
      const currentVariables = getCurrentVariables();
      if (currentVariables.some(v => v.name === name && v.name !== editingVariable?.name)) {
        setNameError("变量名已存在");
        return false;
      }
      
      setNameError("");
      return true;
    };

    const handleValueChange = (value: string) => {
      setVariableValue(value);
    };

    const handleSave = () => {
      if (!validateVariableName(variableName) || !variableDisplayName) {
        return;
      }

      // 根据类型转换值
      let finalValue: string | number = variableValue;
      if (variableType === StrategyVariableType.NUMBER) {
        finalValue = variableValue === "" ? 0 : parseFloat(variableValue);
      }

      onSave({
        name: variableName,
        displayName: variableDisplayName,
        type: variableType,
        value: finalValue
      });
    };

    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingVariable ? '编辑变量' : '添加变量'}</DialogTitle>
            <DialogDescription>
              为策略添加可配置的变量，运行时可根据变量值调整策略行为。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="variable-type" className="text-right">
                变量类型
              </Label>
              <div className="col-span-3">
                <Select 
                  value={variableType} 
                  onValueChange={(value) => setVariableType(value as StrategyVariableType)}
                >
                  <SelectTrigger id="variable-type">
                    <SelectValue placeholder="选择变量类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={StrategyVariableType.NUMBER}>
                      <div className="flex items-center">
                        <Hash className="h-4 w-4 mr-2 text-blue-500" />
                        <span>数字</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={StrategyVariableType.STRING}>
                      <div className="flex items-center">
                        <AlignLeft className="h-4 w-4 mr-2 text-green-500" />
                        <span>字符串</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="variable-name" className="text-right">
                变量名
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="variable-name"
                  value={variableName}
                  onChange={(e) => {
                    setVariableName(e.target.value);
                    validateVariableName(e.target.value);
                  }}
                  placeholder="如: threshold_value"
                  className={nameError ? "border-red-500" : ""}
                  disabled={!!editingVariable} // 编辑模式下不允许修改变量名
                />
                {nameError && <p className="text-xs text-red-500">{nameError}</p>}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="variable-display-name" className="text-right">
                显示名称
              </Label>
              <Input
                id="variable-display-name"
                value={variableDisplayName}
                onChange={(e) => setVariableDisplayName(e.target.value)}
                placeholder="如: 阈值"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="variable-value" className="text-right">
                变量值
              </Label>
              <Input
                id="variable-value"
                value={variableValue}
                onChange={(e) => handleValueChange(e.target.value)}
                placeholder={variableType === StrategyVariableType.NUMBER ? "如: 0.05" : "如: BTC/USDT"}
                type={variableType === StrategyVariableType.NUMBER ? "number" : "text"}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // 变量显示组件
  const VariableItem = ({ variable, onEdit, onDelete }: VariableItemProps) => {
    return (
      <div className="flex items-center justify-between p-2 border rounded-md bg-background group">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="h-5 px-1 cursor-help">
                  {variable.type === StrategyVariableType.NUMBER ? (
                    <Hash className="h-3 w-3 mr-1 text-blue-500" />
                  ) : (
                    <AlignLeft className="h-3 w-3 mr-1 text-green-500" />
                  )}
                  {variable.type === StrategyVariableType.NUMBER ? "数字" : "文本"}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{variable.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span className="font-medium">{variable.displayName}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="text-sm">{variable.value?.toString()}</div>
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => onEdit(variable)}
            >
              <Settings className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-destructive"
              onClick={() => onDelete(variable.name)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Drawer open={isEditing} onOpenChange={setIsEditing} direction="right">
      <div 
        onDragStart={preventDragHandler}
        onDrag={preventDragHandler}
        onDragEnd={preventDragHandler}
        style={{ isolation: 'isolate' }}
      >
        <DrawerPortal>
          <DrawerOverlay className="!bg-transparent" />
          <DrawerContent className="h-[calc(100vh-2rem)] max-w-[400px] rounded-l-xl shadow-2xl mx-0 my-4">
            <DrawerHeader className="border-b">
              <DrawerTitle>编辑策略起点</DrawerTitle>
              <DrawerDescription>
                配置量化策略的全局参数
              </DrawerDescription>
            </DrawerHeader>
            
            <ScrollArea className="flex-1 px-4">
              <div className="py-6 space-y-6">
                {/* 策略标题 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">策略名称</Label>
                  </div>
                  <Input 
                    value={strategyTitle}
                    onChange={(e) => setStrategyTitle(e.target.value)}
                    className="h-8 text-sm"
                    placeholder="输入策略名称"
                  />
                </div>

                {/* 交易模式切换 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <Label className="font-medium">交易模式</Label>
                  </div>
                  <Tabs 
                    defaultValue={tradingMode}
                    value={tradingMode}
                    onValueChange={(value) => setTradingMode(value as TradeMode)}
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
                      {getTradingModeDescription(tradingMode)}
                    </div>
                  </Tabs>
                </div>

                {/* 根据交易模式显示对应的账户配置组件 */}
                {tradingMode === TradeMode.LIVE && (
                  <LiveAccount 
                    liveAccounts={liveAccounts} 
                    setLiveAccounts={setLiveAccounts} 
                  />
                )}

                {/* {tradingMode === TradingMode.SIMULATE 
                && (
                  <SimulateAccount 
                    simulateAccounts={simulateAccounts} 
                    setSimulateAccounts={setSimulateAccounts} 
                  />
                )
                } */}

                {/* {tradingMode === TradingMode.BACKTEST && (
                  <BacktestAccount 
                    backtestStartDate={backtestStartDate}
                    setBacktestStartDate={setBacktestStartDate}
                    backtestEndDate={backtestEndDate}
                    setBacktestEndDate={setBacktestEndDate}
                  />
                )} */}

                {/* 策略变量配置 - 所有模式都显示，但内容各自独立 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Variable className="h-4 w-4 text-muted-foreground" />
                      <Label className="font-medium">策略变量</Label>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleAddVariable}
                    >
                      <Plus className="h-3 w-3 mr-1" /> 添加变量
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {getCurrentVariables().length === 0 ? (
                      <div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
                        <Code className="h-4 w-4 mr-2" /> 
                        暂无变量，点击"添加变量"配置策略参数
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getCurrentVariables().map((variable) => (
                          <VariableItem
                            key={variable.name}
                            variable={variable}
                            onEdit={handleEditVariable}
                            onDelete={handleDeleteVariable}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
                  onClick={() => {
                    // 构建需要保存的数据
                    const newData: StartNodeData = {
                      strategyTitle,
                      tradingMode,
                      // 根据当前选择的交易模式，设置对应的配置
                      ...(tradingMode === TradeMode.LIVE ? {
                        liveTradingConfig: {
                          liveAccounts,
                          variables: liveVariables.length > 0 ? liveVariables : undefined
                        }
                      } : {}),
                      ...(tradingMode === TradeMode.SIMULATE ? {
                        simulateTradingConfig: {
                          simulateAccounts,
                          variables: simulateVariables.length > 0 ? simulateVariables : undefined
                        }
                      } : {}),
                      ...(tradingMode === TradeMode.BACKTEST ? {
                        backtestTradingConfig: {
                          backtestStartDate,
                          backtestEndDate,
                          variables: backtestVariables.length > 0 ? backtestVariables : undefined
                        }
                      } : {})
                    };
                    
                    // 更新节点数据
                    handleSave(newData);
                    
                    // 同时更新全局交易模式状态
                    setGlobalTradingMode(tradingMode);
                    
                    // 更新各交易模式配置独立状态
                    if (tradingMode === TradeMode.LIVE && newData.liveTradingConfig) {
                      setLiveModeConfig(newData.liveTradingConfig);
                    } else if (tradingMode === TradeMode.SIMULATE && newData.simulateTradingConfig) {
                      setSimulateModeConfig(newData.simulateTradingConfig);
                    } else if (tradingMode === TradeMode.BACKTEST && newData.backtestTradingConfig) {
                      setBacktestModeConfig(newData.backtestTradingConfig);
                    }
                    
                    setIsEditing(false);
                  }}
                >
                  保存
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </DrawerPortal>
      </div>
      
      {/* 变量编辑对话框 */}
      <VariableDialog
        isOpen={isVariableDialogOpen}
        onOpenChange={setIsVariableDialogOpen}
        onSave={handleVariableSave}
        editingVariable={editingVariable}
      />
    </Drawer>
  );
};

export default StartNodePanel; 