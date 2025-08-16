import { PercentSquare, Play, TrendingUp, Wallet } from "lucide-react";
import type React from "react";
import SliderWithTick from "@/components/slider-with-tick";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
					<Label className="font-medium">
						播放速度 ({playSpeed}x)
					</Label>
				</div>

				{playSpeed !== undefined && setPlaySpeed && updatePlaySpeed && (
					<SliderWithTick
						defaultValue={[playSpeed]}
						min={5}
						max={100}
						step={5}
						skipInterval={2}
						onValueChange={(value) => {
							// 当值为0时，设置为1
							const actualValue = value[0] === 0 ? 1 : value[0];
							if (setPlaySpeed) {
								setPlaySpeed(actualValue);
								updatePlaySpeed(actualValue);
							}
						}}
						label=""
						showTicks={true}
					/>
				)}
			</div>
		</div>
	);
};

export default BacktestStrategySetting;
