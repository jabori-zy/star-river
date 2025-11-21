



export enum BacktestStrategyRunStatus {
    Created = "Created",
    Checking = "Checking",
    CheckPassed = "CheckPassed",
    Initializing = "Initializing",
    Ready = "Ready",
    Playing = "Playing",
    Pausing = "Pausing",
    PlayComplete = "PlayComplete",
    Stopping = "Stopping",
    Stopped = "Stopped",
    Failed = "Failed",
    Error = "Error",
}


export enum BacktestNodeRunState {
	Checking = "Checking",
	Created = "Created",
	Initializing = "Initializing",
	Ready = "Ready",
	Backtesting = "Backtesting",
	BacktestComplete = "BacktestComplete",
	Stopping = "Stopping",
	Stopped = "Stopped",
	Failed = "Failed",
}