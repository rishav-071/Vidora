import "../index.css";
import DarkModeToggler from "./DarkModeToggler";
import { Link } from "react-router-dom";
import { useState } from "react";
import Authentication from "./Authentication";
import AuthenticationForm from "./AuthenticationForm";

export default function LandingPage() {
    const [open, setOpen] = useState(false);

    const handleClose=()=>{
        setOpen(false);
    }

    return (
        <div className="w-screen h-screen dark:bg-[#040b1a]">
            <nav className="px-5 py-3 dark:text-white dark:bg-[#101828] border-b-4 border-b-gray-300 dark:border-b-gray-800 bg-gray-200 flex justify-between items-center">
                <div className="">
                    <h2 className="text-3xl font-medium">Vidora</h2>
                </div>
                <div className="flex gap-6 cursor-pointer">
                    <DarkModeToggler />
                    <p>Join as Guest</p>
                    <p>Register</p>
                    <div role="button">
                        <p>Login</p>
                    </div>
                </div>
            </nav>
            <div className="w-screen h-[50vh] flex justify-center items-center">
                {/* <Link className="" to="/auth"> */}
                    <button onClick={() => setOpen(true)} className="dark:bg-[#685cfc] bg-blue-500 text-white p-1.5 rounded-lg">Get Started
                    </button>
                    <AuthenticationForm open={open} setOpen={setOpen} state={true}/>
                {/* </Link> */}
            </div>
        </div>
    );
}
