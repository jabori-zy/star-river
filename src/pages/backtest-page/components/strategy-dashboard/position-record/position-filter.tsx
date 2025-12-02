import { FunnelPlus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface PositionFilterProps {
	isShowHistoryPositions: boolean;
	onShowHistoryPositions: (show: boolean) => void;
}

const PositionFilter: React.FC<PositionFilterProps> = ({
	isShowHistoryPositions,
	onShowHistoryPositions,
}) => {
	const [open, setOpen] = useState(false);
	const { t } = useTranslation();
	const handleHistoryPositionsToggle = () => {
		onShowHistoryPositions(!isShowHistoryPositions);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm">
					<FunnelPlus size={12} />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-40" align="start">
				<div className="space-y-2">
					<div className="flex items-center space-x-2">
						<input
							type="checkbox"
							id="historyPositions"
							checked={isShowHistoryPositions}
							onChange={handleHistoryPositionsToggle}
							className="h-4 w-4"
						/>
						<label
							htmlFor="historyPositions"
							className="text-sm font-normal leading-none"
						>
							{t("desktop.backtestPage.showHistoryPositions")}
						</label>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default PositionFilter;
