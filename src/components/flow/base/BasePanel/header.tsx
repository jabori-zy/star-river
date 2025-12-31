import { X } from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BasePanelHeaderProps {
	id: string;
	title: string;
	setTitle: (title: string) => void; // Modify title
	icon: IconName;
	iconBackgroundColor: string;
	isEditingTitle: boolean;
	setIsEditingTitle: (isEditingTitle: boolean) => void;
	onClosePanel: () => void;
}

const BasePanelHeader: React.FC<BasePanelHeaderProps> = ({
	id,
	title,
	icon,
	iconBackgroundColor,
	setTitle,
	isEditingTitle,
	setIsEditingTitle,
	onClosePanel,
}) => {
	return (
		// flex - flexbox layout
		// justify-between - space between elements
		// items-center - vertical center alignment
		// p-2 - padding
		<div className="flex justify-between items-center">
			{/* Title area */}
			{/*
                flex-1 - occupy remaining space
                flex - flexbox layout
                items-center - vertical center alignment
                border-b - bottom border
                border-gray-100 - border color
                pb-2 - bottom padding
                mr-2 - right margin, maintain distance from button
                bg-red-100 - background color
            */}
			<div className="flex-1 flex items-center border-gray-100 mr-2 ">
				{/* Icon */}
				{icon && (
					// p-1 - padding
					// rounded-sm - rounded corners
					// shrink-0 - effect is, if content overflows, don't shrink
					// bg-red-400 - background color
					// mr-2 - right margin
					<div
						className="p-1 mr-2 rounded-sm shrink-0"
						style={{ backgroundColor: iconBackgroundColor }}
					>
						<DynamicIcon
							name={icon}
							className="w-4 h-4 text-white shrink-0"
						/>
					</div>
				)}
				{/* Title */}
				{isEditingTitle ? (
					<Input
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="h-8 text-sm flex-1"
						placeholder="Enter strategy name"
						autoFocus
						onBlur={() => {
							// If title is empty, set default value
							if (!title.trim()) {
								setTitle(`${id}`);
							}
							setIsEditingTitle(false);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								// If title is empty, set default value
								if (!title.trim()) {
									setTitle(`${id}`);
								}
								setIsEditingTitle(false);
							} else if (e.key === "Escape") {
								setIsEditingTitle(false);
							}
						}}
					/>
				) : (
					// leading-8 - line height
					// py-1 - vertical padding
					<h3
						className="text-md font-bold text-gray-800 leading-8 py-1"
						onDoubleClick={() => setIsEditingTitle(true)}
					>
						{title || `${id}`}
					</h3>
				)}
			</div>

			{/*
                shrink-0 - prevent button from being compressed
                hover:bg-gray-100 - background color on hover
            */}
			<Button
				variant="ghost"
				size="icon"
				className="shrink-0 hover:bg-gray-100"
				onClick={onClosePanel}
			>
				<X className="h-4 w-4" />
			</Button>
		</div>
	);
};

export default memo(BasePanelHeader);
