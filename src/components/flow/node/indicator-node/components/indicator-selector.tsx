import { useState, useEffect } from "react";
import { IndicatorConfig, IndicatorType, PriceSource } from "@/types/indicator";
import { SmaConfig, EmaConfig, BollConfig } from "@/types/indicator/indicatorConfig";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusIcon, X, Settings, TrendingUp, BarChart3 } from "lucide-react";

interface SelectedIndicator {
    id: string;
    type: IndicatorType;
    config: IndicatorConfig;
    name: string;
}

interface IndicatorSelectorProps {
    selectedIndicators: SelectedIndicator[];
    onIndicatorsChange: (indicators: SelectedIndicator[]) => void;
}

// 指标类型选项
const INDICATOR_OPTIONS = [
    { value: IndicatorType.SMA, label: 'SMA (简单移动平均)', icon: TrendingUp },
    { value: IndicatorType.EMA, label: 'EMA (指数移动平均)', icon: TrendingUp },
    { value: IndicatorType.BOLL, label: 'BOLL (布林带)', icon: BarChart3 },
];

// 价格源选项
const PRICE_SOURCE_OPTIONS = [
    { value: PriceSource.CLOSE, label: '收盘价' },
    { value: PriceSource.OPEN, label: '开盘价' },
    { value: PriceSource.HIGH, label: '最高价' },
    { value: PriceSource.LOW, label: '最低价' },
];

const IndicatorSelector: React.FC<IndicatorSelectorProps> = ({ 
    selectedIndicators, 
    onIndicatorsChange 
}) => {
    // 本地状态管理
    const [localIndicators, setLocalIndicators] = useState<SelectedIndicator[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingIndicator, setEditingIndicator] = useState<SelectedIndicator | undefined>(undefined);
    const [indicatorType, setIndicatorType] = useState<IndicatorType>(IndicatorType.SMA);
    const [indicatorName, setIndicatorName] = useState<string>("");
    const [period, setPeriod] = useState<number>(20);
    const [stdDev, setStdDev] = useState<number>(2);
    const [priceSource, setPriceSource] = useState<PriceSource>(PriceSource.CLOSE);

    // 初始化时从props同步到本地状态
    useEffect(() => {
        if (selectedIndicators && selectedIndicators.length > 0) {
            setLocalIndicators([...selectedIndicators]);
        } else {
            setLocalIndicators([]);
        }
    }, [selectedIndicators]);

    // 每次对话框打开时重置状态
    useEffect(() => {
        if (isDialogOpen) {
            if (editingIndicator) {
                setIndicatorType(editingIndicator.type);
                setIndicatorName(editingIndicator.name);
                setPriceSource(editingIndicator.config.priceSource);
                
                if (editingIndicator.type === IndicatorType.SMA || editingIndicator.type === IndicatorType.EMA) {
                    setPeriod((editingIndicator.config as SmaConfig | EmaConfig).period);
                } else if (editingIndicator.type === IndicatorType.BOLL) {
                    const bollConfig = editingIndicator.config as BollConfig;
                    setPeriod(bollConfig.period);
                    setStdDev(bollConfig.stdDev);
                }
            } else {
                resetForm();
            }
        }
    }, [isDialogOpen, editingIndicator]);

    const resetForm = () => {
        setIndicatorType(IndicatorType.SMA);
        setIndicatorName("");
        setPeriod(20);
        setStdDev(2);
        setPriceSource(PriceSource.CLOSE);
    };

    // 同步数据到父组件
    const syncToParent = (newIndicators: SelectedIndicator[]) => {
        setLocalIndicators(newIndicators);
        onIndicatorsChange(newIndicators);
    };

    // 根据指标类型创建配置
    const createIndicatorConfig = (type: IndicatorType): IndicatorConfig => {
        switch (type) {
            case IndicatorType.SMA:
                return { period, priceSource } as SmaConfig;
            case IndicatorType.EMA:
                return { period, priceSource } as EmaConfig;
            case IndicatorType.BOLL:
                return { period, stdDev, priceSource } as BollConfig;
            default:
                return { period, priceSource } as SmaConfig;
        }
    };

    const handleAddIndicator = () => {
        setEditingIndicator(undefined);
        setIsDialogOpen(true);
    };

    const handleEditIndicator = (indicator: SelectedIndicator) => {
        setEditingIndicator(indicator);
        setIsDialogOpen(true);
    };

    const handleDeleteIndicator = (indicatorToDelete: SelectedIndicator) => {
        const newIndicators = localIndicators.filter(indicator => 
            indicator.id !== indicatorToDelete.id
        );
        syncToParent(newIndicators);
    };

    const handleSave = () => {
        const trimmedName = indicatorName.trim();

        if (period <= 0) {
            return;
        }

        if (indicatorType === IndicatorType.BOLL && stdDev <= 0) {
            return;
        }

        const config = createIndicatorConfig(indicatorType);
        
        const newIndicator: SelectedIndicator = {
            id: editingIndicator?.id || `${indicatorType}_${Date.now()}`,
            type: indicatorType,
            config,
            name: trimmedName
        };

        let newIndicators: SelectedIndicator[];
        
        if (editingIndicator) {
            // 编辑现有指标
            newIndicators = localIndicators.map(indicator => 
                indicator.id === editingIndicator.id ? newIndicator : indicator
            );
        } else {
            // 添加新指标
            newIndicators = [...localIndicators, newIndicator];
        }
        
        syncToParent(newIndicators);
        setIsDialogOpen(false);
        setEditingIndicator(undefined);
    };

    const getIndicatorLabel = (type: IndicatorType) => {
        return INDICATOR_OPTIONS.find(option => option.value === type)?.label || type;
    };

    const getConfigDisplay = (indicator: SelectedIndicator) => {
        const config = indicator.config;
        switch (indicator.type) {
            case IndicatorType.SMA:
            case IndicatorType.EMA:
                return `周期: ${(config as SmaConfig | EmaConfig).period}`;
                         case IndicatorType.BOLL: {
                 const bollConfig = config as BollConfig;
                 return `周期: ${bollConfig.period}, 标准差: ${bollConfig.stdDev}`;
             }
            default:
                return '';
        }
    };

    // 渲染配置表单
    const renderConfigForm = () => {
        return (
            <>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="indicator-period" className="text-right">
                        周期
                    </Label>
                    <div className="col-span-3">
                        <Input
                            id="indicator-period"
                            type="number"
                            value={period}
                            onChange={(e) => setPeriod(Number(e.target.value))}
                            min={1}
                            placeholder="输入周期"
                        />
                    </div>
                </div>
                
                {indicatorType === IndicatorType.BOLL && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="indicator-stddev" className="text-right">
                            标准差
                        </Label>
                        <div className="col-span-3">
                            <Input
                                id="indicator-stddev"
                                type="number"
                                value={stdDev}
                                onChange={(e) => setStdDev(Number(e.target.value))}
                                min={0.1}
                                step={0.1}
                                placeholder="输入标准差"
                            />
                        </div>
                    </div>
                )}
                
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price-source" className="text-right">
                        价格源
                    </Label>
                    <div className="col-span-3">
                        <Select 
                            value={priceSource} 
                            onValueChange={(value: PriceSource) => setPriceSource(value)}
                        >
                            <SelectTrigger id="price-source">
                                <SelectValue placeholder="选择价格源" />
                            </SelectTrigger>
                            <SelectContent>
                                {PRICE_SOURCE_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">
                    技术指标
                </label>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleAddIndicator}
                >
                    <PlusIcon className="w-4 h-4" />
                </Button>
            </div>
            
            <div className="space-y-2">
                {localIndicators.length === 0 ? (
                    <div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
                        点击+号添加技术指标
                    </div>
                ) : (
                    localIndicators.map((indicator) => (
                        <div key={indicator.id} className="flex items-center justify-between p-2 border rounded-md bg-background group">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="h-5 px-1">
                                    <BarChart3 className="h-3 w-3 mr-1 text-green-500" />
                                    {indicator.name}
                                </Badge>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">
                                        {getIndicatorLabel(indicator.type)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">
                                        {getConfigDisplay(indicator)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6"
                                        onClick={() => handleEditIndicator(indicator)}
                                    >
                                        <Settings className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-destructive"
                                        onClick={() => handleDeleteIndicator(indicator)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 添加/编辑指标对话框 */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingIndicator ? '编辑技术指标' : '添加技术指标'}</DialogTitle>
                        <DialogDescription>
                            配置技术指标的参数和计算方式。
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="indicator-type" className="text-right">
                                指标类型
                            </Label>
                            <div className="col-span-3">
                                <Select 
                                    value={indicatorType} 
                                    onValueChange={(value: IndicatorType) => setIndicatorType(value)}
                                    disabled={!!editingIndicator}
                                >
                                    <SelectTrigger id="indicator-type">
                                        <SelectValue placeholder="选择指标类型" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDICATOR_OPTIONS.map((option) => {
                                            const IconComponent = option.icon;
                                            return (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex items-center">
                                                        <IconComponent className="h-4 w-4 mr-2 text-blue-500" />
                                                        <span>{option.label}</span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        {renderConfigForm()}
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsDialogOpen(false)}
                        >
                            取消
                        </Button>
                        <Button onClick={handleSave}>保存</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default IndicatorSelector;
