
import Login from "../pages/login";
import { createBrowserRouter } from "react-router";


const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />,
    },
    {
        path: "/login",
        element: <Login />,
    },
]);

export default router;
