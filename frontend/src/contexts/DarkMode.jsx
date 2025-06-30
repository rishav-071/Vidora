import { createContext, useEffect, useState, useContext } from "react";

const DarkModeContext = createContext();

export function DarkMode({ children }) {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        const darkMode = localStorage.getItem("darkMode") === "true";
        document.documentElement.classList.toggle("dark", darkMode);
        setIsDark(darkMode);
    }, []);

    const toggleDark = () => {
        const next = !isDark;
        setIsDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("darkMode", next.toString());
    };

    return (
        <DarkModeContext.Provider value={{ isDark, toggleDark }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export const useDarkMode = () => useContext(DarkModeContext);
