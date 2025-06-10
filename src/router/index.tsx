import Login from "../pages/login";
import StrategyListPage from "../pages/StrategyListPage";
import { createBrowserRouter } from "react-router";
import TestPage from "../pages/TestPage/index";
import StrategyPage from "../pages/StrategyPage";
import AccountPage from "../pages/AccountPage";
import BacktestPage from "../pages/BacktestPage";
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
                path: "node",
                element: <StrategyPage />,
            },
            {
                path: "strategy",
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
        path: "/backtest",
        element: <BacktestPage />,
    },
    {
        path: "/test",
        element: <TestPage />,
    },
]);

export default router;
