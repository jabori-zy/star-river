import type { IndicatorCategory, IndicatorType } from "@/types/indicator";

// 特殊分类：全部
export const ALL_CATEGORY = "ALL" as const;

// 菜单项类型
export type MenuType = "all" | "favorites";

// 指标信息接口
export interface IndicatorInfo {
	type: IndicatorType;
	displayName: string;
	category: IndicatorCategory;
	description?: string;
}
