const db = require("../config/db");
const bcrypt = require("bcrypt");
const { generateAdminToken } = require("../config/adminToken");

// admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        success: false,
        error: "Please provide your credentials",
      });
    }
    const [results] = await db.query(`SELECT * FROM admins WHERE email=?`, [
      email,
    ]);
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Email and Password is not correct",
      });
    }
    const token = generateAdminToken({ id: admin.id });
    const { password: pwd, ...adminsWithoutPassword } = admin;

    res.status(200).json({
      success: true,
      message: "Successfully logged in",
      data: {
        admin: adminsWithoutPassword,
        token,
      },
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: "User Login Unseccess",
      error: error.message,
    });
  }
};

// get me admin
exports.getMeAdmin = async (req, res) => {
  try {
    const admin = req.decodedAdmin;
    res.status(200).json(admin);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
