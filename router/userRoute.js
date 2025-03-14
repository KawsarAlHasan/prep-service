const express = require("express");
const {
  signUpUser,
  userLogin,
  getMeUser,
  getAllUsers,
  userStatusUpdate,
  updateUser,
  getSingleUser,
  updateProfileUser,
  updateUserPassword,
  deleteUser,
  updateUserWithId,
} = require("../controllers/userController");
const verifyUser = require("../middleware/verifyUser");
const verifyAdmin = require("../middleware/verifyAdmin");
const uploadImage = require("../middleware/imagesUploader");

const router = express.Router();

router.post(
  "/signup",
  verifyAdmin,
  uploadImage.single("profile_pic"),
  signUpUser
);
router.post("/login", userLogin);
router.get("/me", verifyUser, getMeUser);
router.get("/all", verifyAdmin, getAllUsers);
router.get("/:id", verifyAdmin, getSingleUser);
router.put("/update", verifyUser, updateUser);
router.put("/update/:id", updateUserWithId);
router.put(
  "/update/profile",
  uploadImage.single("profile_pic"),
  verifyUser,
  updateProfileUser
);
router.put("/status/:id", verifyAdmin, userStatusUpdate);
router.put("/password", verifyUser, updateUserPassword);
router.delete("/delete/:id", deleteUser);

module.exports = router;
