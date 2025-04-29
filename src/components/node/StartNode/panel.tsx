// 策略起点节点面板
import { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, DrawerOverlay, DrawerPortal } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, CreditCard, Settings, Variable, Code, X } from 'lucide-react'
import { TradeMode } from '@/types/node';
import { Strategy, SelectedAccount, StrategyVariable as StrategyVarType } from '@/types/strategy';
// 导入拆分后的账户设置组件
import LiveAccount from './AccountSetting/LiveAccount';
// import SimulateAccount from './AccountSetting/SimulateAccount';
// import BacktestAccount from './AccountSetting/BacktestAccount';
// 导入变量相关组件
import VariableDialog from './variableDialog';
import VariableItem from './VariableItem';


interface StartNodePanelProps {
  strategy: Strategy | undefined;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSaveStrategy: (strategy: Strategy) => void;
  nodeName: string;
  onNodeNameChange: (name: string) => void;
}

const StartNodePanel: React.FC<StartNodePanelProps> = ({
  strategy,
  isEditing,
  setIsEditing,
  handleSaveStrategy,
  nodeName,
  onNodeNameChange
}: StartNodePanelProps) => {
  // 策略标题
  const [strategyTitle, setStrategyTitle] = useState<string>(strategy?.name || "我的策略");
  // 节点名称修改
  const [tempNodeName, setTempNodeName] = useState<string>(nodeName || "策略起点");
  const [nodeNameEditing, setNodeNameEditing] = useState<boolean>(false);
  // 交易模式
  const [tradingMode, setTradingMode] = useState<TradeMode>(strategy?.tradeMode || TradeMode.LIVE);
  
  // 实盘交易配置
  const [liveAccounts, setLiveAccounts] = useState<SelectedAccount[]>(strategy?.config?.liveConfig?.liveAccounts || []);
  const [liveVariables, setLiveVariables] = useState<StrategyVarType[]>(strategy?.config?.liveConfig?.variables || []);

  // 模拟交易配置
  const [simulateAccounts] = useState<SelectedAccount[]>(strategy?.config?.simulateConfig?.simulateAccounts || []);
  const [simulateVariables, setSimulateVariables] = useState<StrategyVarType[]>(strategy?.config?.simulateConfig?.variables || []);

  // 回测交易配置
  const [backtestStartDate] = useState<string>(strategy?.config?.backtestConfig?.backtestStartDate || "");
  const [backtestEndDate] = useState<string>(strategy?.config?.backtestConfig?.backtestEndDate || "");
  const [backtestVariables, setBacktestVariables] = useState<StrategyVarType[]>(strategy?.config?.backtestConfig?.variables || []);

  // 变量编辑对话框状态
  const [isVariableDialogOpen, setIsVariableDialogOpen] = useState<boolean>(false);
  const [editingVariable, setEditingVariable] = useState<StrategyVarType | undefined>(undefined);

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
  const setCurrentVariables = (variables: StrategyVarType[]) => {
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
  const handleVariableSave = (variable: StrategyVarType) => {
    const currentVariables = getCurrentVariables();
    const index = currentVariables.findIndex(v => v.varName === variable.varName);
    
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
  const handleEditVariable = (variable: StrategyVarType) => {
    setEditingVariable(variable);
    setIsVariableDialogOpen(true);
  };

  // 删除变量
  const handleDeleteVariable = (varName: string) => {
    const currentVariables = getCurrentVariables();
    setCurrentVariables(currentVariables.filter(v => v.varName !== varName));
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

  // 保存按钮处理
  const handleSaveButton = () => {
    // 更新策略状态
    if (strategy) {
      // 创建策略对象的副本
      const updatedStrategy = { ...strategy};
      
      // 更新策略名称
      updatedStrategy.name = strategyTitle;
      
      // 更新对应模式下的账户和变量信息
      if (tradingMode === TradeMode.LIVE) {
        updatedStrategy.config.liveConfig = {
          liveAccounts: liveAccounts,
          variables: liveVariables.length > 0 ? liveVariables : undefined
        };
      } else if (tradingMode === TradeMode.SIMULATE) {
        updatedStrategy.config.simulateConfig = {
          simulateAccounts: simulateAccounts,
          variables: simulateVariables.length > 0 ? simulateVariables : undefined
        };
      } else if (tradingMode === TradeMode.BACKTEST) {
        updatedStrategy.config.backtestConfig = {
          backtestStartDate,
          backtestEndDate,
          variables: backtestVariables.length > 0 ? backtestVariables : undefined
        };
      }
      console.log("准备更新的updatedStrategy", updatedStrategy);

      handleSaveStrategy(updatedStrategy);
    }

    // 延迟关闭面板，确保数据更新完成
    setTimeout(() => {
      setIsEditing(false);
    }, 150);
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
          <DrawerContent
            className="h-[calc(100vh-2rem)] max-w-[400px] rounded-l-xl shadow-2xl mx-0 my-4"
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
                            key={variable.varName}
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
                  onClick={handleSaveButton}
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
        currentVariables={getCurrentVariables()}
      />
    </Drawer>
  );
};

export default StartNodePanel; 