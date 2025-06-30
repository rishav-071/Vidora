import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { DarkMode } from "./contexts/darkmode.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <DarkMode>
            <App />
        </DarkMode>
    </StrictMode>
);
