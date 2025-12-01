// Fill in strategy name, description and other information

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateStrategy } from "@/service/strategy-management/create-strategy";
import { useTranslation } from "react-i18next";
interface CreateStrategyDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
}

const CreateStrategyDialog = ({
	open,
	onOpenChange,
}: CreateStrategyDialogProps) => {
	const navigate = useNavigate();
	const [strategyName, setStrategyName] = useState("");
	const [description, setDescription] = useState("");
	const { t } = useTranslation();
	// Use TanStack Query Hook
	const { mutate: createStrategy, isPending } = useCreateStrategy({
		meta: {
			successMessage: "Create strategy success.",
			showSuccessToast: true,
			errorMessage: "Create strategy failed.",
			showErrorToast: true,
		},
		onSuccess: (strategy) => {
			// Close dialog
			onOpenChange(false);

			// Clear form
			setStrategyName("");
			setDescription("");

			// Navigate to strategy edit page
			navigate("/strategy", {
				state: {
					strategyId: strategy.id,
					strategyName: strategy.name,
					description: strategy.description,
				},
			});
		},
		onError: () => {
			// Error is handled by global MutationCache, no extra handling needed here
			// Add special business logic here if needed
		},
	});

	const handleCreate = () => {
		// Call mutation (toast is handled globally)
		createStrategy({
			name: strategyName.trim(),
			description: description.trim(),
		});
	};

	const handleCancel = () => {
		onOpenChange(false);
		setStrategyName("");
		setDescription("");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-[425px]"
				onOpenAutoFocus={(e) => e.preventDefault()} // Prevent auto focus
			>
				<DialogHeader>
					<DialogTitle>{t("desktop.createStrategy")}</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="name" className="flex items-center gap-1">
							{t("desktop.strategyName")}
							<span className="text-red-500">*</span>
						</Label>
						<Input
							id="name"
							placeholder={t("desktop.inputStrategyName")}
							value={strategyName}
							onChange={(e) => {
								setStrategyName(e.target.value);
							}}
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="description">
							{t("desktop.strategyDescription")}
							<span className="text-sm text-muted-foreground">({t("desktop.optional")})</span>
						</Label>
						<Textarea
							id="description"
							placeholder={t("desktop.inputStrategyDescription")}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="resize-none min-h-[100px]"
							rows={4}
							style={{
								overflowY: "auto",
								wordBreak: "break-word",
							}}
						/>
					</div>
				</div>
			<DialogFooter>
				<Button variant="outline" onClick={handleCancel} disabled={isPending}>
					{t("common.cancel")}
				</Button>
				<Button onClick={handleCreate} disabled={isPending}>
					{isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							{t("common.saving")}
						</>
					) : (
						t("desktop.build")
					)}
				</Button>
			</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default CreateStrategyDialog;
