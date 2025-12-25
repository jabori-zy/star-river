import { CircleArrowOutUpRight, MoreVertical, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import ConfirmBox from "@/components/confirm-box";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteStrategy } from "@/service/strategy-management/delete-strategy";
import { exportStrategy } from "@/utils/export-strategy";

interface StrategyItemDropdownMenuProps {
	strategyId: number;
	strategyName: string;
	onDelete: () => void;
}

export function StrategyItemDropdownMenu({
	strategyId,
	strategyName,
	onDelete,
}: StrategyItemDropdownMenuProps) {
	const { t } = useTranslation();

	const { mutate: deleteStrategy } = useDeleteStrategy({
		meta: {
			successMessage: t("apiMessage.deleteStrategySuccess"),
			showSuccessToast: true,
			errorMessage: t("apiMessage.deleteStrategyError"),
			showErrorToast: true,
		},
		onSuccess: () => {
			onDelete();
		},
	});

	const handleDelete = () => {
		deleteStrategy({ strategyId });
	};

	const handleExport = () => {
		exportStrategy(strategyId, strategyName);
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0 hover:bg-accent"
				>
					<MoreVertical className="h-4 w-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={handleExport}>
					<CircleArrowOutUpRight className="h-4 w-4 mr-1" />
					{t("desktop.strategyListPage.exportStrategy")}
				</DropdownMenuItem>
				<ConfirmBox
					title={t("desktop.strategyListPage.confirmDeleteStrategy")}
					description={t("desktop.strategyListPage.confirmDeleteStrategyMessage", {
						strategyName: `"${strategyName}"`,
					})}
					confirmText={t("common.confirm")}
					cancelText={t("common.cancel")}
					onConfirm={handleDelete}
				>
					<DropdownMenuItem
						className="text-red-500 focus:text-red-500 focus:bg-red-50"
						onSelect={(e) => e.preventDefault()}
					>
						<Trash2 className="h-4 w-4 mr-1" />
						{t("desktop.strategyListPage.deleteStrategy")}
					</DropdownMenuItem>
				</ConfirmBox>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
