import { createHashRouter } from "react-router";
import AccountPage from "../pages/account-page";
import BacktestPage from "../pages/backtest-page";
import Dashboard from "../pages/dashboard";
import Login from "../pages/login";
import SettingPage from "../pages/setting-page";
import StrategyListPage from "../pages/strategy-list-page";
import StrategyPage from "../pages/strategy-page";
import TestLogShowPage from "../pages/test-page/test-log-show";
import TestStrategyPerformanceReportPage from "../pages/test-page/test-strategy-performance-report-page";
import TestTablePage from "../pages/test-page/test-table";

const router = createHashRouter([
	{
		path: "/",
		element: <Dashboard />,
		children: [
			{
				index: true,
				element: <StrategyListPage />,
			},
			{
				path: "strategy",
				element: <StrategyPage />,
			},
			{
				path: "strategy-list",
				element: <StrategyListPage />,
			},
			{
				path: "account",
				element: <AccountPage />,
			},
			{
				path: "setting",
				element: <SettingPage />,
			},
			{
				path: "test-strategy-performance-report",
				element: <TestStrategyPerformanceReportPage />,
			},
			{
				path: "test-log-show",
				element: <TestLogShowPage />,
			},
			{
				path: "test-table",
				element: <TestTablePage />,
			},
		],
	},
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/backtest/:strategyId?",
		element: <BacktestPage />,
	},
]);

export default router;
