import "../index.css";
import DarkModeToggler from "./DarkModeToggler";
import { Link } from "react-router-dom";

export default function LandingPage() {
    return (
        <div className="w-screen h-screen dark:bg-neutral-700">
            <nav className="px-5 py-3 dark:text-white dark:bg-neutral-800 border-b-4 border-b-gray-300 bg-gray-200 flex justify-between items-center">
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
                <Link className="" to={"/home"}>
                    <button className="dark:bg-amber-500 bg-blue-500 text-white
                    dark:text-black p-1.5 rounded-lg">Get Started</button>
                </Link>
            </div>
        </div>
    );
}
