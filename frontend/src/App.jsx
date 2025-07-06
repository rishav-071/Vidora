import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Authentication from "./pages/Authentication";

function App() {
    const routes = createBrowserRouter([
        {
            path: "/",
            element: <LandingPage />,
        },
        {
            path: "/auth",
            element: <Authentication />,
        },
    ]);
    return (
        <>
            <RouterProvider router={routes} />
        </>
    );
}

export default App;
