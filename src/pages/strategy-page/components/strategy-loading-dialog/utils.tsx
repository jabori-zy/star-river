import { Badge } from "@/components/ui/badge";
import { StrategyRunState } from "@/types/strategy";
import { BacktestStrategyRunState } from "@/types/strategy/backtest-strategy";
import { LogLevel } from "@/types/strategy-event";
import { XCircle, AlertCircle, Info } from "lucide-react";




export const getStrategyRunStateBadge = (strategyRunState: StrategyRunState) => {

	switch (strategyRunState) {
		case BacktestStrategyRunState.Created:
			return <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border border-blue-500/20">Created</Badge>;
		case BacktestStrategyRunState.Checking:
			return <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border border-blue-500/20">Checking</Badge>;
		case BacktestStrategyRunState.CheckPassed:
			return <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border border-blue-500/20">CheckPassed</Badge>;
		case BacktestStrategyRunState.Initializing:
			return <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border border-blue-500/20">Initializing</Badge>;
		case BacktestStrategyRunState.Ready:
			return <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border border-green-500/20">Ready</Badge>;
		case BacktestStrategyRunState.Playing:
			return <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border border-green-500/20">Playing</Badge>;
		case BacktestStrategyRunState.Pausing:
			return <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border border-green-500/20">Pausing</Badge>;
		case BacktestStrategyRunState.PlayComplete:
			return <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border border-green-500/20">PlayComplete</Badge>;
		case BacktestStrategyRunState.Stopping:
			return <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border border-green-500/20">Stopping</Badge>;
		case BacktestStrategyRunState.Stopped:
			return <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border border-green-500/20">Stopped</Badge>;
		case BacktestStrategyRunState.Error:
			return <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border border-red-500/20">Error</Badge>;
	}
};


export const getLogLevelStyle = (level: LogLevel) => {
	switch (level) {
		case LogLevel.ERROR:
			return {
				badgeClass: "bg-red-100 text-red-800 hover:bg-red-100",
				bgClass: "bg-red-50",
				icon: <XCircle className="w-4 h-4 text-red-500" />,
			};
		case LogLevel.WARNING:
			return {
				badgeClass: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
				bgClass: "bg-yellow-50",
				icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
			};
		case LogLevel.INFO:
			return {
				badgeClass: "bg-green-200 text-green-500 hover:bg-green-400",
				bgClass: "",
				icon: <Info className="w-4 h-4 text-green-500" />,
			};
		default:
			return {
				badgeClass: "bg-gray-100 text-gray-800 hover:bg-gray-100",
				bgClass: "",
				icon: <Info className="w-4 h-4 text-gray-500" />,
			};
	}
};