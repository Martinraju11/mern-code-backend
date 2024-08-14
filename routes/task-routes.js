const express=require("express")
const router=express.Router()
const taskController=require("../controllers/task-controllers")
const auth=require("../middleware/auth")
const {check}=require("express-validator")

router.use(auth)

router.post("/",[check("taskName").notEmpty(),check("taskDescription").notEmpty()],taskController.createTask)

router.get("/alltasks",taskController.getAllTaskByUserId)

router.get("/:tid",taskController.getTaskByTaskId)

router.put("/:tid",[check("taskName").notEmpty(),check("taskDescription").notEmpty(),check("isCompleted").notEmpty(),check("isActive").notEmpty()],taskController.updateTaskById)

router.delete("/:tid",taskController.deleteTaskById)

module.exports=router