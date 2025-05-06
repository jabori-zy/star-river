
import Login from "../pages/login";
import StrategyListPage from "../pages/StrategyListPage";
import { createBrowserRouter } from "react-router";
import TestPage from "../pages/TestPage";
import StrategyNodePage from "../pages/StrategyNodePage";
import AccountPage from "../pages/AccountPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <StrategyListPage />,
    },
    {
        path: "/node",
        element: <StrategyNodePage />,
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
]);

export default router;
