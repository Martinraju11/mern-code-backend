const mongoose=require("mongoose")
const schema = mongoose.Schema

const taskSchema=new schema(
    {
        userId:{
            type:mongoose.Types.ObjectId,
            required:true,
        },
        taskName:{
            type:String,
            required:true
        },
        taskDescription:{
            type:String,
            required:true
        },
        isCompleted:{
            type:Boolean,
            required:true
        },
        isActive:{
            type:Boolean,
            required:true
        }
    }
)

module.exports=mongoose.model("Task",taskSchema)