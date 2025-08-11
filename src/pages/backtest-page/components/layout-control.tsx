import { Columns3, Grid2x2, LayoutGrid, Rows3 } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { LayoutMode } from "@/types/chart";

interface LayoutControlProps {
	value: LayoutMode;
	onChange: (layout: LayoutMode) => void;
	disabled?: boolean;
}

const layoutOptions = [
	{
		value: "vertical" as LayoutMode,
		label: "纵向布局",
		icon: Columns3,
		description: "图表垂直排列",
	},
	{
		value: "horizontal" as LayoutMode,
		label: "横向布局",
		icon: Rows3,
		description: "图表水平排列",
	},
	{
		value: "grid" as LayoutMode,
		label: "网格布局",
		icon: Grid2x2,
		description: "偶数列，奇数行",
	},
	{
		value: "grid-alt" as LayoutMode,
		label: "网格布局2",
		icon: LayoutGrid,
		description: "奇数列，偶数行",
	},
];

export default function LayoutControl({
	value,
	onChange,
	disabled = false,
}: LayoutControlProps) {
	const currentOption = layoutOptions.find((option) => option.value === value);

	return (
		<div className="flex items-center gap-2">
			<span className="text-sm font-medium whitespace-nowrap">布局:</span>
			<Select value={value} onValueChange={onChange} disabled={disabled}>
				<SelectTrigger className="w-[160px]">
					<SelectValue>
						<div className="flex items-center gap-2">
							{currentOption && (
								<>
									<currentOption.icon className="h-4 w-4" />
									<span>{currentOption.label}</span>
								</>
							)}
						</div>
					</SelectValue>
				</SelectTrigger>
				<SelectContent>
					{layoutOptions.map((option) => (
						<SelectItem
							key={option.value}
							value={option.value}
							className="cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<option.icon className="h-4 w-4" />
								<div className="flex flex-col">
									<span>{option.label}</span>
									<span className="text-xs text-muted-foreground">
										{option.description}
									</span>
								</div>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	);
}
