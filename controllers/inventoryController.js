const db = require("../config/db");

// create inventory
exports.createInventory = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;
    const {
      item_name,
      amount,
      quantity,
      rate_type,
      date,
      status,
      transaction_no,
    } = req.body;

    const images = req.file;
    let image = "";
    if (images && images.path) {
      image = `/public/images/${images.filename}`;
    }

    // Insert inventory into the database
    const [result] = await db.query(
      "INSERT INTO inventory (user_id, item_name, image, amount, quantity, rate_type, date, status, transaction_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user_id,
        item_name || "",
        image,
        amount || 0,
        quantity || 0,
        rate_type || "",
        date || "",
        status || "",
        transaction_no || "",
      ]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert Inventory, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Inventory inserted successfully",
      InventoryID: result.insertId,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Inventory",
      error: error.message,
    });
  }
};

// get all Inventory
exports.getAllInventory = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM inventory ORDER BY id DESC");
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No inventory found",
        result: data,
      });
    }

    res.status(200).send({
      success: true,
      message: "Get all Inventory",
      totalInventory: data.length,
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Inventory",
      error: error.message,
    });
  }
};

// get single Rate
exports.getSingleRate = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM inventory WHERE id", [id]);
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No inventory found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single Rate",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single Rate",
      error: error.message,
    });
  }
};

// update Rate
exports.updateRate = async (req, res) => {
  try {
    const id = req.params.id;
    const { rate_type, start_unit, end_unit, inventory } = req.body;

    const [preData] = await db.query("SELECT * FROM inventory WHERE id", [id]);
    if (!preData || preData.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No inventory found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE inventory SET rate_type=?, start_unit = ?, end_unit=?, rate=? WHERE id = ?",
      [
        rate_type || preData[0].rate_type,
        start_unit || preData[0].start_unit,
        end_unit || preData[0].end_unit,
        inventory || preData[0].rate,
        id,
      ]
    );

    // Check if the inventory was updated successfully
    if (result.affectedRows === 0) {
      return res.status(201).send({
        success: false,
        message: "Rate not found or no changes made",
      });
    }

    // Success response
    res.status(200).send({
      success: true,
      message: "Rate updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Rate",
      error: error.message,
    });
  }
};

// delete Rate
exports.deleteRate = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the inventory exists in the database
    const [rate] = await db.query(`SELECT * FROM inventory WHERE id = ?`, [id]);

    // If inventory not found, return 404
    if (!rate || rate.length === 0) {
      return res.status(201).send({
        success: false,
        message: "rate not found",
      });
    }

    // Proceed to delete the rate
    const [result] = await db.query(`DELETE FROM inventory WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete rate",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "rate deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting rate",
      error: error.message,
    });
  }
};
