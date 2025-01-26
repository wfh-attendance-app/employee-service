const express = require("express");
const { upload, uploadToGCS } = require('../middlewares/upload');
const { authenticate } = require('../middlewares/auth');
const { addAttendance } = require("../controllers/attendanceController");

const router = express.Router();
router.post("/attendance", authenticate, upload.single('photo'), uploadToGCS, addAttendance);

module.exports = router;
