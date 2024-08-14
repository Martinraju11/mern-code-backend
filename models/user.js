const mongoose=require("mongoose");
const schema=mongoose.Schema;
const uniqueValidators=require("mongoose-unique-validator")
const userSchema=new schema({
    userName:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
        minLength:6
    },
    email:{
        type:String,
        required:true,
        unique:true 
    },
    city:{
        type:String,
        required:true,
    },
})

userSchema.plugin(uniqueValidators)

module.exports=mongoose.model("User",userSchema)