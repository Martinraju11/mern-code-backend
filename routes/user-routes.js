const express=require("express")
const router=express.Router();
const userController=require("../controllers/user-controller")
const {check}=require("express-validator");
const auth = require("../middleware/auth");

router.post("/register",[check("userName").notEmpty(),check("password").notEmpty().isLength({min:6}),check("city").notEmpty(),check("email").normalizeEmail().isEmail()],userController.userRegister)

router.post("/login",userController.userLogin)

router.get("/allusers",userController.getAllUsers)

router.use(auth)

router.get("/",userController.getUserById)

router.put("/",[check("userName").notEmpty(),check("city").notEmpty()],userController.updateUserById)

router.delete("/",userController.deleteUserById)

router.put("/changepassword",[check("oldPassword").notEmpty(),check("newPassword").notEmpty().isLength({min:6})],userController.changePassword)

module.exports=router