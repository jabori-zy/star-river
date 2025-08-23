import type React from "react";
import { useState, useMemo } from "react";
import { Search, Star, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { IndicatorType, IndicatorCategory } from "@/types/indicator";
import { INDICATOR_CONFIG_MAP } from "@/types/indicator/indicator-config-map";

interface IndicatorViewerDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectIndicator: (indicatorType: IndicatorType) => void;
}

// 菜单项类型
type MenuType = "all" | "favorites";

// 指标信息接口
interface IndicatorInfo {
	type: IndicatorType;
	displayName: string;
	category: IndicatorCategory;
	description?: string;
}

// 特殊分类：全部
const ALL_CATEGORY = "ALL" as const;

// 分类显示名称映射
const CATEGORY_DISPLAY_NAMES: Record<IndicatorCategory | typeof ALL_CATEGORY, string> = {
	[ALL_CATEGORY]: "全部",
	[IndicatorCategory.OVERLAP]: "重叠研究",
	[IndicatorCategory.MOMENTUM]: "动量指标",
	[IndicatorCategory.VOLATILITY]: "波动率指标",
	[IndicatorCategory.VOLUME]: "成交量指标",
	[IndicatorCategory.PRICE_TRANSFORM]: "价格变换",
	[IndicatorCategory.CYCLE]: "周期指标",
	[IndicatorCategory.PATTERN_RECOGNITION]: "形态识别",
	[IndicatorCategory.CUSTOM]: "自定义",
};

const IndicatorViewerDialog: React.FC<IndicatorViewerDialogProps> = ({
	isOpen,
	onClose,
	onSelectIndicator,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedMenu, setSelectedMenu] = useState<MenuType>("all");
	const [selectedCategory, setSelectedCategory] = useState<IndicatorCategory | typeof ALL_CATEGORY>(ALL_CATEGORY);
	const [favorites, setFavorites] = useState<Set<IndicatorType>>(
		new Set([IndicatorType.STOCHRSI, IndicatorType.RSI]) // 默认收藏一些常用指标
	);

	// 获取所有指标信息
	const allIndicators = useMemo((): IndicatorInfo[] => {
		return Object.entries(INDICATOR_CONFIG_MAP)
			.filter(([_, config]) => config !== undefined)
			.map(([type, config]) => ({
				type: type as IndicatorType,
				displayName: config?.displayName || type,
				category: config?.category || IndicatorCategory.CUSTOM,
				description: config?.description,
			}));
	}, []);

	// 根据分类获取指标
	const getIndicatorsByCategory = useMemo(() => {
		const categoryMap = new Map<IndicatorCategory, IndicatorInfo[]>();
		
		allIndicators.forEach(indicator => {
			if (!categoryMap.has(indicator.category)) {
				categoryMap.set(indicator.category, []);
			}
			const categoryIndicators = categoryMap.get(indicator.category);
			if (categoryIndicators) {
				categoryIndicators.push(indicator);
			}
		});

		return categoryMap;
	}, [allIndicators]);

	// 获取可用的分类
	const availableCategories = useMemo(() => {
		const categories = Array.from(getIndicatorsByCategory.keys()).sort();
		// 将"全部"放在第一位
		return [ALL_CATEGORY, ...categories];
	}, [getIndicatorsByCategory]);

	// 过滤指标
	const filteredIndicators = useMemo(() => {
		let indicators: IndicatorInfo[] = [];

		if (selectedMenu === "all") {
			if (selectedCategory === ALL_CATEGORY) {
				// 全部分类：显示所有指标，按字母排序
				indicators = [...allIndicators].sort((a, b) =>
					a.displayName.localeCompare(b.displayName)
				);
			} else {
				// 特定分类
				indicators = getIndicatorsByCategory.get(selectedCategory as IndicatorCategory) || [];
			}
		} else if (selectedMenu === "favorites") {
			indicators = allIndicators.filter(indicator =>
				favorites.has(indicator.type)
			);
		}

		// 应用搜索过滤
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			indicators = indicators.filter(indicator =>
				indicator.displayName.toLowerCase().includes(query) ||
				indicator.description?.toLowerCase().includes(query)
			);
		}

		return indicators;
	}, [selectedMenu, selectedCategory, getIndicatorsByCategory, allIndicators, favorites, searchQuery]);

	// 切换收藏状态
	const toggleFavorite = (indicatorType: IndicatorType) => {
		setFavorites(prev => {
			const newFavorites = new Set(prev);
			if (newFavorites.has(indicatorType)) {
				newFavorites.delete(indicatorType);
			} else {
				newFavorites.add(indicatorType);
			}
			return newFavorites;
		});
	};

	// 处理指标选择
	const handleSelectIndicator = (indicatorType: IndicatorType) => {
		onSelectIndicator(indicatorType);
		onClose();
	};

	return (
		<TooltipProvider>
			<Dialog open={isOpen} onOpenChange={onClose} modal={false}>
				<DialogContent className="sm:max-w-[800px] h-[600px] p-0 flex flex-col" aria-describedby={undefined}>
					<DialogHeader className="px-6 pt-4">
						<DialogTitle>指标</DialogTitle>
					</DialogHeader>

				{/* 搜索栏 */}
				<div className="px-6 pb-1">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
						<Input
							placeholder="搜索"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>
				</div>

				<div className="flex flex-1 min-h-0">
					{/* 左侧菜单 */}
					<div className="w-46 border-r bg-muted/30 flex flex-col">
						<ScrollArea className="flex-1">
							<div className="p-4 space-y-2">
								<Button
									variant={selectedMenu === "all" ? "default" : "ghost"}
									className="w-full justify-start"
									onClick={() => setSelectedMenu("all")}
								>
									全部指标
								</Button>
								<Button
									variant={selectedMenu === "favorites" ? "default" : "ghost"}
									className="w-full justify-start"
									onClick={() => setSelectedMenu("favorites")}
								>
									<Star className="mr-2 h-4 w-4" />
									收藏
								</Button>
							</div>
						</ScrollArea>
					</div>

					{/* 右侧内容区域 */}
					<div className="flex-1 flex flex-col min-h-0">
						{/* 分类标签 */}
						{selectedMenu === "all" && (
							<div className="px-6 py-3 border-b flex-shrink-0">
								<div className="flex flex-wrap gap-2">
									{availableCategories.map(category => (
										<Badge
											key={category}
											variant={selectedCategory === category ? "default" : "outline"}
											className="cursor-pointer w-20 h-8 rounded-lg"
											onClick={() => setSelectedCategory(category)}
										>
											{CATEGORY_DISPLAY_NAMES[category]}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* 指标列表 */}
						<div className="flex-1 min-h-0">
							<ScrollArea className="h-full">
							<div className="p-6">
								{filteredIndicators.length === 0 ? (
									<div className="text-center text-muted-foreground py-8">
										{searchQuery ? "未找到匹配的指标" : "暂无指标"}
									</div>
								) : (
									<div className="space-y-1">
										{filteredIndicators.map(indicator => (
											<button
												key={indicator.type}
												type="button"
												className="w-full flex items-center justify-between p-2 rounded hover:bg-gray-100 cursor-pointer group text-left"
												onClick={() => handleSelectIndicator(indicator.type)}
											>
												<div className="flex items-center gap-2 flex-1">
													{/* 收藏Star - 收藏时显示黄色，未收藏时悬浮显示灰色 */}
													<Star
														className={`h-4 w-4 cursor-pointer transition-colors ${
															favorites.has(indicator.type)
																? 'fill-current text-yellow-500'
																: 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-yellow-500'
														}`}
														onClick={(e) => {
															e.stopPropagation();
															toggleFavorite(indicator.type);
														}}
													/>
													<div className="flex-1">
														<div className="flex items-center gap-2">
															<span className="text-sm font-medium">{indicator.displayName}</span>
															{selectedCategory === ALL_CATEGORY && (
																<Badge variant="secondary" className="text-xs text-gray-500">
																	{CATEGORY_DISPLAY_NAMES[indicator.category]}
																</Badge>
															)}
														</div>
													</div>
												</div>
												{indicator.description && (
													<Tooltip>
														<TooltipTrigger asChild>
															<Button
																variant="ghost"
																size="sm"
																className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
																onClick={(e) => e.stopPropagation()}
															>
																<HelpCircle className="h-3 w-3" />
															</Button>
														</TooltipTrigger>
														<TooltipContent>
															<p className="max-w-xs">{indicator.description}</p>
														</TooltipContent>
													</Tooltip>
												)}
											</button>
										))}
									</div>
								)}
							</div>
						</ScrollArea>
					</div>
				</div>
			</div>
		</DialogContent>
	</Dialog>
</TooltipProvider>
);
};

export default IndicatorViewerDialog;
