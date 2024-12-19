const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser")

// Load env vars
dotenv.config({ path: "./config/config.env" });

// Connect to database
connectDB();

// Route files
const hospitals = require("./routes/hospitals");
const auth = require("./routes/auth");

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser())

app.use("/api/v1/auth", auth);
app.use("/api/v1/hospitals", hospitals);

const PORT = process.env.PORT;

const server = app.listen(
  PORT,
  console.log("Server running in", process.env.NODE_ENV, "mode on port", PORT)
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
