import { createBrowserRouter } from "react-router";
import AccountPage from "../components/AccountPage";
import StrategyListPage from "../components/StrategyListPage";
import BacktestPage from "../pages/backtest-page";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/login";
import SettingPage from "../pages/SettingPage";
import StrategyPage from "../pages/strategy-page";
import TestPage from "../pages/TestPage/index";
import ColorPickerTest from "../pages/color-picker-test";
import SimpleColorTest from "../pages/simple-color-test";
import ColorPickerDemo from "../pages/color-picker-demo";
import ColorModeTest from "../pages/color-mode-test";
import RgbInputTest from "../pages/rgb-input-test";
import LayoutTest from "../pages/layout-test";
import ResponsiveTest from "../pages/responsive-test";
import FinalLayoutTest from "../pages/final-layout-test";
import CompactLayoutTest from "../pages/compact-layout-test";
import VerticalLayoutTest from "../pages/vertical-layout-test";

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
		],
	},
	{
		path: "/login",
		element: <Login />,
	},
	{
		path: "/color-picker-test",
		element: <ColorPickerTest />,
	},
	{
		path: "/simple-color-test",
		element: <SimpleColorTest />,
	},
	{
		path: "/color-picker-demo",
		element: <ColorPickerDemo />,
	},
	{
		path: "/color-mode-test",
		element: <ColorModeTest />,
	},
	{
		path: "/rgb-input-test",
		element: <RgbInputTest />,
	},
	{
		path: "/layout-test",
		element: <LayoutTest />,
	},
	{
		path: "/responsive-test",
		element: <ResponsiveTest />,
	},
	{
		path: "/final-layout-test",
		element: <FinalLayoutTest />,
	},
	{
		path: "/compact-layout-test",
		element: <CompactLayoutTest />,
	},
	{
		path: "/vertical-layout-test",
		element: <VerticalLayoutTest />,
	},
	{
		path: "/backtest/:strategyId?",
		element: <BacktestPage />,
	},
]);

export default router;
