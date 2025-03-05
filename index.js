const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const cors = require("cors");
const mySqlPool = require("./config/db");
const path = require("path");
dotenv.config();

const app = express();

// Middleware
const globalCorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};
app.use(cors(globalCorsOptions));
app.options("*", cors(globalCorsOptions));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use("/public", express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/v1/admin", require("./router/adminRoute"));
app.use("/api/v1/user", require("./router/userRoute"));
app.use("/api/v1/rate", require("./router/rateRout"));
app.use("/api/v1/inventory", require("./router/inventoryRoute"));

mySqlPool
  .query("SELECT 1")
  .then(() => {
    console.log("MYSQL DB Connected");
  })
  .catch((error) => {
    console.log(error);
  });

// Default Route
app.get("/", (req, res) => {
  res.status(200).send("Prep services server is working");
});

// 404 Not Found Middleware
app.use("*", (req, res, next) => {
  res.status(404).json({
    error: "You have hit the wrong route",
  });
});

// Server Start
const port = process.env.PORT || 7000;

app.listen(port, () => {
  console.log(`Prep services server is running on port ${port}`);
});

// box dimantion pdf
