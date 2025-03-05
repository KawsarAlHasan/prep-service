const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");
const {
  createRate,
  getAllRate,
  getSingleRate,
  updateRate,
  deleteRate,
} = require("../controllers/rateController");

const router = express.Router();

router.post("/create", verifyAdmin, createRate);
router.get("/all", getAllRate);
router.get("/:id", getSingleRate);
router.put("/update/:id", verifyAdmin, updateRate);
router.delete("/delete/:id", verifyAdmin, deleteRate);

module.exports = router;
