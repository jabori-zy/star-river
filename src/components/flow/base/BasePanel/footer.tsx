import { Button } from "@/components/ui/button";

/**
 * Panel footer props
 */
interface BasePanelFooterProps {
	tradeMode: string; // Trading mode
	onLiveModeSave: () => void; // Live mode save button callback
	onBacktestModeSave: () => void; // Backtest mode save button callback
	onSimulationModeSave: () => void; // Simulation mode save button callback
	onCancel: () => void; // Cancel button callback
}

/**
 * Panel footer
 *
 *
 *
 *
 */
const BasePanelFooter: React.FC<BasePanelFooterProps> = ({
	tradeMode,
	onLiveModeSave,
	onBacktestModeSave,
	onSimulationModeSave,
	onCancel,
}) => {
	return (
		<div className="flex justify-between items-center gap-6 ml-5 mr-5">
			<Button className="w-32" variant="outline" onClick={onCancel}>
				取消
			</Button>
			<Button
				className="w-32"
				onClick={
					tradeMode === "live"
						? onLiveModeSave
						: tradeMode === "backtest"
							? onBacktestModeSave
							: onSimulationModeSave
				}
			>
				保存
			</Button>
		</div>
	);
};

export default BasePanelFooter;
