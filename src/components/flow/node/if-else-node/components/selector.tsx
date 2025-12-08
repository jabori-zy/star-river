import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectorProps {
	value?: string;
	defaultValue?: string;
	className?: string;
	children?: React.ReactNode;
	onValueChange?: (value: string) => void;
	disabled?: boolean;
}

const Selector: React.FC<SelectorProps> = ({
	value,
	defaultValue,
	className,
	children,
	onValueChange,
	disabled,
}) => {
	return (
		<Select
			value={value}
			defaultValue={defaultValue}
			onValueChange={onValueChange}
			disabled={disabled}
		>
			<SelectTrigger
				className={cn(
					"w-24 h-8 text-xs font-normal hover:bg-gray-200",
					className,
				)}
			>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>{children}</SelectContent>
		</Select>
	);
};

export default Selector;
