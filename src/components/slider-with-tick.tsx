import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SliderWithTickProps {
	defaultValue?: number[];
	max?: number;
	min?: number;
	skipInterval?: number;
	label?: string;
	showTicks?: boolean;
	onValueChange?: (value: number[]) => void;
	step?: number;
	className?: string;
}

export default function SliderWithTick({
	defaultValue = [5],
	max = 12,
	min = 0,
	skipInterval = 2,
	label = "Slider with ticks",
	showTicks = true,
	onValueChange,
	step = 1,
	className,
}: SliderWithTickProps) {
	const ticks = [...Array(max - min + 1)].map((_, i) => min + i);

	return (
		<div className={cn("*:not-first:mt-4", className)}>
			{label && <Label>{label}</Label>}
			<div>
				<Slider
					defaultValue={defaultValue}
					max={max}
					min={min}
					step={step}
					onValueChange={onValueChange}
					aria-label={label}
				/>
				{showTicks && (
					<span
						className="text-muted-foreground mt-3 flex w-full items-center justify-between gap-1 px-2.5 text-xs font-medium"
						aria-hidden="true"
					>
						{ticks.map((value, i) => {
							const shouldShow =
								min === 1
									? value === 1 || value % 10 === 0
									: i % skipInterval === 0;

							return (
								<span
									key={i}
									className="flex w-0 flex-col items-center justify-center gap-2"
								>
									<span
										className={cn(
											"bg-muted-foreground/70 h-1 w-px",
											!shouldShow && "h-0.5",
										)}
									/>
									<span className={cn(!shouldShow && "opacity-0")}>
										{value}
									</span>
								</span>
							);
						})}
					</span>
				)}
			</div>
		</div>
	);
}
