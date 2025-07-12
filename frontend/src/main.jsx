import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { DarkMode } from "./contexts/darkmode.jsx";
import { AuthProvider } from "./contexts/AuthProvider.jsx";
import {CookiesProvider} from "react-cookie";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <CookiesProvider>
            <AuthProvider>
                <DarkMode>
                    <App />
                </DarkMode>
            </AuthProvider>
        </CookiesProvider>
    </StrictMode>
);
