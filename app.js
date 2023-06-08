require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
require("./db/connection");
const router = require("./routes/userRoutes");
const PORT = process.env.PORT || 3010;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("./uploads"));
app.use("/files", express.static("./public/files"));
app.use(router);

app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
});
