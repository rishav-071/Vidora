import {User} from '../models/user.model.js';
import httpStatus from 'http-status';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const login = async (req,res)=>{
    try {
        const {userName,password}=req.body;
        if(!userName || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({message: "Please provide all the required fields"});
        }
        const user=await User.findOne({userName});
        if(!user) return res.status(httpStatus.NOT_FOUND).json({message: "User not found"});
        if(await bcrypt.compare(password,user.password)){
            let token=crypto.randomBytes(20).toString('hex');
            user.token=token;
            await user.save();
            return res.status(httpStatus.OK).json({message: "Login Successful", token: token});
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({message: "Invalid credentials"});
        }
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: "Server error", error: error.message});
    }
}

export const register = async (req,res)=>{
    try {
        const {name,userName,password}=req.body;
        if(!name || !userName || !password) {
            return res.status(httpStatus.BAD_REQUEST).json({message: "Please provide all the required fields"});
        }
        const userExist=await User.findOne({ userName });
        if(userExist) return res.status(httpStatus.FOUND).json({message: "User already exists"});
        const hashedPassword=await bcrypt.hash(password, 1000000007);
        const newUser=new User({
            name: name,
            userName: userName,
            password: hashedPassword,
        });
        const save=await newUser.save();
        res.status(httpStatus.CREATED).json({ message: "User Registered Successfully"});
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: "Server error", error: error.message});
    }
}