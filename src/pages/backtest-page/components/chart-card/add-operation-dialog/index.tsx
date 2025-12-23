import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getOperationGroupOutputNamesApi } from "@/service/backtest-strategy/operation-group-output-names";
import { SeriesType, type OperationChartConfig } from "@/types/chart";
import type { BacktestChartConfig } from "@/types/chart/backtest-chart";
import type { OperationKey } from "@/types/symbol-key";
import { parseKey } from "@/utils/parse-key";
import OperationSelector from "./operation-selector";

interface AddOperationDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	strategyId: number;
	chartConfig: BacktestChartConfig;
	onOperationAdd: (operationChartConfig: OperationChartConfig) => void;
}

export default function AddOperationDialog({
	chartConfig,
	open,
	onOpenChange,
	strategyId,
	onOperationAdd,
}: AddOperationDialogProps) {
	const { t } = useTranslation();
	// Selected operation cache key
	const [selectedOperationKey, setSelectedOperationKey] = useState<
		string | undefined
	>(undefined);
	// Loading state for API request
	const [isLoading, setIsLoading] = useState(false);
	// Whether to display in main chart
	const [isInMainChart, setIsInMainChart] = useState(false);

	// Reset selection when dialog opens
	useEffect(() => {
		if (open) {
			setSelectedOperationKey(undefined);
			setIsLoading(false);
			setIsInMainChart(false);
		}
	}, [open]);

	// Update isInMainChart when selected operation changes
	useEffect(() => {
		if (selectedOperationKey) {
			// Check if the operation already exists in config and is not deleted
			const existingConfig = chartConfig.operationChartConfigs?.find(
				(config) =>
					config.operationKeyStr === selectedOperationKey && !config.isDelete,
			);
			if (existingConfig) {
				setIsInMainChart(existingConfig.isInMainChart);
			} else {
				// Default to false (subchart) for new operations
				setIsInMainChart(false);
			}
		}
	}, [selectedOperationKey, chartConfig.operationChartConfigs]);

	// Handle add operation
	const handleAddOperation = async () => {
		if (!selectedOperationKey) return;

		const operationKey = parseKey(selectedOperationKey) as OperationKey;
		if (!operationKey) return;

		setIsLoading(true);

		try {
			// Fetch output names from API
			const outputNames = await getOperationGroupOutputNamesApi(
				strategyId,
				selectedOperationKey,
			);

			// Create series configs from output names
			const seriesConfigs = outputNames.map((outputSeriesKey) => ({
				name: outputSeriesKey,
				type: SeriesType.LINE,
				outputSeriesKey,
			}));

			// Create operation chart config
			const operationChartConfig: OperationChartConfig = {
				operationKeyStr: selectedOperationKey,
				isDelete: false,
				isInMainChart,
				visible: true,
				seriesConfigs,
			};

			onOperationAdd(operationChartConfig);
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to get operation output names:", error);
			toast.error(t("common.error"), {
				description:
					error instanceof Error ? error.message : "Failed to add operation",
			});
		} finally {
			setIsLoading(false);
		}
	};

	// Handle cancel
	const handleCancel = () => {
		setSelectedOperationKey(undefined);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange} modal={false}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{t("desktop.backtestPage.addOperation")}</DialogTitle>
					<DialogDescription>
						{t("desktop.backtestPage.addOperationDescription")}
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					{chartConfig.klineChartConfig.klineKeyStr ? (
						<>
							<div className="grid gap-2">
								<Label htmlFor="operation-selector" className="text-left">
									{t("desktop.backtestPage.operation")}
								</Label>
								<OperationSelector
									klineKeyStr={chartConfig.klineChartConfig.klineKeyStr}
									selectedOperationKey={selectedOperationKey}
									onOperationSelect={setSelectedOperationKey}
									strategyId={strategyId}
									placeholder={t("desktop.backtestPage.addOperationPlaceholder")}
								/>
							</div>
							{selectedOperationKey && (
								<div className="flex items-center space-x-2">
									<Checkbox
										id="is-in-main-chart"
										checked={isInMainChart}
										onCheckedChange={(checked) =>
											setIsInMainChart(checked === true)
										}
									/>
									<Label
										htmlFor="is-in-main-chart"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
									>
										{t("desktop.backtestPage.inMainChart")}
									</Label>
								</div>
							)}
						</>
					) : (
						<div className="flex items-center justify-center py-8 text-gray-500">
							请先选择交易对
						</div>
					)}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={handleCancel} disabled={isLoading}>
						{t("common.cancel")}
					</Button>
					<Button
						onClick={handleAddOperation}
						disabled={!selectedOperationKey || isLoading}
					>
						{isLoading ? t("common.loading") : t("common.save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
