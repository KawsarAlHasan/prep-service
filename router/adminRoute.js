const express = require("express");

const verifyAdmin = require("../middleware/verifyAdmin");
const { adminLogin, getMeAdmin } = require("../controllers/adminController");
const router = express.Router();

router.post("/login", adminLogin);
router.get("/me", verifyAdmin, getMeAdmin);

module.exports = router;
