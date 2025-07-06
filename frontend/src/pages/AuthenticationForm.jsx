import { useState } from "react";
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from "@headlessui/react";

export default function AuthenticationForm({ open, setOpen, state }) {
    const initialData = {
        state: state,
        fullName: "",
        userName: "",
        password: "",
    };
    const [formData, setFormData] = useState(initialData);

    const resetFormData = () => {
        setFormData((prev)=>{
            return {
                ...initialData,
                state: prev.state,
            };
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <div>
                <Dialog
                    open={open}
                    onClose={handleClose}
                    className="relative z-10"
                >
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in"
                    />

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <DialogPanel
                                transition
                                className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
                            >
                                <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 dark:bg-gradient-to-br from-[#040b1a] to-[#171e2b]">
                                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                                        <img
                                            alt="Your Company"
                                            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                            className="mx-auto h-10 w-auto"
                                        />
                                        <div className="w-full h-10 mt-4 flex items-center justify-center gap-10">
                                            <button
                                                className={`w-24 text-white px-3 py-2 rounded-3xl ${
                                                    !formData.state
                                                        ? "bg-indigo-600"
                                                        : "bg-gray-600"
                                                }`}
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        state: false,
                                                    });
                                                    resetFormData();
                                                }}
                                            >
                                                Sign Up
                                            </button>
                                            <button
                                                className={`w-24 text-white px-3 py-2 rounded-3xl ${
                                                    formData.state
                                                        ? "bg-indigo-600"
                                                        : "bg-gray-600"
                                                }`}
                                                onClick={() => {
                                                    setFormData({
                                                        ...formData,
                                                        state: true,
                                                    });
                                                    resetFormData();
                                                }}
                                            >
                                                Sign In
                                            </button>
                                        </div>
                                        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900 dark:text-white">
                                            {formData.state
                                                ? "Sign In"
                                                : "Sign Up"}
                                        </h2>
                                    </div>

                                    <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                                        <form
                                            action="#"
                                            method="POST"
                                            className="space-y-6"
                                        >
                                            {!formData.state && (
                                                <div>
                                                    <label
                                                        htmlFor="name"
                                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                                    >
                                                        Full Name
                                                    </label>
                                                    <div className="mt-2">
                                                        <input
                                                            id="name"
                                                            name="name"
                                                            type="text"
                                                            required
                                                            autoComplete="name"
                                                            value={
                                                                formData.name
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-[#101828] dark:text-white"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label
                                                    htmlFor="userName"
                                                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                                >
                                                    Username
                                                </label>
                                                <div className="mt-2">
                                                    <input
                                                        id="userName"
                                                        name="userName"
                                                        type="text"
                                                        required
                                                        autoComplete="userName"
                                                        value={
                                                            formData.userName
                                                        }
                                                        onChange={handleChange}
                                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-[#101828] dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <label
                                                        htmlFor="password"
                                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                                    >
                                                        Password
                                                    </label>
                                                </div>
                                                <div className="mt-2">
                                                    <input
                                                        id="password"
                                                        name="password"
                                                        type="password"
                                                        required
                                                        autoComplete="current-password"
                                                        value={
                                                            formData.password
                                                        }
                                                        onChange={handleChange}
                                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-[#101828] dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <button
                                                    type="submit"
                                                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                >
                                                    {formData.state
                                                        ? "Sign In"
                                                        : "Sign Up"}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>
            </div>
        </>
    );
}
