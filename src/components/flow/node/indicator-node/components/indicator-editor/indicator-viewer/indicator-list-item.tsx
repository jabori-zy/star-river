import { HelpCircle } from "lucide-react";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { IndicatorCategory, IndicatorType } from "@/types/indicator";
import type { IndicatorInfo } from "./utils";

interface IndicatorListItemProps {
	indicator: IndicatorInfo;
	showCategoryBadge: boolean;
	getCategoryDisplayName: (category: IndicatorCategory) => string;
	onSelect: (type: IndicatorType) => void;
}

const IndicatorListItem: React.FC<IndicatorListItemProps> = ({
	indicator,
	showCategoryBadge,
	getCategoryDisplayName,
	onSelect,
}) => {
	return (
		<Button
			variant="ghost"
			className="w-full flex items-center justify-between p-2 h-auto rounded hover:bg-gray-100 cursor-pointer group text-left"
			onClick={() => onSelect(indicator.type)}
		>
			<div className="flex items-center gap-2 flex-1">
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium">{indicator.displayName}</span>
						{showCategoryBadge && (
							<Badge variant="secondary" className="text-xs text-gray-500">
								{getCategoryDisplayName(indicator.category)}
							</Badge>
						)}
					</div>
				</div>
			</div>
			{indicator.description && (
				<Tooltip>
					<TooltipTrigger asChild>
						<span className="h-6 w-6 p-0 flex items-center justify-center text-muted-foreground">
							<HelpCircle className="h-3 w-3" />
						</span>
					</TooltipTrigger>
					<TooltipContent>
						<p className="max-w-xs">{indicator.description}</p>
					</TooltipContent>
				</Tooltip>
			)}
		</Button>
	);
};

export default IndicatorListItem;
