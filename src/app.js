require("dotenv").config();
const express = require("express");
const sequelize = require("./config/database");
const attendanceRoutes = require("./routes/attendanceRoutes.js");
const app = express();
const cors = require('cors');

app.use(cors())
app.use(express.json());
app.use("/api/employee", attendanceRoutes);

const PORT = process.env.PORT || 4002;

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Employee Service running on port ${PORT}`));
});
