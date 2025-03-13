const express = require("express");

const verifyUser = require("../middleware/verifyUser");

const uploadImage = require("../middleware/imagesUploader");
const uploadFiles = require("../middleware/filesUploader");
const {
  createReturnInventory,
  getMyReturnProducts,
  getAllReturnInventory,
  deleteProductsReturn,
  updateReturnInventoryStatus,
  getSingleProductsReturn,
} = require("../controllers/returnProductController");

const router = express.Router();

router.post("/create", verifyUser, createReturnInventory);

router.get("/all", getAllReturnInventory);
router.get("/", verifyUser, getMyReturnProducts);
router.get("/:id", getSingleProductsReturn);
// router.put("/update/:id", uploadImage.single("image"), updateInventory);
router.put("/status/:id", updateReturnInventoryStatus);
router.delete("/delete/:id", deleteProductsReturn);

module.exports = router;
