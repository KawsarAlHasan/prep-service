// id, user_id, inventory_id, quantity, reason, product_conditions, amount, date, transaction_no, status

const db = require("../config/db");

// Create return Inventory
exports.createReturnInventory = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;
    const returnInventories = JSON.parse(req.body.returnInventories); // Parse JSON string

    if (!returnInventories || !Array.isArray(returnInventories)) {
      return res.status(400).send({
        success: false,
        message: "Invalid returnInventories data",
      });
    }

    for (let i = 0; i < returnInventories.length; i++) {
      const singleInventory = returnInventories[i];

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

      const {
        inventory_id,
        quantity,
        reason,
        product_conditions,
        amount,
        date,
      } = singleInventory;

      //   Save to database
      const [result] = await db.query(
        "INSERT INTO products_return (user_id, inventory_id, quantity, reason, product_conditions, amount, date, transaction_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          user_id,
          inventory_id || 0,
          quantity || 0,
          reason || "",
          product_conditions || "",
          amount || 0,
          date || "",
          transaction_no,
        ]
      );
    }

    res.status(200).send({
      success: true,
      message: "Return Inventory inserted successfully!",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error inserting Return Inventory",
      error: error.message,
    });
  }
};

/// get all Inventory with Pagination & Date Filtering
exports.getMyReturnProducts = async (req, res) => {
  try {
    const user_id = req.decodedUser.id;

    // Pagination Parameters
    let { page, limit, start_date, end_date } = req.query;

    page = parseInt(page) || 1; // Default page 1
    limit = parseInt(limit) || 10; // Default limit 10
    const offset = (page - 1) * limit;

    // Building the WHERE clause
    let whereClause = "WHERE products_return.user_id = ?";
    let queryParams = [user_id];

    if (start_date && end_date) {
      whereClause += " AND products_return.date BETWEEN ? AND ?";
      queryParams.push(start_date, end_date);
    }

    // Get total count with filters
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM products_return ${whereClause}`,
      queryParams
    );

    // Fetch paginated data with filters
    const [data] = await db.query(
      `SELECT products_return.*, inventory.item_name, rate_type.rate_type as rate_type_name
       FROM products_return 
       LEFT JOIN inventory ON products_return.inventory_id = inventory.id
       LEFT JOIN rate_type ON inventory.rate_type = rate_type.id 
       ${whereClause} 
       ORDER BY products_return.id DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    res.status(200).send({
      success: true,
      message: "All products_return",
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
      message: "Error in Get All products_return",
      error: error.message,
    });
  }
};

// Get all return Inventory with Pagination & Date Filtering
exports.getAllReturnInventory = async (req, res) => {
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
      whereClause += " WHERE products_return.date BETWEEN ? AND ?";
      queryParams.push(start_date, end_date);
    }

    // Get total count with filters
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM products_return ${whereClause}`,
      queryParams
    );

    // Fetch paginated data with filters
    const [data] = await db.query(
      // `SELECT inventory.*, rate_type.rate_type as rate_type_name, users.first_name, users.last_name, users.email
      `SELECT products_return.*, inventory.item_name, rate_type.rate_type as rate_type_name
        FROM products_return 
        LEFT JOIN inventory ON products_return.inventory_id = inventory.id
        LEFT JOIN rate_type ON inventory.rate_type = rate_type.id 
        LEFT JOIN users ON products_return.user_id = users.id 
       ${whereClause} 
       ORDER BY products_return.id DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    res.status(200).send({
      success: true,
      message: "All Return Inventory",
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
      message: "Error in Get All Return Inventory",
      error: error.message,
    });
  }
};

// get single products_return
exports.getSingleProductsReturn = async (req, res) => {
  try {
    const id = req.params.id;
    const [data] = await db.query("SELECT * FROM products_return WHERE id", [
      id,
    ]);
    if (!data || data.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No products_return found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Single products_return",
      data,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error in Get Single products_return",
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

// update Products Return Status
exports.updateReturnInventoryStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    const [preData] = await db.query("SELECT * FROM products_return WHERE id", [
      id,
    ]);
    if (!preData || preData.length == 0) {
      return res.status(200).send({
        success: true,
        message: "No products_return found",
      });
    }

    // Execute the update query
    await db.query("UPDATE products_return SET status=? WHERE id = ?", [
      status || preData[0].status,
      id,
    ]);

    // Success response
    res.status(200).send({
      success: true,
      message: "Products Return Status updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error updating Products Return Status",
      error: error.message,
    });
  }
};

// delete Products Return
exports.deleteProductsReturn = async (req, res) => {
  try {
    const id = req.params.id;

    // Check if the products_return exists in the database
    const [products_return] = await db.query(
      `SELECT * FROM products_return WHERE id = ?`,
      [id]
    );

    // If products_return not found, return 404
    if (!products_return || products_return.length === 0) {
      return res.status(201).send({
        success: false,
        message: "products_return not found",
      });
    }

    // Proceed to delete the products_return
    const [result] = await db.query(
      `DELETE FROM products_return WHERE id = ?`,
      [id]
    );

    // Check if deletion was successful
    if (result.affectedRows === 0) {
      return res.status(500).send({
        success: false,
        message: "Failed to delete products_return",
      });
    }

    // Send success response
    res.status(200).send({
      success: true,
      message: "products_return deleted successfully",
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error deleting products_return",
      error: error.message,
    });
  }
};
