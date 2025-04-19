
import Login from "../pages/login";
import StrategyMain from "../pages/StrategyMain";
import { createBrowserRouter } from "react-router";
import TestPage from "../pages/TestPage";
import NodePage from "../pages/NodePage";
import AccountPage from "../pages/AccountPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <StrategyMain />,
    },
    {
        path: "/node",
        element: <NodePage />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/strategy",
        element: <StrategyMain />,
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
