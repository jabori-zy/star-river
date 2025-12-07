import type { IndicatorCategory, IndicatorType } from "@/types/indicator";

// Special category: All
export const ALL_CATEGORY = "ALL" as const;

// Menu item type
export type MenuType = "all" | "favorites";

// Indicator information interface
export interface IndicatorInfo {
	type: IndicatorType;
	displayName: string;
	category: IndicatorCategory;
	description?: string;
}
