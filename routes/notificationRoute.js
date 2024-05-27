const { Router } = require("express");
const router = Router();
const notification = require("../controllers/notification");

router.get("/", notification.getNotification);
router.post("/mark-read", notification.markRead);

module.exports=router;
