import { useState, createContext, useEffect } from "react";
import { useCookies } from "react-cookie";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [cookies, setCookie, removeCookie] = useCookies(["token"]);
    const [token, setToken] = useState();

    useEffect(()=>{
        const token = cookies.token;
        if(token){
            setToken(token);
            localStorage.setItem("token", token);
        }
        
    },[]);

    return (
        <AuthContext.Provider value={{ token, setToken }}>
            {children}
        </AuthContext.Provider>
    );
}