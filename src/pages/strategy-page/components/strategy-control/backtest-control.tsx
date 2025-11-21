import { BacktestControlProps } from "./type"
import { Button } from "@/components/ui/button"
import { BacktestStrategyRunStatus } from "@/types/strategy/backtest-strategy"
import { Play, ExternalLink, Square, ChevronDown } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import { ButtonGroup } from "@/components/ui/button-group"


const BacktestControl: React.FC<BacktestControlProps> = ({
    strategyId,
    strategyRunState,
    onStartBacktest,
    onStopBacktest,
    onOpenBacktestWindow,
    onReopenDialog,
}) => {
    console.log('strategyRunState', strategyRunState);

    const getControlButton = (strategyRunState: BacktestStrategyRunStatus) => {
        switch (strategyRunState) {
            case BacktestStrategyRunStatus.Stopped:
                return (
                    <Button
                        variant="default"
                        size="sm"
                        className="text-white  border border-amber-500"
                        onClick={() => onStartBacktest(strategyId)}>
                            <Play className="h-4 w-4 fill-current" />
                            Start Backtest
                        </Button>
                    )
            case BacktestStrategyRunStatus.Created:
            case BacktestStrategyRunStatus.Checking:
            case BacktestStrategyRunStatus.CheckPassed:
            case BacktestStrategyRunStatus.Initializing:
                return (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="border border-gray-500 hover:bg-gray-400"
                        onClick={() => onReopenDialog?.('init')}>
                            <Spinner className="size-4 animate-spin" />
                            Loading...
                        </Button>
                    )
            case BacktestStrategyRunStatus.Stopping:
                return (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="border border-gray-500"
                        onClick={() => onReopenDialog?.('stop')}>
                            <Spinner className="size-4 animate-spin" />
                            Stopping...
                        </Button>
                    )
            case BacktestStrategyRunStatus.Ready:
            case BacktestStrategyRunStatus.Playing:
            case BacktestStrategyRunStatus.Pausing:
                return (
                    <ButtonGroup>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="border border-amber-500"
                            disabled={true}>
                                <Spinner className="size-4 animate-spin" />
                                Running...
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="!pl-2"
                                >
                                    <ChevronDown />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="">
                                <DropdownMenuItem onClick={onOpenBacktestWindow}>
                                    <ExternalLink className="w-4 h-4" />
                                    打开回测窗口
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onStopBacktest}>
                                    <Square className="w-4 h-4 text-red-500" />
                                    <span className="text-red-500">停止策略</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </ButtonGroup>
                    
                    )
            default:
                return null;
        }
    }

    return (
        getControlButton(strategyRunState)
    );
}


export default BacktestControl;