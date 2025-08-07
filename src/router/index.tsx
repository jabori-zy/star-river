import { createBrowserRouter } from "react-router";
import AccountPage from "../components/AccountPage";
import StrategyListPage from "../components/StrategyListPage";
import BacktestPage from "../pages/backtest-page";
import ColorModeTest from "../pages/color-mode-test";
import ColorPickerDemo from "../pages/color-picker-demo";
import ColorPickerTest from "../pages/color-picker-test";
import CompactLayoutTest from "../pages/compact-layout-test";
import Dashboard from "../pages/Dashboard";
import FinalLayoutTest from "../pages/final-layout-test";
import IndicatorLegendEditTest from "../pages/indicator-legend-edit-test";
import LayoutTest from "../pages/layout-test";
import Login from "../pages/login";
import ResponsiveTest from "../pages/responsive-test";
import RgbInputTest from "../pages/rgb-input-test";
import SettingPage from "../pages/SettingPage";
import SimpleColorTest from "../pages/simple-color-test";
import StrategyPage from "../pages/strategy-page";
import TestPage from "../pages/TestPage/index";
import TestNewChart from "../pages/test_new_chart";
import TestNewChartDebugger from "../pages/test-new-chart-debugger";
import TestPaneDeletion from "../pages/test-pane-deletion";
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
		path: "/test-pane-deletion",
		element: <TestPaneDeletion />,
	},
	{
		path: "/indicator-legend-edit-test",
		element: <IndicatorLegendEditTest />,
	},
	{
		path: "/backtest/:strategyId?",
		element: <BacktestPage />,
	},
	{
		path: "/test-new-chart",
		element: <TestNewChart />,
	},
	{
		path: "/test-new-chart-debugger",
		element: <TestNewChartDebugger />,
	},
]);

export default router;
