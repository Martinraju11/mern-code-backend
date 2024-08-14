const express=require("express")
const mongoose=require("mongoose")
require("dotenv").config()
const bodyParser=require("body-parser")
const userRoutes=require("./routes/user-routes")
const taskRoutes=require("./routes/task-routes")
const HttpError=require("./models/HttpError")
const cookieParser = require('cookie-parser');
const app=express()

app.use(bodyParser.urlencoded({extended:false}))
app.use(express.json())
app.use(cookieParser());

app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*")
    res.setHeader("Access-Control-Allow-Headers","Origin,x-Requested-with,Content-Type,Accept,Authorization")
    res.setHeader("Access-Control-Allow-Methods","GET,POST,PATCH,PUT,DELETE")
    next()
})

app.use("/api/user",userRoutes)
app.use("/api/task",taskRoutes)

app.use((req,res,next)=>{
    const error=new HttpError("Incorrect URL",404)
    return next(error)
})

app.use((error,req,res,next)=>{
    if(res.headerSent)
    {
       return next(error)
    }
    res.status(error.code||500).json({message:error.message||"An unknown error occured"})
})

mongoose.connect(process.env.MONGO_URI).then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server connected at ${process.env.PORT} and Database connected`)
    })
})