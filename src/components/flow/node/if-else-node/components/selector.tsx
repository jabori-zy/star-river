import {
	Select,
	SelectContent,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectorProps {
	defaultValue?: string;
	className?: string;
	children?: React.ReactNode;
	onValueChange?: (value: string) => void;
}

const Selector: React.FC<SelectorProps> = ({
	defaultValue,
	className,
	children,
	onValueChange,
}) => {
	return (
		<Select defaultValue={defaultValue} onValueChange={onValueChange}>
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
