import { Search } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
	getIndicatorCategoryDisplayName,
	IndicatorCategory,
	IndicatorType,
} from "@/types/indicator";
import { INDICATOR_CONFIG_MAP } from "@/types/indicator/indicator-config-map";
import CategoryTabs from "./category-tabs";
import IndicatorListItem from "./indicator-list-item";
import { ALL_CATEGORY, type IndicatorInfo, type MenuType } from "./utils";

interface IndicatorViewerDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectIndicator: (indicatorType: IndicatorType) => void;
}

const IndicatorViewerDialog: React.FC<IndicatorViewerDialogProps> = ({
	isOpen,
	onClose,
	onSelectIndicator,
}) => {
	const { t } = useTranslation();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedMenu, setSelectedMenu] = useState<MenuType>("all");
	const [selectedCategory, setSelectedCategory] = useState<
		IndicatorCategory | typeof ALL_CATEGORY
	>(ALL_CATEGORY);
	const [favorites, setFavorites] = useState<Set<IndicatorType>>(
		new Set([IndicatorType.STOCHRSI, IndicatorType.RSI]),
	);

	// Get category display name
	const getCategoryDisplayName = (
		category: IndicatorCategory | typeof ALL_CATEGORY,
	) => {
		if (category === ALL_CATEGORY) {
			return t("indicator.category.all");
		}
		return getIndicatorCategoryDisplayName(category, t);
	};

	// Get all indicator information
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

	// Get indicators by category
	const getIndicatorsByCategory = useMemo(() => {
		const categoryMap = new Map<IndicatorCategory, IndicatorInfo[]>();

		allIndicators.forEach((indicator) => {
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

	// Get available categories
	const availableCategories = useMemo(() => {
		const categories = Array.from(getIndicatorsByCategory.keys()).sort();
		return [ALL_CATEGORY, ...categories];
	}, [getIndicatorsByCategory]);

	// Filter indicators
	const filteredIndicators = useMemo(() => {
		let indicators: IndicatorInfo[] = [];

		if (selectedMenu === "all") {
			if (selectedCategory === ALL_CATEGORY) {
				indicators = [...allIndicators].sort((a, b) =>
					a.displayName.localeCompare(b.displayName),
				);
			} else {
				indicators =
					getIndicatorsByCategory.get(selectedCategory as IndicatorCategory) ||
					[];
			}
		} else if (selectedMenu === "favorites") {
			indicators = allIndicators.filter((indicator) =>
				favorites.has(indicator.type),
			);
		}

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			indicators = indicators.filter(
				(indicator) =>
					indicator.displayName.toLowerCase().includes(query) ||
					indicator.description?.toLowerCase().includes(query),
			);
		}

		return indicators;
	}, [
		selectedMenu,
		selectedCategory,
		getIndicatorsByCategory,
		allIndicators,
		favorites,
		searchQuery,
	]);

	// Handle indicator selection
	const handleSelectIndicator = (indicatorType: IndicatorType) => {
		onSelectIndicator(indicatorType);
		onClose();
	};

	return (
		<TooltipProvider>
			<Dialog open={isOpen} onOpenChange={onClose} modal={false}>
				<DialogContent
					className="sm:max-w-[800px] h-[600px] p-0 flex flex-col"
					aria-describedby={undefined}
				>
					<DialogHeader className="px-6 pt-4">
						<DialogTitle>{t("indicatorNode.indicator")}</DialogTitle>
					</DialogHeader>

					{/* Search bar */}
					<div className="px-6 pb-1">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
							<Input
								placeholder={t(
									"indicatorNode.indicatorViewer.searchPlaceholder",
								)}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>

					<div className="flex flex-1 min-h-0">
						{/* Left sidebar menu */}
						<div className="w-46 border-r bg-muted/30 flex flex-col">
							<ScrollArea className="flex-1">
								<div className="p-4 space-y-2">
									<Button
										variant={selectedMenu === "all" ? "default" : "ghost"}
										className="w-full justify-start"
										onClick={() => setSelectedMenu("all")}
									>
										{t("indicatorNode.indicatorViewer.allIndicators")}
									</Button>
								</div>
							</ScrollArea>
						</div>

						{/* Right content area */}
						<div className="flex-1 flex flex-col min-h-0">
							{/* Category tabs */}
							{selectedMenu === "all" && (
								<CategoryTabs
									categories={availableCategories}
									selectedCategory={selectedCategory}
									onSelectCategory={setSelectedCategory}
									getCategoryDisplayName={getCategoryDisplayName}
								/>
							)}

							{/* Indicator list */}
							<div className="flex-1 min-h-0">
								<ScrollArea className="h-full">
									<div className="p-6">
										{filteredIndicators.length === 0 ? (
											<div className="text-center text-muted-foreground py-8">
												{searchQuery ? "未找到匹配的指标" : "暂无指标"}
											</div>
										) : (
											<div className="space-y-1">
												{filteredIndicators.map((indicator) => (
													<IndicatorListItem
														key={indicator.type}
														indicator={indicator}
														showCategoryBadge={
															selectedCategory === ALL_CATEGORY
														}
														getCategoryDisplayName={getCategoryDisplayName}
														onSelect={handleSelectIndicator}
													/>
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
