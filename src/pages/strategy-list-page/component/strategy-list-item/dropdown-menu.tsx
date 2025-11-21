import { MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteStrategy } from "@/service/strategy-management/delete-strategy";
import { useTranslation } from "react-i18next";
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
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const { t } = useTranslation();

	const { mutate: deleteStrategy, isPending: isDeleting } = useDeleteStrategy({
		meta: {
			successMessage: t("apiMessage.deleteStrategySuccess"),
			showSuccessToast: true,
			errorMessage: t("apiMessage.deleteStrategyError"),
			showErrorToast: true,
		},
		onSuccess: () => {
			onDelete();
			setShowDeleteDialog(false);
		},
		onError: () => {
			setShowDeleteDialog(false);
		},
	});

	const handleDelete = () => {
		deleteStrategy({ strategyId });
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
				<AlertDialog
					open={showDeleteDialog}
					onOpenChange={setShowDeleteDialog}
				>
					<AlertDialogTrigger asChild>
						<DropdownMenuItem
							className="text-red-500 focus:text-red-500 focus:bg-red-50"
							onSelect={(e) => {
								e.preventDefault();
								setShowDeleteDialog(true);
							}}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							{t("desktop.strategyListPage.deleteStrategy")}
						</DropdownMenuItem>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>{t("desktop.strategyListPage.confirmDeleteStrategy")}</AlertDialogTitle>
							<AlertDialogDescription>
								{t("desktop.strategyListPage.confirmDeleteStrategyMessage", { strategyName: `"${strategyName}"` })}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel disabled={isDeleting}>
								{t("common.cancel")}
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDelete}
								disabled={isDeleting}
								className="bg-red-500 hover:bg-red-600 text-white"
							>
								{isDeleting ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
										{t("common.deleting")}
									</>
								) : (
									t("common.confirm")
								)}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
