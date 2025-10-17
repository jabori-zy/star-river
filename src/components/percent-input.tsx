import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group";

interface PercentInputProps {
	id?: string;
	value: string | number;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
}

export const PercentInput = ({
	id,
	value,
	onChange,
	placeholder = "如: 5",
	className,
	disabled = false,
}: PercentInputProps) => {
	return (
		<InputGroup className={className}>
			<InputGroupInput
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				type="number"
				disabled={disabled}
			/>
			<InputGroupAddon align="inline-end">
				<InputGroupText>%</InputGroupText>
			</InputGroupAddon>
		</InputGroup>
	);
};
