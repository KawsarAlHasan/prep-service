const express = require("express");

const verifyUser = require("../middleware/verifyUser");
const {
  createInventory,
  getAllInventory,
} = require("../controllers/inventoryController");
const uploadImage = require("../middleware/imagesUploader");

const router = express.Router();

router.post(
  "/create",
  uploadImage.single("image"),
  verifyUser,
  createInventory
);
router.get("/all", getAllInventory);

module.exports = router;
