import { PercentSquare, Play, TrendingUp, Wallet } from "lucide-react";
import type React from "react";
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

// 回测策略设置
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
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<Wallet className="h-4 w-4 text-muted-foreground" />
				<Label className="font-medium">初始资金</Label>
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

			{/* 杠杆倍数 */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<TrendingUp className="h-4 w-4 text-muted-foreground" />
					<Label className="font-medium">杠杆倍数</Label>
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

			{/* 手续费率 */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<PercentSquare className="h-4 w-4 text-muted-foreground" />
					<Label className="font-medium">手续费率</Label>
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

			{/* 播放速度 */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<Play className="h-4 w-4 text-muted-foreground" />
					<Label className="font-medium">播放速度</Label>
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
							<SelectValue placeholder="选择播放速度" />
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
