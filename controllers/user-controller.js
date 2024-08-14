const User=require("../models/user")
const Task = require("../models/task")
const HttpError =require("../models/HttpError")
const jwt=require("jsonwebtoken")
const bcrypt=require("bcryptjs")
const {validationResult}=require("express-validator")
const { default: mongoose } = require("mongoose")
require("dotenv").config()

const userRegister=async (req,res,next)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty())
    {
        return next(new HttpError("Invalid credentials",400))
    }
    const {userName,password,email,city}=req.body
    const user=await User.findOne({email:email})
    if(user)
    {
        return next(new HttpError("Email already exists",409))
    }
    const hashedPassword=await bcrypt.hash(password,12)
    const createdUser=new User({
        userName,
        password:hashedPassword,
        email,
        city,
    })
    
    await createdUser.save()
    const token=jwt.sign({userId:createdUser._id,email:createdUser.email},process.env.SECRET_KEY,{expiresIn:"1h"})

    await res.cookie('token', token, { httpOnly: true, secure: false ,sameSite:"strict",maxAge:60*60*1000});

    res.status(201).send({message:"User created successfully",status:201,data:{userName:createdUser.userName,
    email:createdUser.email,
    city:createdUser.city,
    _id:createdUser._id,
    // token:token
    }
    })
}

const userLogin=async (req,res,next)=>{
    const {password,email}=req.body

    const user=await User.findOne({email:email})

    if(!user)
    {
        return next(new HttpError("User not found",404))
    }
    
    const validUser=await bcrypt.compare(password,user.password)
    if(!validUser)
    {
        return next(new HttpError("Incorrect email or password",400))
    }
    let token=jwt.sign({userId:user.id,email:user.email},process.env.SECRET_KEY,{expiresIn:"1h"})

    await res.cookie('token', token, { httpOnly: true, secure: false,sameSite:"strict",maxAge:60*60*1000 });

    res.status(200).send({message:"Login Successful",status:200,data:{
        userName:user.userName,
        email:user.email,
        _id:user.id,
        city:user.city,
        // token:token
    }})
}


const getAllUsers=async(req,res,next)=>{
    const users=await User.find({},"-password")
    if(!users.length)
    {
        return next(new HttpError("No users found",404))
    }
    res.status(200).send({message:"Users fetched successfully",status:200,data:users})
}

const getUserById=async(req,res,next)=>{
    const userId=req.user

    if(!userId)
        {
            return next(new HttpError("User Id is required",400))  
        }
        const validId=mongoose.Types.ObjectId.isValid(userId)
        if(!validId)
        {
            return next(new HttpError("Invalid user Id",400))  
        }
        const user=await User.findById(userId,"-password")
        if(!user)
        {
            return next(new HttpError("User not found",404))
        }
   
    res.status(200).send({message:"User fetched successfully",status:200,data:user})
}

const updateUserById=async(req,res,next)=>{

    const errors=validationResult(req)
    if(!errors.isEmpty())
    {
        return next(new HttpError("Invalid credentials",400))
    }

    const userId=req.user
    
    if(!userId)
        {
            return next(new HttpError("User Id is required",400))  
        }
        const validId=mongoose.Types.ObjectId.isValid(userId)
        if(!validId)
        {
            return next(new HttpError("Invalid user Id",400))  
        }
        const user=await User.findById(userId,"-password")
        if(!user)
        {
            return next(new HttpError("User not found",404))
        }

    await User.findByIdAndUpdate(userId,{...req.body})

    const updatedUser=await User.findById(userId,"-password")
    
    res.status(200).send({message:"User updated successfully",status:200,data:updatedUser})
}


const deleteUserById=async(req,res,next)=>{

    const userId=req.user
   
    if(!userId)
        {
            return next(new HttpError("User Id is required",400))  
        }
        const validId=mongoose.Types.ObjectId.isValid(userId)
        if(!validId)
        {
            return next(new HttpError("Invalid user Id",400))  
        }
        const user=await User.findById(userId,"-password")
        if(!user)
        {
            return next(new HttpError("User not found",404))
        }

    try{
        await Task.deleteMany({userId:userId})
        await User.findByIdAndDelete(userId)
        await res.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'Strict' });
    }

    catch(err){
        return next(new HttpError("Unable to delete the user",400))  
    }
    
    
    
    res.status(200).send({message:"User deleted successfully",status:200})
}


const changePassword=async(req,res,next)=>{

    const errors=validationResult(req)
    if(!errors.isEmpty())
    {
        return next(new HttpError("Invalid credentials",400))
    }

    const userId=req.user
   
    if(!userId)
        {
            return next(new HttpError("User Id is required",400))  
        }
        const validId=mongoose.Types.ObjectId.isValid(userId)
        if(!validId)
        {
            return next(new HttpError("Invalid user Id",400))  
        }
        const user=await User.findById(userId)
        if(!user)
        {
            return next(new HttpError("User not found",404))
        }

    const {oldPassword,newPassword}=req.body

    const validOldPassword=await bcrypt.compare(oldPassword,user.password)
    if(!validOldPassword)
    {
        return next(new HttpError("Incorrect old password",400))
    }
    
    const updatedPassword=await bcrypt.hash(newPassword,12)

    await User.findByIdAndUpdate(userId,{password:updatedPassword})

    const updatedUser=await User.findById(userId,"-password")

    res.status(200).send({message:"Password changed successfully",status:200,data:updatedUser})
}


exports.userLogin=userLogin
exports.userRegister=userRegister
exports.getAllUsers=getAllUsers
exports.getUserById=getUserById
exports.updateUserById=updateUserById
exports.deleteUserById=deleteUserById
exports.changePassword=changePassword


