const express = require("express");

const verifyUser = require("../middleware/verifyUser");
const {
  createInventory,
  getAllInventory,
  getSingleInventory,
  deleteInventory,
  updateInventoryBoxAndDimension,
  updateInventoryStatus,
  uploadshippingLabelPDF,
  updateInventory,
} = require("../controllers/inventoryController");
const uploadImage = require("../middleware/imagesUploader");

const router = express.Router();

router.post(
  "/create",
  uploadImage.array("images", 10),
  verifyUser,
  createInventory
);

router.get("/all", getAllInventory);
router.get("/:id", getSingleInventory);
router.put("/update/:id", uploadImage.single("image"), updateInventory);
router.put("/box-dimension/:id", updateInventoryBoxAndDimension);
router.put(
  "/shipping-pdf/:id",
  uploadImage.single("pdf"),
  uploadshippingLabelPDF
);
router.put("/status/:id", updateInventoryStatus);
router.delete("/delete/:id", deleteInventory);

module.exports = router;
