import { useState } from 'react';
import {
    DrawerContent,
    DrawerClose,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from 'lucide-react';
import { TradeMode } from "@/types/node";
import { Strategy, DataSourceExchange, BacktestDataSource } from "@/types/strategy";
import { type OrderNodeData} from "@/types/node/orderNode";

interface OrderNodePanelProps {
    data: OrderNodeData['data'];
    strategy: Strategy | undefined;
    setIsEditing: (value: boolean) => void;
    handleSave: (data: OrderNodeData['data']) => void;
    nodeName: string;
    onNodeNameChange: (name: string) => void;
}

const OrderNodePanel = ({
    data,
    strategy,
    setIsEditing,
    handleSave,
    nodeName,
    onNodeNameChange
}: OrderNodePanelProps) => {
    // 节点名称修改
    const [tempNodeName, setTempNodeName] = useState<string>(nodeName || "订单节点");
    const [nodeNameEditing, setNodeNameEditing] = useState<boolean>(false);
    
    // 设置当前交易模式，默认使用策略设置的模式
    const tradingMode = strategy?.tradeMode || TradeMode.LIVE;
    const [currentTradeMode, setCurrentTradeMode] = useState<TradeMode>(tradingMode);

    // 策略中的账户
    const strategyLiveAccounts = strategy?.config.liveConfig?.liveAccounts || [];
    const strategySimulateAccounts = strategy?.config.simulateConfig?.simulateAccounts || [];
    
    // 策略中的回测数据源交易所和数据源类型
    const backtestFromExchanges = strategy?.config.backtestConfig?.fromExchanges || [];
    const backtestDataSource = strategy?.config.backtestConfig?.dataSource;
    const _backtestTimeRange = strategy?.config.backtestConfig?.timeRange;

    // 实盘交易配置
    const [liveSymbol, setLiveSymbol] = useState<string>(data.liveConfig?.orderConfig?.symbol || "BTCUSDT");
    const [liveOrderType, setLiveOrderType] = useState<string>(data.liveConfig?.orderConfig?.orderType || "limit");
    const [liveOrderSide, setLiveOrderSide] = useState<string>(data.liveConfig?.orderConfig?.orderSide || "long");
    const [livePrice, setLivePrice] = useState<number>(data.liveConfig?.orderConfig?.price || 0);
    const [liveQuantity, setLiveQuantity] = useState<number>(data.liveConfig?.orderConfig?.quantity || 0);
    const [liveTp, setLiveTp] = useState<number | null>(data.liveConfig?.orderConfig?.tp || null);
    const [liveSl, setLiveSl] = useState<number | null>(data.liveConfig?.orderConfig?.sl || null);
    const [liveSelectedAccount, setLiveSelectedAccount] = useState<string | undefined>(
        data.liveConfig?.selectedLiveAccount ? JSON.stringify(data.liveConfig.selectedLiveAccount) : undefined
    );

    // 模拟交易配置
    const [simulateSymbol, setSimulateSymbol] = useState<string>(data.simulateConfig?.orderConfig?.symbol || "BTCUSDT");
    const [simulateOrderType, setSimulateOrderType] = useState<string>(data.simulateConfig?.orderConfig?.orderType || "limit");
    const [simulateOrderSide, setSimulateOrderSide] = useState<string>(data.simulateConfig?.orderConfig?.orderSide || "long");
    const [simulatePrice, setSimulatePrice] = useState<number>(data.simulateConfig?.orderConfig?.price || 0);
    const [simulateQuantity, setSimulateQuantity] = useState<number>(data.simulateConfig?.orderConfig?.quantity || 0);
    const [simulateTp, setSimulateTp] = useState<number | null>(data.simulateConfig?.orderConfig?.tp || null);
    const [simulateSl, setSimulateSl] = useState<number | null>(data.simulateConfig?.orderConfig?.sl || null);
    const [simulateSelectedAccount, setSimulateSelectedAccount] = useState<string | undefined>(
        data.simulateConfig?.selectedSimulateAccount ? JSON.stringify(data.simulateConfig.selectedSimulateAccount) : undefined
    );

    // 回测交易配置
    const [backtestSymbol, setBacktestSymbol] = useState<string>(
        data.backtestConfig?.exchangeConfig?.symbol || data.backtestConfig?.orderConfig?.symbol || "BTCUSDT"
    );
    const [backtestOrderType, setBacktestOrderType] = useState<string>(data.backtestConfig?.orderConfig?.orderType || "limit");
    const [backtestOrderSide, setBacktestOrderSide] = useState<string>(data.backtestConfig?.orderConfig?.orderSide || "long");
    const [backtestPrice, setBacktestPrice] = useState<number>(data.backtestConfig?.orderConfig?.price || 0);
    const [backtestQuantity, setBacktestQuantity] = useState<number>(data.backtestConfig?.orderConfig?.quantity || 0);
    const [backtestTp, setBacktestTp] = useState<number | null>(data.backtestConfig?.orderConfig?.tp || null);
    const [backtestSl, setBacktestSl] = useState<number | null>(data.backtestConfig?.orderConfig?.sl || null);
    
    // 回测数据源交易所选择
    const [backtestSelectedDataSource, setBacktestSelectedDataSource] = useState<string | undefined>(
        data.backtestConfig?.exchangeConfig?.selectedDataSource ? JSON.stringify(data.backtestConfig.exchangeConfig.selectedDataSource) : undefined
    );

    // 获取交易模式的描述文本
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

    // 节点名称相关函数
    const handleDoubleClick = () => {
        setNodeNameEditing(true);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempNodeName(e.target.value);
    };

    const saveNodeName = () => {
        onNodeNameChange(tempNodeName);
        setNodeNameEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            saveNodeName();
        }
    };

    // 保存配置
    const onSave = () => {
        const updatedData = {
            ...data,
            nodeName: tempNodeName,
        };

        // 更新实盘交易配置
        if (currentTradeMode === TradeMode.LIVE || data.liveConfig) {
            const selectedLiveAccountObj = liveSelectedAccount ? JSON.parse(liveSelectedAccount) : null;
            updatedData.liveConfig = {
                ...data.liveConfig,
                orderConfig: {
                    ...data.liveConfig?.orderConfig,
                    symbol: liveSymbol,
                    orderType: liveOrderType,
                    orderSide: liveOrderSide,
                    price: livePrice,
                    quantity: liveQuantity,
                    tp: liveTp,
                    sl: liveSl,
                },
                selectedLiveAccount: selectedLiveAccountObj
            };
        }

        // 更新模拟交易配置
        if (currentTradeMode === TradeMode.SIMULATE || data.simulateConfig) {
            const selectedSimulateAccountObj = simulateSelectedAccount ? JSON.parse(simulateSelectedAccount) : null;
            updatedData.simulateConfig = {
                ...data.simulateConfig,
                orderConfig: {
                    ...data.simulateConfig?.orderConfig,
                    symbol: simulateSymbol,
                    orderType: simulateOrderType,
                    orderSide: simulateOrderSide,
                    price: simulatePrice,
                    quantity: simulateQuantity,
                    tp: simulateTp,
                    sl: simulateSl,
                },
                selectedSimulateAccount: selectedSimulateAccountObj
            };
        }

        // 更新回测交易配置
        if (currentTradeMode === TradeMode.BACKTEST || data.backtestConfig) {
            const selectedDataSourceObj = backtestSelectedDataSource ? JSON.parse(backtestSelectedDataSource) : null;
            updatedData.backtestConfig = {
                ...data.backtestConfig,
                dataSource: backtestDataSource || BacktestDataSource.EXCHANGE,
                orderConfig: {
                    ...data.backtestConfig?.orderConfig,
                    symbol: backtestSymbol,
                    orderType: backtestOrderType,
                    orderSide: backtestOrderSide,
                    price: backtestPrice,
                    quantity: backtestQuantity,
                    tp: backtestTp,
                    sl: backtestSl,
                }
            };

            // 如果数据源是交易所，则设置exchangeConfig
            if (backtestDataSource === BacktestDataSource.EXCHANGE && selectedDataSourceObj && _backtestTimeRange) {
                updatedData.backtestConfig.exchangeConfig = {
                    selectedDataSource: selectedDataSourceObj,
                    symbol: backtestSymbol,
                    timeRange: _backtestTimeRange
                };
            }
        }

        handleSave(updatedData);
    };

    return (
        <DrawerContent 
            className="h-[calc(100vh-2rem)] max-w-[400px] rounded-l-xl shadow-2xl mx-0 my-4"
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
                    配置买入操作参数
                </DrawerDescription>
            </DrawerHeader>
            
            <ScrollArea className="px-4 max-h-[70vh]">
                <div className="py-6">
                    {/* 交易模式切换 */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-3">交易模式</h3>
                        <Tabs 
                            defaultValue={currentTradeMode}
                            value={currentTradeMode}
                            onValueChange={(value) => setCurrentTradeMode(value as TradeMode)}
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
                                {getTradingModeDescription(currentTradeMode)}
                            </div>
                        </Tabs>
                    </div>

                    {/* 根据当前选择的交易模式显示不同的配置 */}
                    {currentTradeMode === TradeMode.LIVE && (
                        <>
                            {/* 账户选择 */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">账户选择</h3>
                                {strategyLiveAccounts.length > 0 ? (
                                    <Select value={liveSelectedAccount} onValueChange={setLiveSelectedAccount}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="选择交易账户" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {strategyLiveAccounts.map((account) => (
                                                <SelectItem 
                                                    key={account.id} 
                                                    value={JSON.stringify(account)}
                                                >
                                                    {account.accountName} ({account.exchange})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="text-sm text-red-500">
                                        请先在策略设置中添加交易账户
                                    </div>
                                )}
                            </div>

                            {/* 交易基本信息 */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">交易基本信息</h3>
                                <div className="space-y-3">
                                    {/* 交易对 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            交易对
                                        </Label>
                                        <Input 
                                            type="text"
                                            value={liveSymbol}
                                            onChange={(e) => setLiveSymbol(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 订单类型信息 - 两列布局 */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">订单类型</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 订单类型 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            订单类型
                                        </Label>
                                        <Select value={liveOrderType} onValueChange={setLiveOrderType}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="选择订单类型" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="market">市价单</SelectItem>
                                                <SelectItem value="limit">限价单</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {/* 订单方向 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            订单方向
                                        </Label>
                                        <Select value={liveOrderSide} onValueChange={setLiveOrderSide}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="选择订单方向" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="long">做多</SelectItem>
                                                <SelectItem value="short">做空</SelectItem>
                                                <SelectItem value="close">平仓</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* 价格和数量信息 */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">订单参数</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 价格 */}
                                    {liveOrderType === "limit" ? (
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm">
                                                价格
                                            </Label>
                                            <Input 
                                                type="number"
                                                value={livePrice}
                                                onChange={(e) => setLivePrice(Number(e.target.value))}
                                                min={0}
                                                step="0.001"
                                                className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm text-gray-400">
                                                价格
                                            </Label>
                                            <Input 
                                                type="text"
                                                value="市价"
                                                disabled
                                                className="h-9 bg-gray-100 text-gray-500"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* 数量 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            数量
                                        </Label>
                                        <Input 
                                            type="number"
                                            value={liveQuantity}
                                            onChange={(e) => setLiveQuantity(Number(e.target.value))}
                                            min={0}
                                            step="0.00000001"
                                            className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 止盈止损信息 */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">风险管理 <span className="text-xs text-gray-400">(可选)</span></h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 止盈 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            止盈价格
                                        </Label>
                                        <Input 
                                            type="number"
                                            value={liveTp === null ? "" : liveTp}
                                            onChange={(e) => setLiveTp(e.target.value === "" ? null : Number(e.target.value))}
                                            min={0}
                                            step="0.0001"
                                            placeholder={liveOrderSide === "long" ? "高于买入价" : "低于卖出价"}
                                            className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    
                                    {/* 止损 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            止损价格
                                        </Label>
                                        <Input 
                                            type="number"
                                            value={liveSl === null ? "" : liveSl}
                                            onChange={(e) => setLiveSl(e.target.value === "" ? null : Number(e.target.value))}
                                            min={0}
                                            step="0.00000001"
                                            placeholder={liveOrderSide === "long" ? "低于买入价" : "高于卖出价"}
                                            className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 模拟交易配置 */}
                    {currentTradeMode === TradeMode.SIMULATE && (
                        <>
                            {/* 账户选择 */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">账户选择</h3>
                                {strategySimulateAccounts.length > 0 ? (
                                    <Select value={simulateSelectedAccount} onValueChange={setSimulateSelectedAccount}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="选择模拟账户" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {strategySimulateAccounts.map((account) => (
                                                <SelectItem 
                                                    key={account.id} 
                                                    value={JSON.stringify(account)}
                                                >
                                                    {account.accountName} ({account.exchange})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="text-sm text-red-500">
                                        请先在策略设置中添加模拟账户
                                    </div>
                                )}
                            </div>

                            {/* 交易基本信息 */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">交易基本信息</h3>
                                <div className="space-y-3">
                                    {/* 交易对 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            交易对
                                        </Label>
                                        <Input 
                                            type="text"
                                            value={simulateSymbol}
                                            onChange={(e) => setSimulateSymbol(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 订单类型信息 - 两列布局 */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">订单类型</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 订单类型 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            订单类型
                                        </Label>
                                        <Select value={simulateOrderType} onValueChange={setSimulateOrderType}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="选择订单类型" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="market">市价单</SelectItem>
                                                <SelectItem value="limit">限价单</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {/* 订单方向 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            订单方向
                                        </Label>
                                        <Select value={simulateOrderSide} onValueChange={setSimulateOrderSide}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="选择订单方向" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="long">做多</SelectItem>
                                                <SelectItem value="short">做空</SelectItem>
                                                <SelectItem value="close">平仓</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* 价格和数量信息 */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">订单参数</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 价格 */}
                                    {simulateOrderType === "limit" ? (
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm">
                                                价格
                                            </Label>
                                            <Input 
                                                type="number"
                                                value={simulatePrice}
                                                onChange={(e) => setSimulatePrice(Number(e.target.value))}
                                                min={0}
                                                step="0.001"
                                                className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm text-gray-400">
                                                价格
                                            </Label>
                                            <Input 
                                                type="text"
                                                value="市价"
                                                disabled
                                                className="h-9 bg-gray-100 text-gray-500"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* 数量 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            数量
                                        </Label>
                                        <Input 
                                            type="number"
                                            value={simulateQuantity}
                                            onChange={(e) => setSimulateQuantity(Number(e.target.value))}
                                            min={0}
                                            step="0.00000001"
                                            className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 止盈止损信息 */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">风险管理 <span className="text-xs text-gray-400">(可选)</span></h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 止盈 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            止盈价格
                                        </Label>
                                        <Input 
                                            type="number"
                                            value={simulateTp === null ? "" : simulateTp}
                                            onChange={(e) => setSimulateTp(e.target.value === "" ? null : Number(e.target.value))}
                                            min={0}
                                            step="0.0001"
                                            placeholder={simulateOrderSide === "long" ? "高于买入价" : "低于卖出价"}
                                            className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    
                                    {/* 止损 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            止损价格
                                        </Label>
                                        <Input 
                                            type="number"
                                            value={simulateSl === null ? "" : simulateSl}
                                            onChange={(e) => setSimulateSl(e.target.value === "" ? null : Number(e.target.value))}
                                            min={0}
                                            step="0.00000001"
                                            placeholder={simulateOrderSide === "long" ? "低于买入价" : "高于卖出价"}
                                            className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 回测交易配置 */}
                    {currentTradeMode === TradeMode.BACKTEST && (
                        <>
                            {/* 回测数据来源显示 */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">回测数据来源</h3>
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="text-sm font-medium text-blue-700">
                                        {backtestDataSource === BacktestDataSource.FILE ? "数据来源：自定义文件" : "数据来源：交易所"}
                                    </div>
                                    <div className="text-xs text-blue-600 mt-1">
                                        {backtestDataSource === BacktestDataSource.FILE 
                                            ? "使用用户上传的历史数据文件进行回测" 
                                            : "使用从交易所获取的历史数据进行回测"}
                                    </div>
                                </div>
                            </div>

                            {/* 数据源交易所选择 - 仅当数据源为交易所时显示 */}
                            {backtestDataSource === BacktestDataSource.EXCHANGE && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3">数据源交易所</h3>
                                    {backtestFromExchanges.length > 0 ? (
                                        <Select value={backtestSelectedDataSource} onValueChange={setBacktestSelectedDataSource}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="选择数据源交易所" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {backtestFromExchanges.map((exchange: DataSourceExchange) => (
                                                    <SelectItem 
                                                        key={exchange.id} 
                                                        value={JSON.stringify(exchange)}
                                                    >
                                                        {exchange.accountName} ({exchange.exchange})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="text-sm text-red-500">
                                            请先在策略起始节点中配置数据源交易所
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 交易基本信息 */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">交易基本信息</h3>
                                <div className="space-y-3">
                                    {/* 交易对 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            交易对
                                        </Label>
                                        <Input 
                                            type="text"
                                            value={backtestSymbol}
                                            onChange={(e) => setBacktestSymbol(e.target.value)}
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 订单类型信息 - 两列布局 */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">订单类型</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 订单类型 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            订单类型
                                        </Label>
                                        <Select value={backtestOrderType} onValueChange={setBacktestOrderType}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="选择订单类型" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="market">市价单</SelectItem>
                                                <SelectItem value="limit">限价单</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {/* 订单方向 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            订单方向
                                        </Label>
                                        <Select value={backtestOrderSide} onValueChange={setBacktestOrderSide}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="选择订单方向" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="long">做多</SelectItem>
                                                <SelectItem value="short">做空</SelectItem>
                                                <SelectItem value="close">平仓</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* 价格和数量信息 */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">订单参数</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 价格 */}
                                    {backtestOrderType === "limit" ? (
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm">
                                                价格
                                            </Label>
                                            <Input 
                                                type="number"
                                                value={backtestPrice}
                                                onChange={(e) => setBacktestPrice(Number(e.target.value))}
                                                min={0}
                                                step="0.001"
                                                className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2 text-sm text-gray-400">
                                                价格
                                            </Label>
                                            <Input 
                                                type="text"
                                                value="市价"
                                                disabled
                                                className="h-9 bg-gray-100 text-gray-500"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* 数量 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            数量
                                        </Label>
                                        <Input 
                                            type="number"
                                            value={backtestQuantity}
                                            onChange={(e) => setBacktestQuantity(Number(e.target.value))}
                                            min={0}
                                            step="0.00000001"
                                            className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 止盈止损信息 */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">风险管理 <span className="text-xs text-gray-400">(可选)</span></h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* 止盈 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            止盈价格
                                        </Label>
                                        <Input 
                                            type="number"
                                            value={backtestTp === null ? "" : backtestTp}
                                            onChange={(e) => setBacktestTp(e.target.value === "" ? null : Number(e.target.value))}
                                            min={0}
                                            step="0.0001"
                                            placeholder={backtestOrderSide === "long" ? "高于买入价" : "低于卖出价"}
                                            className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    
                                    {/* 止损 */}
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2 text-sm">
                                            止损价格
                                        </Label>
                                        <Input 
                                            type="number"
                                            value={backtestSl === null ? "" : backtestSl}
                                            onChange={(e) => setBacktestSl(e.target.value === "" ? null : Number(e.target.value))}
                                            min={0}
                                            step="0.00000001"
                                            placeholder={backtestOrderSide === "long" ? "低于买入价" : "高于卖出价"}
                                            className="h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 订单预览 */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">订单预览</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">交易模式:</span>
                                <span className="font-medium">
                                    {currentTradeMode === TradeMode.LIVE 
                                        ? "实盘交易" 
                                        : currentTradeMode === TradeMode.SIMULATE 
                                            ? "模拟交易" 
                                            : "历史回测"}
                                </span>
                            </div>
                            
                            {/* 回测数据来源显示 */}
                            {currentTradeMode === TradeMode.BACKTEST && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">数据来源:</span>
                                    <span className="font-medium">
                                        {backtestDataSource === BacktestDataSource.FILE ? "自定义文件" : "交易所"}
                                    </span>
                                </div>
                            )}
                            
                            {(currentTradeMode === TradeMode.LIVE && liveSelectedAccount) && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">交易所:</span>
                                    <span className="font-medium">
                                        {JSON.parse(liveSelectedAccount).exchange}
                                    </span>
                                </div>
                            )}
                            
                            {(currentTradeMode === TradeMode.SIMULATE && simulateSelectedAccount) && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">交易所:</span>
                                    <span className="font-medium">
                                        {JSON.parse(simulateSelectedAccount).exchange}
                                    </span>
                                </div>
                            )}
                            
                            {(currentTradeMode === TradeMode.BACKTEST && backtestDataSource === BacktestDataSource.EXCHANGE && backtestSelectedDataSource) && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">数据源:</span>
                                    <span className="font-medium">
                                        {JSON.parse(backtestSelectedDataSource).exchange}
                                    </span>
                                </div>
                            )}
                            
                            <div className="flex justify-between">
                                <span className="text-gray-500">交易对:</span>
                                <span className="font-medium">
                                    {currentTradeMode === TradeMode.LIVE 
                                        ? liveSymbol 
                                        : currentTradeMode === TradeMode.SIMULATE 
                                            ? simulateSymbol 
                                            : backtestSymbol}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">类型:</span>
                                <span className="font-medium">
                                    {(currentTradeMode === TradeMode.LIVE 
                                        ? liveOrderType 
                                        : currentTradeMode === TradeMode.SIMULATE 
                                            ? simulateOrderType 
                                            : backtestOrderType) === "market" ? "市价单" : "限价单"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">方向:</span>
                                <span className={`font-medium ${
                                    (currentTradeMode === TradeMode.LIVE 
                                        ? liveOrderSide 
                                        : currentTradeMode === TradeMode.SIMULATE 
                                            ? simulateOrderSide 
                                            : backtestOrderSide) === "long" ? "text-green-600" : "text-red-600"}`}>
                                    {(currentTradeMode === TradeMode.LIVE 
                                        ? liveOrderSide 
                                        : currentTradeMode === TradeMode.SIMULATE 
                                            ? simulateOrderSide 
                                            : backtestOrderSide) === "long" ? "做多" : "做空"}
                                </span>
                            </div>
                            {(currentTradeMode === TradeMode.LIVE && liveOrderType === "limit") || 
                             (currentTradeMode === TradeMode.SIMULATE && simulateOrderType === "limit") || 
                             (currentTradeMode === TradeMode.BACKTEST && backtestOrderType === "limit") ? (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">价格:</span>
                                    <span className="font-medium">
                                        {currentTradeMode === TradeMode.LIVE 
                                            ? livePrice 
                                            : currentTradeMode === TradeMode.SIMULATE 
                                                ? simulatePrice 
                                                : backtestPrice}
                                    </span>
                                </div>
                            ) : null}
                            <div className="flex justify-between">
                                <span className="text-gray-500">数量:</span>
                                <span className="font-medium">
                                    {currentTradeMode === TradeMode.LIVE 
                                        ? liveQuantity 
                                        : currentTradeMode === TradeMode.SIMULATE 
                                            ? simulateQuantity 
                                            : backtestQuantity}
                                </span>
                            </div>
                            {(currentTradeMode === TradeMode.LIVE && liveTp !== null) || 
                             (currentTradeMode === TradeMode.SIMULATE && simulateTp !== null) || 
                             (currentTradeMode === TradeMode.BACKTEST && backtestTp !== null) ? (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">止盈:</span>
                                    <span className="font-medium text-green-600">
                                        {currentTradeMode === TradeMode.LIVE 
                                            ? liveTp 
                                            : currentTradeMode === TradeMode.SIMULATE 
                                                ? simulateTp 
                                                : backtestTp}
                                    </span>
                                </div>
                            ) : null}
                            {(currentTradeMode === TradeMode.LIVE && liveSl !== null) || 
                             (currentTradeMode === TradeMode.SIMULATE && simulateSl !== null) || 
                             (currentTradeMode === TradeMode.BACKTEST && backtestSl !== null) ? (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">止损:</span>
                                    <span className="font-medium text-red-600">
                                        {currentTradeMode === TradeMode.LIVE 
                                            ? liveSl 
                                            : currentTradeMode === TradeMode.SIMULATE 
                                                ? simulateSl 
                                                : backtestSl}
                                    </span>
                                </div>
                            ) : null}
                            {(currentTradeMode === TradeMode.LIVE && liveSelectedAccount) || 
                             (currentTradeMode === TradeMode.SIMULATE && simulateSelectedAccount) ? (
                                <div className="flex justify-between col-span-2 mt-1 pt-1 border-t border-gray-200">
                                    <span className="text-gray-500">选择账户:</span>
                                    <span className="font-medium">
                                        {currentTradeMode === TradeMode.LIVE && liveSelectedAccount
                                            ? JSON.parse(liveSelectedAccount).accountName
                                            : currentTradeMode === TradeMode.SIMULATE && simulateSelectedAccount
                                                ? JSON.parse(simulateSelectedAccount).accountName
                                                : "未选择"}
                                    </span>
                                </div>
                            ) : null}
                            {(currentTradeMode === TradeMode.BACKTEST && backtestDataSource === BacktestDataSource.EXCHANGE && backtestSelectedDataSource) && (
                                <div className="flex justify-between col-span-2 mt-1 pt-1 border-t border-gray-200">
                                    <span className="text-gray-500">数据源:</span>
                                    <span className="font-medium">
                                        {JSON.parse(backtestSelectedDataSource).accountName}
                                    </span>
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
                        onClick={onSave}
                    >
                        保存
                    </Button>
                </div>
            </DrawerFooter>
        </DrawerContent>
    );
};

export default OrderNodePanel; 