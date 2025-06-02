
import Login from "../pages/login";
import StrategyListPage from "../pages/StrategyListPage";
import { createBrowserRouter } from "react-router";
import TestPage from "../pages/TestPage";
import StrategyPage from "../pages/StrategyPage";
import AccountPage from "../pages/AccountPage";
import BacktestPage from "../pages/BacktestPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <StrategyListPage />,
    },
    {
        path: "/node",
        element: <StrategyPage />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/strategy",
        element: <StrategyListPage />,
    },
    {
        path: "/test",
        element: <TestPage />,
    },
    {
        path: "/account",
        element: <AccountPage />,
    },
    {
        path: "/backtest",
        element: <BacktestPage />,
    },
]);

export default router;
