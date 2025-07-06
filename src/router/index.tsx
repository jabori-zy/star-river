import Login from "../pages/login";
import StrategyListPage from "../components/StrategyListPage";
import { createBrowserRouter } from "react-router";
import TestPage from "../pages/TestPage/index";
import StrategyPage from "../pages/strategy-page";
import AccountPage from "../components/AccountPage";
import BacktestPage from "../pages/backtest-page";
import Dashboard from "../pages/Dashboard";
import SettingPage from "../pages/SettingPage";

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
        ]
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
