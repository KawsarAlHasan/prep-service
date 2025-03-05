const db = require("../config/db");

// create Rate
exports.createRate = async (req, res) => {
  try {
    const { rate_type, start_unit, end_unit, rate } = req.body;

    // Check if rate_type, start_unit, end_unit, rate is provided
    if (!rate_type || !start_unit || !end_unit || !rate) {
      return res.status(400).send({
        success: false,
        message: "Please provide rate_type, start_unit, end_unit, rate field",
      });
    }

    // Insert rate into the database
    const [result] = await db.query(
      "INSERT INTO rate (rate_type, start_unit, end_unit, rate) VALUES (?, ?, ?, ?)",
      [rate_type, start_unit, end_unit, rate]
    );

    // Check if the insertion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to insert rate, please try again",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "Rate inserted successfully",
      rateID: result.insertId,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "An error occurred while inserting the Rate",
      error: error.message,
    });
  }
};

// get all Rate
exports.getAllRate = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM rate ORDER BY id DESC");
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No Rate found",
        result: data,
      });
    }

    res.status(200).send({
      success: true,
      message: "Get all Rate",
      totalRate: data.length,
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Rate",
      error: error.message,
    });
  }
};

// get single Rate
exports.getSingleRate = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM rate WHERE id", [id]);
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No Rate found",
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
    const { rate_type, start_unit, end_unit, rate } = req.body;

    const [preData] = await db.query("SELECT * FROM rate WHERE id", [id]);
    if (!preData || preData.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No Rate found",
      });
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE rate SET rate_type=?, start_unit = ?, end_unit=?, rate=? WHERE id = ?",
      [
        rate_type || preData[0].rate_type,
        start_unit || preData[0].start_unit,
        end_unit || preData[0].end_unit,
        rate || preData[0].rate,
        id,
      ]
    );

    // Check if the rate was updated successfully
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

    // Check if the rate exists in the database
    const [rate] = await db.query(`SELECT * FROM rate WHERE id = ?`, [id]);

    // If rate not found, return 404
    if (!rate || rate.length === 0) {
      return res.status(201).send({
        success: false,
        message: "rate not found",
      });
    }

    // Proceed to delete the rate
    const [result] = await db.query(`DELETE FROM rate WHERE id = ?`, [id]);

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
