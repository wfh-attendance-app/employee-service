const express = require("express");
const { upload, uploadToGCS } = require('../middlewares/upload');
const { authenticate } = require('../middlewares/auth');
const { getAtendanceStatus, clockIn, clockOut } = require("../controllers/attendanceController");

const router = express.Router();

// router.post("/attendance", authenticate, upload.single('photo'), uploadToGCS, addAttendance);
router.get("/attendance/status", authenticate, getAtendanceStatus);
router.post("/attendance/clock-in", authenticate, upload.single('photo'), uploadToGCS, clockIn);
router.post("/attendance/clock-out", authenticate, clockOut);

module.exports = router;
