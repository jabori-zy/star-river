// Fill in strategy name, description and other information

import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateStrategy } from "@/service/strategy-management/create-strategy";
import { checkImportStrategy } from "@/utils/import-strategy";

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
	const [importFile, setImportFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { t } = useTranslation();

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImportFile(file);
		}
	};

	const handleClearFile = () => {
		setImportFile(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};
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
			handleClearFile();

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

	const handleCreate = async () => {
		let nodes: unknown[] | undefined;
		let edges: unknown[] | undefined;

		// If import file is selected, read and parse it
		if (importFile) {
			try {
				const fileContent = await importFile.text();
				const parsed = JSON.parse(fileContent);

				// Validate imported strategy data
				const checkResult = checkImportStrategy(parsed);
				if (!checkResult.valid) {
					toast.error(t("desktop.strategyCorrupted"));
					return;
				}

				nodes = checkResult.nodes;
				edges = checkResult.edges;
			} catch (_) {
				// console.error("Failed to parse import file:", error);
				toast.error(t("desktop.strategyCorrupted"));
				return;
			}
		}

		// Call mutation (toast is handled globally)
		createStrategy({
			name: strategyName.trim(),
			description: description.trim(),
			nodes,
			edges,
		});
	};

	const handleCancel = () => {
		onOpenChange(false);
		setStrategyName("");
		setDescription("");
		handleClearFile();
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
							<span className="text-sm text-muted-foreground">
								({t("desktop.optional")})
							</span>
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
					<div className="space-y-2">
						<Label>
							{t("desktop.importStrategy")}
							<span className="text-sm text-muted-foreground">
								({t("desktop.optional")})
							</span>
						</Label>
						<ButtonGroup className="w-full">
							<ButtonGroupText className="whitespace-nowrap">{t("desktop.chooseFile")}</ButtonGroupText>
							<InputGroup>
								<InputGroupInput
									ref={fileInputRef}
									type="file"
									accept=".txt"
									onChange={handleFileChange}
									className="file:hidden text-sm leading-7 hover:cursor-pointer "
								/>
								{importFile && (
									<InputGroupAddon align="inline-end">
										<InputGroupButton
											variant="ghost"
											onClick={handleClearFile}
											className="text-red-500 hover:text-red-600"
										>
											{t("common.clear")}
										</InputGroupButton>
									</InputGroupAddon>
								)}
							</InputGroup>
						</ButtonGroup>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel} disabled={isPending}>
						{t("common.cancel")}
					</Button>
					<Button onClick={handleCreate} disabled={isPending || !strategyName.trim()}>
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
