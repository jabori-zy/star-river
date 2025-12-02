import type React from "react";
import { Badge } from "@/components/ui/badge";
import type { IndicatorCategory } from "@/types/indicator";
import type { ALL_CATEGORY } from "./utils";

interface CategoryTabsProps {
	categories: (IndicatorCategory | typeof ALL_CATEGORY)[];
	selectedCategory: IndicatorCategory | typeof ALL_CATEGORY;
	onSelectCategory: (category: IndicatorCategory | typeof ALL_CATEGORY) => void;
	getCategoryDisplayName: (
		category: IndicatorCategory | typeof ALL_CATEGORY,
	) => string;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
	categories,
	selectedCategory,
	onSelectCategory,
	getCategoryDisplayName,
}) => {
	return (
		<div className="px-6 py-3 border-b flex-shrink-0">
			<div className="flex flex-wrap gap-2">
				{categories.map((category) => (
					<Badge
						key={category}
						variant={selectedCategory === category ? "default" : "outline"}
						className="cursor-pointer min-w-20 h-8 rounded-lg"
						onClick={() => onSelectCategory(category)}
					>
						{getCategoryDisplayName(category)}
					</Badge>
				))}
			</div>
		</div>
	);
};

export default CategoryTabs;
