import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import VideoMeet from "./pages/VideoMeet";

function App() {
    const routes = createBrowserRouter([
        {
            path: "/",
            element: <LandingPage />,
        },
        {
            path: "/:url",
            element: <VideoMeet />,
        },
        {
            path: "/auth",
            element: <p>Hello!</p>,
        },
    ]);
    return (
        <>
            <RouterProvider router={routes} />
        </>
    );
}

export default App;
