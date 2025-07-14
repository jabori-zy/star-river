import { useState, useEffect } from "react";
import { IndicatorConfig, IndicatorType, PriceSource, IndicatorValue } from "@/types/indicator";
import { SelectedIndicator } from "@/types/node/indicator-node";
import { SmaConfig, EmaConfig, BollConfig } from "@/types/indicator/indicatorConfig";
import { SMAValue, EMAValue, BOLLValue } from "@/types/indicator/indicator-value";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusIcon, X, Settings, TrendingUp, BarChart3 } from "lucide-react";

interface IndicatorSelectorProps {
    id: string; // 节点ID，用于生成handleId
    selectedIndicators: SelectedIndicator[];
    onSelectedIndicatorsChange: (indicators: SelectedIndicator[]) => void;
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
    id,
    selectedIndicators,
    onSelectedIndicatorsChange 
}) => {
    // 确保 selectedIndicators 是数组类型
    // const indicators = Array.isArray(selectedIndicators) ? selectedIndicators : [];
    
    // 本地状态管理
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [indicatorType, setIndicatorType] = useState<IndicatorType>(IndicatorType.SMA);
    const [period, setPeriod] = useState<number>(20);
    const [stdDev, setStdDev] = useState<number>(2);
    const [priceSource, setPriceSource] = useState<PriceSource>(PriceSource.CLOSE);

    // 检查指标配置是否已存在（类型+周期+数据源相同）
    const isIndicatorConfigExists = (type: IndicatorType, period: number, priceSource: PriceSource, excludeIndex?: number) => {
        return selectedIndicators.some((indicator, index) => {
            if (excludeIndex !== undefined && index === excludeIndex) {
                return false; // 排除正在编辑的项
            }
            
            if (indicator.indicatorConfig.type !== type || indicator.indicatorConfig.priceSource !== priceSource) {
                return false;
            }
            
            // 检查周期
            if (type === IndicatorType.SMA || type === IndicatorType.EMA) {
                return (indicator.indicatorConfig as SmaConfig | EmaConfig).period === period;
            } else if (type === IndicatorType.BOLL) {
                return (indicator.indicatorConfig as BollConfig).period === period;
            }
            
            return false;
        });
    };

    // 每次对话框打开时重置状态
    useEffect(() => {
        if (isDialogOpen) {
            if (isEditing && editingIndex !== null) {
                const config = selectedIndicators[editingIndex].indicatorConfig;
                setIndicatorType(config.type);
                setPriceSource(config.priceSource);
                
                if (config.type === IndicatorType.SMA || config.type === IndicatorType.EMA) {
                    setPeriod((config as SmaConfig | EmaConfig).period);
                } else if (config.type === IndicatorType.BOLL) {
                    const bollConfig = config as BollConfig;
                    setPeriod(bollConfig.period);
                    setStdDev(bollConfig.stdDev);
                }
            } else {
                resetForm();
            }
        }
    }, [isDialogOpen, isEditing, editingIndex, selectedIndicators]);

    const resetForm = () => {
        setIndicatorType(IndicatorType.SMA);
        setPeriod(20);
        setStdDev(2);
        setPriceSource(PriceSource.CLOSE);
    };

    // 根据指标类型创建初始值
    const createInitialValue = (type: IndicatorType): IndicatorValue => {
        switch (type) {
            case IndicatorType.SMA:
                return { sma: 0 } as SMAValue;
            case IndicatorType.EMA:
                return { ema: 0 } as EMAValue;
            case IndicatorType.BOLL:
                return { upper: 0, middle: 0, lower: 0 } as BOLLValue;
            default:
                return { sma: 0 } as SMAValue;
        }
    };

    // 根据指标类型创建配置
    const createIndicatorConfig = (type: IndicatorType, index: number): SelectedIndicator => {
        const baseConfig: IndicatorConfig = (() => {
            switch (type) {
                case IndicatorType.SMA:
                    return { type, period, priceSource } as SmaConfig;
                case IndicatorType.EMA:
                    return { type, period, priceSource } as EmaConfig;
                case IndicatorType.BOLL:
                    return { type, period, stdDev, priceSource } as BollConfig;
                default:
                    return { type, period, priceSource } as SmaConfig;
            }
        })();

        return {
            indicatorId: index + 1,
            outputHandleId: `${id}_output${index + 1}`,
            indicatorConfig: baseConfig,
            value: createInitialValue(type)
        };
    };

    const handleAddIndicator = () => {
        setIsEditing(false);
        setEditingIndex(null);
        setIsDialogOpen(true);
    };

    const handleEditIndicator = (index: number) => {
        setIsEditing(true);
        setEditingIndex(index);
        setIsDialogOpen(true);
    };

    const handleDeleteIndicator = (index: number) => {
        const updatedIndicators = selectedIndicators.filter((_, i) => i !== index);
        onSelectedIndicatorsChange(updatedIndicators);
    };

    const handleSave = () => {
        if (period <= 0) {
            return;
        }

        if (indicatorType === IndicatorType.BOLL && stdDev <= 0) {
            return;
        }

        // 检查是否重复（排除正在编辑的项）
        if (isIndicatorConfigExists(indicatorType, period, priceSource, editingIndex || undefined)) {
            return;
        }

        if (isEditing && editingIndex !== null) {
            // 编辑现有指标 - 保持原有的 handleId
            const config = createIndicatorConfig(indicatorType, editingIndex);
            // 保持原有的 handleId
            config.outputHandleId = selectedIndicators[editingIndex].outputHandleId;
            const updatedIndicators = [...selectedIndicators];
            updatedIndicators[editingIndex] = config;
            onSelectedIndicatorsChange(updatedIndicators);
        } else {
            // 添加新指标 - 生成新的 handleId
            const newIndex = selectedIndicators.length;
            const config = createIndicatorConfig(indicatorType, newIndex);
            onSelectedIndicatorsChange([...selectedIndicators, config]);
        }
        
        setIsDialogOpen(false);
    };

    const getIndicatorLabel = (type: IndicatorType) => {
        return INDICATOR_OPTIONS.find(option => option.value === type)?.label || type;
    };

    const getConfigDisplay = (config: IndicatorConfig) => {
        switch (config.type) {
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
                {selectedIndicators.length === 0 ? (
                    <div className="flex items-center justify-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
                        点击+号添加技术指标
                    </div>
                ) : (
                    selectedIndicators.map((config, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-background group">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="h-5 px-1">
                                    {config.indicatorConfig.type}
                                </Badge>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">
                                        {getIndicatorLabel(config.indicatorConfig.type)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground">
                                        {getConfigDisplay(config.indicatorConfig)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6"
                                        onClick={() => handleEditIndicator(index)}
                                    >
                                        <Settings className="h-3 w-3" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 text-destructive"
                                        onClick={() => handleDeleteIndicator(index)}
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
                        <DialogTitle>{isEditing ? '编辑技术指标' : '添加技术指标'}</DialogTitle>
                        <DialogDescription>
                            配置技术指标的参数和计算方式。同一指标类型可以配置不同的周期和数据源。
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
                                    disabled={isEditing}
                                >
                                    <SelectTrigger id="indicator-type">
                                        <SelectValue placeholder="选择指标类型" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDICATOR_OPTIONS.map((option) => {
                                            const IconComponent = option.icon;
                                            return (
                                                <SelectItem 
                                                    key={option.value} 
                                                    value={option.value}
                                                >
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
                        <Button 
                            onClick={handleSave}
                            disabled={isIndicatorConfigExists(indicatorType, period, priceSource, editingIndex || undefined)}
                        >
                            {isIndicatorConfigExists(indicatorType, period, priceSource, editingIndex || undefined) ? '配置已存在' : '保存'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default IndicatorSelector;
