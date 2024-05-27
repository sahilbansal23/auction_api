const { Router } = require("express");
const router = Router();
const itemController = require("../controllers/items");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // specify your uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", itemController.getAllItems);
router.get("/:id", itemController.itemDetails);
router.post("/", upload.single('image'), itemController.addItem);
router.put("/:id", itemController.editItem);
router.delete("/:id", itemController.deleteItem);
router.get("/:itemId/bids", itemController.getbids);
router.post("/:itemId/bids", itemController.deleteItem);


module.exports = router;
