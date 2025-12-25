import { Blend, Construction, MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export default function HeaderDropdownMenu() {
	const { t } = useTranslation();

	return (
		<DropdownMenu>
			<Tooltip>
				<TooltipTrigger asChild>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="text-slate-500 h-9 w-9 p-0"
						>
							<MoreVertical className="w-4 h-4" />
						</Button>
					</DropdownMenuTrigger>
				</TooltipTrigger>
				<TooltipContent>
					{t("desktop.strategyWorkflowPage.settings")}
				</TooltipContent>
			</Tooltip>
			<DropdownMenuContent align="end">
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<Blend className="w-4 h-4" />
						{t("desktop.strategyWorkflowPage.tradeMode")}
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem disabled={true}>
							<div className="flex items-center justify-center gap-4 ">
								{t("desktop.strategyWorkflowPage.live")}
								<Construction className="w-4 h-4 text-yellow-500" />
							</div>
						</DropdownMenuItem>
						<DropdownMenuItem>
							<div className="flex items-center justify-center gap-4">
								{t("desktop.strategyWorkflowPage.backtest")}
							</div>
						</DropdownMenuItem>
						<DropdownMenuItem disabled={true}>
							<div className="flex items-center justify-center gap-4">
								{t("desktop.strategyWorkflowPage.simulate")}
								<Construction className="w-4 h-4 text-yellow-500" />
							</div>
						</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
