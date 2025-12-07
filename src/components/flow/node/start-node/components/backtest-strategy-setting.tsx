import { PercentSquare, Play, TrendingUp, Wallet } from "lucide-react";
import type React from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface BacktestStrategySettingProps {
	initialBalance: number;
	setInitialBalance: (initialBalance: number) => void;
	updateInitialBalance: (initialBalance: number) => void;
	leverage: number;
	setLeverage: (leverage: number) => void;
	updateLeverage: (leverage: number) => void;
	feeRate: number;
	setFeeRate: (feeRate: number) => void;
	updateFeeRate: (feeRate: number) => void;
	playSpeed?: number;
	setPlaySpeed?: (playSpeed: number) => void;
	updatePlaySpeed?: (playSpeed: number) => void;
}

// Backtest strategy settings
const BacktestStrategySetting: React.FC<BacktestStrategySettingProps> = ({
	initialBalance,
	setInitialBalance,
	updateInitialBalance,
	leverage,
	setLeverage,
	updateLeverage,
	feeRate,
	setFeeRate,
	updateFeeRate,
	playSpeed,
	setPlaySpeed,
	updatePlaySpeed,
}) => {
	const { t } = useTranslation();
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Wallet className="h-4 w-4 text-muted-foreground" />
				<Label className="font-medium">{t("startNode.initialBalance")}</Label>
			</div>
			<Input
				type="number"
				value={initialBalance}
				onChange={(e) => {
					setInitialBalance(Number(e.target.value));
					updateInitialBalance(Number(e.target.value));
				}}
				className="h-8 text-sm"
			/>

			{/* Leverage */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
					<Label className="font-medium">{t("startNode.leverage")}</Label>
				</div>
				<Input
					type="number"
					value={leverage}
					onChange={(e) => {
						setLeverage(Number(e.target.value));
						updateLeverage(Number(e.target.value));
					}}
					className="h-8 text-sm"
				/>
			</div>

			{/* Fee rate */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<PercentSquare className="h-4 w-4 text-muted-foreground" />
					<Label className="font-medium">{t("startNode.feeRate")}</Label>
				</div>
				<Input
					type="number"
					value={feeRate}
					onChange={(e) => {
						setFeeRate(Number(e.target.value));
						updateFeeRate(Number(e.target.value));
					}}
					className="h-8 text-sm"
					step="0.0001"
				/>
			</div>

			{/* Playback speed */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Play className="h-4 w-4 text-muted-foreground" />
					<Label className="font-medium">{t("startNode.playSpeed")}</Label>
				</div>

				{playSpeed !== undefined && setPlaySpeed && updatePlaySpeed && (
					<Select
						value={playSpeed.toString()}
						onValueChange={(value) => {
							const speed = Number(value);
							setPlaySpeed(speed);
							updatePlaySpeed(speed);
						}}
					>
						<SelectTrigger className="h-8 text-sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="1">1x</SelectItem>
							<SelectItem value="3">3x</SelectItem>
							<SelectItem value="10">10x</SelectItem>
							<SelectItem value="20">20x</SelectItem>
							<SelectItem value="50">50x</SelectItem>
							<SelectItem value="100">100x</SelectItem>
						</SelectContent>
					</Select>
				)}
			</div>
		</div>
	);
};

export default BacktestStrategySetting;
