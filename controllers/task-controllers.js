const { validationResult } = require("express-validator")
const Task = require("../models/task")
const User = require("../models/user")
const HttpError = require("../models/HttpError")
const { default: mongoose } = require("mongoose")



const createTask = async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpError("All fields are required", 400))
    }
    const userId = req.user

    if (!userId) {
        return next(new HttpError("User ID is required", 400))
    }
    const validUserId = mongoose.Types.ObjectId.isValid(userId)
    if (!validUserId) {
        return next(new HttpError("Invalid User ID", 400))
    }
    const user = await User.findById(userId)
    if (!user) {
        return next(new HttpError("User not found for this user ID", 404))
    }

    const { taskName, taskDescription } = req.body
    const createTask = new Task({
        userId,
        taskName,
        taskDescription,
        isCompleted: false,
        isActive: false
    })
    let taskCreated
        try{
            taskCreated=await createTask.save()
        }
        catch(err){
            return next(new HttpError("Unable to create the task", 400))
        }

    res.status(201).send({ message: "Task created successfully", status: 201, data: taskCreated })
}

const getAllTaskByUserId = async (req, res, next) => {
    let allTasks
    const userId = req.user

    if (!userId) {
        return next(new HttpError("User ID is required", 400))
    }
    const validUserId = mongoose.Types.ObjectId.isValid(userId)
    if (!validUserId) {
        return next(new HttpError("Invalid User ID", 400))
    }
    const user = await User.findById(userId)
    if (!user) {
        return next(new HttpError("User not found for this user ID", 404))
    }

    try {
        allTasks = await Task.find({ userId: userId })
    }
    catch (err) {
        return next(new HttpError("Unable to fetch tasks", 404))
    }

    if (!allTasks.length) {
        return next(new HttpError("No tasks found", 404))
    }
    res.status(200).send({ message: "Tasks fetched successfully", status: 200, data: allTasks })
}

const getTaskByTaskId = async (req, res, next) => {
    const userId=req.user

    if (!userId) {
        return next(new HttpError("User ID is required", 400))
    }
    const validUserId = mongoose.Types.ObjectId.isValid(userId)
    if (!validUserId) {
        return next(new HttpError("Invalid User ID", 400))
    }
    const user = await User.findById(userId)
    if (!user) {
        return next(new HttpError("User not found for this user ID", 404))
    }

    const allTasks=await Task.find({userId:userId})

    if(!allTasks.length){
        return next(new HttpError("No tasks found for this user", 404))
    }

    const taskId=req.params.tid

    if(!taskId)
    {
        return next(new HttpError("Task Id is required", 400))
    }

    const validTaskId = mongoose.Types.ObjectId.isValid(taskId)
    if (!validTaskId) {
        return next(new HttpError("Invalid Task ID", 400))
    }

    const task= allTasks.find((v)=>{
       return v._id==taskId
    })
    if(!task)
    {
        return next(new HttpError("Task not found / Invalid id", 404))
    }

    res.status(200).send({ message: "Task fetched successfully", status: 200, data: task })
    
}

const updateTaskById=async(req,res,next)=>{
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new HttpError("All fields are required", 400))
    }

    const userId=req.user

    if (!userId) {
        return next(new HttpError("User ID is required", 400))
    }
    const validUserId = mongoose.Types.ObjectId.isValid(userId)
    if (!validUserId) {
        return next(new HttpError("Invalid User ID", 400))
    }
    const user = await User.findById(userId)
    if (!user) {
        return next(new HttpError("User not found for this user ID", 404))
    }

    const taskId=req.params.tid
    if(!taskId)
    {
        return next(new HttpError("Task Id is required", 400))
    }

    const validTaskId = mongoose.Types.ObjectId.isValid(taskId)
    if (!validTaskId) {
        return next(new HttpError("Invalid Task ID", 400))
    }

    const istaskPresent=await Task.findById(taskId)
    if(!istaskPresent)
    {
        return next(new HttpError("Task not found / Invalid id", 400))
    }
    try{
        await Task.findByIdAndUpdate(taskId,{...req.body})
    }
    catch(err){
        return next(new HttpError("Unable to update the task", 400))
    }
    const updatedTask=await Task.findById(taskId)

    res.status(200).send({ message: "Task updated successfully", status: 200, data: updatedTask })
}

const deleteTaskById=async(req,res,next)=>{
    const userId=req.user

    if (!userId) {
        return next(new HttpError("User ID is required", 400))
    }
    const validUserId = mongoose.Types.ObjectId.isValid(userId)
    if (!validUserId) {
        return next(new HttpError("Invalid User ID", 400))
    }
    const user = await User.findById(userId)
    if (!user) {
        return next(new HttpError("User not found for this user ID", 404))
    }

    const taskId=req.params.tid

    if(!taskId)
    {
        return next(new HttpError("Task Id is required", 400))
    }

    const validTaskId = mongoose.Types.ObjectId.isValid(taskId)
    if (!validTaskId) {
        return next(new HttpError("Invalid Task ID", 400))
    }
    
    const task=await Task.findById(taskId).populate("userId")
    if(!task)
    {
        return next(new HttpError("Task not found / Invalid id", 400))
    }
    try{
        await Task.findByIdAndDelete(taskId)
    }
    catch(err){
        return next(new HttpError("Unable to delete the task", 400))
    }

    res.status(200).send({ message: "Task deleted successfully", status: 200 })
}

exports.createTask = createTask
exports.getAllTaskByUserId = getAllTaskByUserId
exports.getTaskByTaskId = getTaskByTaskId
exports.updateTaskById = updateTaskById
exports.deleteTaskById = deleteTaskById
