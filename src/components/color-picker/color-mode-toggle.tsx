import { ChevronDown, Hash, Palette } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ColorMode, ColorModeToggleProps } from "./types";

const colorModes: Array<{
	value: ColorMode;
	label: string;
	icon: React.ReactNode;
}> = [
	{
		value: "hex",
		label: "HEX",
		icon: <Hash className="w-4 h-4" />,
	},
	{
		value: "rgb",
		label: "RGB",
		icon: <Palette className="w-4 h-4" />,
	},
];

export function ColorModeToggle({ mode, onModeChange }: ColorModeToggleProps) {
	const currentMode = colorModes.find((m) => m.value === mode);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="h-8 px-3 gap-2 text-xs font-medium"
				>
					{currentMode?.icon}
					{currentMode?.label}
					<ChevronDown className="w-3 h-3" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-12">
				{colorModes.map((colorMode) => (
					<DropdownMenuItem
						key={colorMode.value}
						onClick={() => onModeChange(colorMode.value)}
						className={cn(
							"flex items-center gap-2 p-2 cursor-pointer",
							mode === colorMode.value && "bg-accent",
						)}
					>
						{colorMode.icon}
						<span className="font-medium text-sm">{colorMode.label}</span>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
