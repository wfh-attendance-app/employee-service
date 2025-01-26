require("dotenv").config();
const express = require("express");
const sequelize = require("./config/database");
const attendanceRoutes = require("./routes/attendanceRoutes.js");

const app = express();
app.use(express.json());
app.use("/api/employee", attendanceRoutes);

const PORT = process.env.PORT || 4002;

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Employee Service running on port ${PORT}`));
});
