import { createBrowserRouter } from "react-router";
import StrategyListPage from "../components/StrategyListPage";
import AccountPage from "../pages/account-page";
import BacktestPage from "../pages/backtest-page";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/login";
import SettingPage from "../pages/setting-page";
import StrategyPage from "../pages/strategy-page";
import TestPage from "../pages/TestPage/index";
import TestRunningLogPage from "../pages/test-running-log-page";

const router = createBrowserRouter([
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
				path: "test",
				element: <TestPage />,
			},
			{
				path: "test-running-log",
				element: <TestRunningLogPage />,
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
