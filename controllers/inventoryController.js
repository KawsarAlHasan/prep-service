const db = require("../config/db");

// Create Inventory
exports.createInventory = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;
    const inventories = JSON.parse(req.body.inventories); // Parse JSON string

    if (!inventories || !Array.isArray(inventories)) {
      return res.status(400).send({
        success: false,
        message: "Invalid inventories data",
      });
    }

    const uploadedImages = req.files; // All uploaded images

    for (let i = 0; i < inventories.length; i++) {
      const singleInventory = inventories[i];

      // Generate unique transaction no
      async function generateUniqueTransactionNo(length, batchSize = 9) {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        // Helper function to generate a single random code
        function generateRandomCode(length) {
          let result = "";
          for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
          }
          return result;
        }

        let uniqueCode = null;

        while (!uniqueCode) {
          // Step 1: Generate a batch of random codes
          const codesBatch = [];
          for (let i = 0; i < batchSize; i++) {
            codesBatch.push(generateRandomCode(length));
          }

          // Step 2: Check these codes against the database
          const placeholders = codesBatch.map(() => "?").join(",");
          const [existingCodes] = await db.query(
            `SELECT transaction_no FROM inventory WHERE transaction_no IN (${placeholders})`,
            codesBatch
          );

          // Step 3: Filter out codes that already exist in the database
          const existingCodeSet = new Set(
            existingCodes.map((row) => row.transaction_no)
          );

          // Step 4: Find the first code that doesn't exist in the database
          uniqueCode = codesBatch.find((code) => !existingCodeSet.has(code));
        }

        return uniqueCode;
      }

      // Generate unique transaction_no (if not provided)
      const transaction_no = await generateUniqueTransactionNo(9);

      const { name, date, amount, quantity, rate_type } = singleInventory;

      let imagePath = uploadedImages[i]
        ? `/public/images/${uploadedImages[i].filename}`
        : "";

      // Save to database
      const [result] = await db.query(
        "INSERT INTO inventory (user_id, item_name, image, date, amount, quantity, transaction_no, rate_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          user_id,
          name || "",
          imagePath,
          date || "",
          amount || 0,
          quantity || 0,
          transaction_no,
          rate_type,
        ]
      );
    }

    res.status(200).send({
      success: true,
      message: "Inventory inserted successfully!",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error inserting Inventory",
      error: error.message,
    });
  }
};

// Get all Inventory with Pagination & Date Filtering
exports.getAllInventory = async (req, res) => {
  try {
    // Pagination Parameters
    let { page, limit, start_date, end_date } = req.query;
    page = parseInt(page) || 1; // Default page 1
    limit = parseInt(limit) || 10; // Default limit 10
    const offset = (page - 1) * limit;

    // Building the WHERE clause
    let whereClause = "";
    let queryParams = [];

    if (start_date && end_date) {
      whereClause += " WHERE date BETWEEN ? AND ?";
      queryParams.push(start_date, end_date);
    }

    // Get total count with filters
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM inventory ${whereClause}`,
      queryParams
    );

    // Fetch paginated data with filters
    const [data] = await db.query(
      `SELECT inventory.*, rate_type.rate_type as rate_type_name 
       FROM inventory 
       LEFT JOIN rate_type ON inventory.rate_type = rate_type.id 
       ${whereClause} 
       ORDER BY inventory.id DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    res.status(200).send({
      success: true,
      message: "All Inventory",
      pagination: {
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Inventory",
      error: error.message,
    });
  }
};

/// get all Inventory with Pagination & Date Filtering
exports.getAllInventoryForUser = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;

    // Pagination Parameters
    let { page, limit, start_date, end_date } = req.query;

    page = parseInt(page) || 1; // Default page 1
    limit = parseInt(limit) || 10; // Default limit 10
    const offset = (page - 1) * limit;

    // Building the WHERE clause
    let whereClause = "WHERE user_id = ?";
    let queryParams = [user_id];

    if (start_date && end_date) {
      whereClause += " AND date BETWEEN ? AND ?";
      queryParams.push(start_date, end_date);
    }

    // Get total count with filters
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM inventory ${whereClause}`,
      queryParams
    );

    // Fetch paginated data with filters

    const [data] = await db.query(
      `SELECT inventory.*, rate_type.rate_type as rate_type_name 
       FROM inventory 
       LEFT JOIN rate_type ON inventory.rate_type = rate_type.id 
       ${whereClause} 
       ORDER BY inventory.id DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    res.status(200).send({
      success: true,
      message: "All Inventory",
      pagination: {
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      data: data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get All Inventory",
      error: error.message,
    });
  }
};

// get single Inventory
exports.getSingleInventory = async (req, res) => {
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

// update Inventory
exports.updateInventory = async (req, res) => {
  try {
    const id = req.params.id;
    const { item_name, amount, quantity, rate_type, date, transaction_no } =
      req.body;

    const [preData] = await db.query("SELECT * FROM inventory WHERE id", [id]);
    if (!preData || preData.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No inventory found",
      });
    }

    const images = req.file;
    let image = preData[0].image;
    if (images && images.path) {
      image = `/public/images/${images.filename}`;
    }

    // Execute the update query
    const [result] = await db.query(
      "UPDATE inventory SET item_name=?, image=?, amount = ?, quantity=?, rate_type=?, date=?, transaction_no=? WHERE id = ?",
      [
        item_name || preData[0].item_name,
        image,
        amount || preData[0].amount,
        quantity || preData[0].quantity,
        rate_type || preData[0].rate_type,
        date || preData[0].date,
        transaction_no || preData[0].transaction_no,
        id,
      ]
    );

    // Success response
    res.status(200).send({
      success: true,
      message: "Inventory updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Inventory",
      error: error.message,
    });
  }
};

// upload shipping label pdf Inventory
exports.uploadshippingLabelPDF = async (req, res) => {
  try {
    const id = req.params.id;

    const [preData] = await db.query("SELECT * FROM inventory WHERE id", [id]);
    if (!preData || preData.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No inventory found",
      });
    }

    const images = req.file;
    let pdfUpload = preData[0].pdf;
    if (images && images.path) {
      pdfUpload = `/public/files/${images.filename}`;
    }

    // Execute the update query
    await db.query("UPDATE inventory SET pdf=? WHERE id = ?", [pdfUpload, id]);

    // Success response
    res.status(200).send({
      success: true,
      message: "Upload Shipping Lavel PDF successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Rate",
      error: error.message,
    });
  }
};

// update box & dimension Inventory
exports.updateInventoryBoxAndDimension = async (req, res) => {
  try {
    const id = req.params.id;
    const { box, dimension } = req.body;

    const [preData] = await db.query("SELECT * FROM inventory WHERE id", [id]);
    if (!preData || preData.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No inventory found",
      });
    }

    // Execute the update query
    await db.query(
      "UPDATE inventory SET box=?, dimension=?, is_box_di=? WHERE id = ?",
      [box || preData[0].box, dimension || preData[0].dimension, 1, id]
    );

    // Success response
    res.status(200).send({
      success: true,
      message: "Box & Dimention updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Box & Dimention",
      error: error.message,
    });
  }
};

// update Inventory Status
exports.updateInventoryStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const [preData] = await db.query("SELECT * FROM inventory WHERE id", [id]);
    if (!preData || preData.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No inventory found",
      });
    }

    // Execute the update query
    await db.query("UPDATE inventory SET status=? WHERE id = ?", [
      status || preData[0].status,
      id,
    ]);

    // Success response
    res.status(200).send({
      success: true,
      message: "Inventory Status updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Inventory Status",
      error: error.message,
    });
  }
};

// delete Inventory
exports.deleteInventory = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the inventory exists in the database
    const [inventory] = await db.query(`SELECT * FROM inventory WHERE id = ?`, [
      id,
    ]);

    // If inventory not found, return 404
    if (!inventory || inventory.length === 0) {
      return res.status(201).send({
        success: false,
        message: "inventory not found",
      });
    }

    // Proceed to delete the inventory
    const [result] = await db.query(`DELETE FROM inventory WHERE id = ?`, [id]);

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete inventory",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "inventory deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting inventory",
      error: error.message,
    });
  }
};
