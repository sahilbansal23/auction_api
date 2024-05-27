const { Router } = require("express");
const router = Router();
const userController = require("../controllers/user");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", userController.getprofile);
router.put("/edit-password", userController.editpassword);

module.exports=router;
