import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

export const login = async (req, res) => {
    try {
        const { userName, password } = req.body;

        if (!userName || !password) {
            return res
                .status(httpStatus.BAD_REQUEST)
                .json({ message: "Please provide all the required fields" });
        }
        const user = await User.findOne({ userName });
        if (!user)
            return res
                .status(httpStatus.NOT_FOUND)
                .json({ message: "User not found" });
        if (await bcrypt.compare(password, user.password)) {
            user.token = uuidv4(); // Generate a new token for the user
            await user.save(); // Save the updated user with the new token
            return res
                .status(httpStatus.OK)
                .cookie("token", user.token, {
                    signed: true,
                    httpOnly: true,
                })
                .json({ message: "Login Successful", token: user.token });
        } else
            return res
                .status(httpStatus.UNAUTHORIZED)
                .json({ message: "Invalid credentials" });
    } catch (error) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Server error", error: error.message });
    }
};

export const register = async (req, res) => {
    try {
        const { name, userName, password } = req.body;
        if (!name || !userName || !password) {
            return res
                .status(httpStatus.BAD_REQUEST)
                .json({ message: "Please provide all the required fields" });
        }
        const userExist = await User.findOne({ userName });
        if (userExist)
            return res
                .status(httpStatus.FOUND)
                .json({ message: "User already exists" });
        const hashedPassword = await bcrypt.hash(password, 1000000007);
        const newUser = new User({
            name: name,
            userName: userName,
            password: hashedPassword,
            token: uuidv4(),
        });
        const save = await newUser.save();
        res.status(httpStatus.CREATED)
            .cookie("token", newUser.token, {
                signed: true,
                httpOnly: true,
            })
            .json({
                token: newUser.token,
                message: "User Registered Successfully",
            });
    } catch (error) {
        return res
            .status(httpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: "Server error", error: error.message });
    }
};
