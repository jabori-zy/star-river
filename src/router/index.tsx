
import Login from "../pages/login";
import StrategyMain from "../pages/StrategyMain";
import { createBrowserRouter } from "react-router";
import TestPage from "../pages/TestPage";
import NodePage from "../pages/NodePage";

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
]);

export default router;
