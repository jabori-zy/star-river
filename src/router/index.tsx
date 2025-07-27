import { createBrowserRouter } from "react-router";
import AccountPage from "../components/AccountPage";
import StrategyListPage from "../components/StrategyListPage";
import BacktestPage from "../pages/backtest-page";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/login";
import SettingPage from "../pages/SettingPage";
import StrategyPage from "../pages/strategy-page";
import TestPage from "../pages/TestPage/index";

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
	{
		path: "/test",
		element: <TestPage />,
	},
]);

export default router;
