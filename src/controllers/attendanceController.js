const { Op } = require("sequelize"); // Import Sequelize operators for querying
const Attendance = require('../models/attendanceModel');

exports.getAtendanceStatus = async (req, res) => {
    try {
        const user_id = req.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of the day

        // Find today's attendance record
        const todayRecord = await Attendance.findOne({
            where: {
                user_id,
                clock_in: { [Op.gte]: today }, // Ensures only today's record is fetched
            },
            order: [["clock_in", "DESC"]],
        });

        if (!todayRecord) {
            return res.status(200).json({ status: "not_recorded" });
        }

        if (todayRecord.clock_out) {
            return res.status(200).json({
                status: "clocked_out",
                clock_in_time: todayRecord.clock_in,
                clock_out_time: todayRecord.clock_out,
            });
        }

        return res.status(200).json({
            status: "clocked_in",
            clock_in_time: todayRecord.clock_in,
        });
    } catch (err) {
        console.error("Error fetching attendance status:", err);
        res.status(500).json({ error: "Failed to fetch attendance status" });
    }
};

exports.clockIn = async (req, res) => {
    try {
        // Retrieve user_id from JWT payload
        const user_id = req.user.id;
        const photo_url = req.file?.cloudStoragePublicUrl; // Use the public URL from uploadToGCS

        // Validate photo (if required)
        if (!photo_url) {
            return res.status(400).json({ error: 'Photo URL is required for clock-in' });
        }

        // Check if the user has already clocked in and not clocked out
        const existingRecord = await Attendance.findOne({
            where: { user_id, clock_out: null },
        });

        if (existingRecord) {
            return res.status(400).json({ error: 'You are already clocked in' });
        }

        // Create a new attendance record with clock-in time
        const attendance = await Attendance.create({
            user_id,
            photo_url,
            clock_in: new Date(), // Record server time for clock-in
        });

        res.status(201).json({
            message: 'Clocked in successfully',
            attendance,
        });
    } catch (err) {
        console.error('Error during clock-in:', err); // Log error for debugging
        res.status(500).json({ error: 'Failed to clock in', details: err.message });
    }
};

exports.clockOut = async (req, res) => {
    try {
        // Retrieve user_id from JWT payload
        const user_id = req.user.id;

        // Find the user's most recent clock-in record without a clock-out
        const attendance = await Attendance.findOne({
            where: { user_id, clock_out: null },
        });

        if (!attendance) {
            return res.status(400).json({ error: 'No open clock-in record found' });
        }

        // Update the record with clock-out time
        attendance.clock_out = new Date(); // Record server time for clock-out

        // Optionally calculate and store the duration in hours
        const duration =
            (new Date(attendance.clock_out) - new Date(attendance.clock_in)) /
            (1000 * 60 * 60); // Calculate duration in hours

        await attendance.save();

        res.status(200).json({
            message: 'Clocked out successfully',
            attendance: {
                ...attendance.toJSON(),
                duration: duration.toFixed(2), // Include duration in response
            },
        });
    } catch (err) {
        console.error('Error during clock-out:', err); // Log error for debugging
        res.status(500).json({ error: 'Failed to clock out', details: err.message });
    }
};

exports.addAttendance = async (req, res) => {
    try {
        // Retrieve user_id from JWT payload
        const user_id = req.user.id;
        const photo_url = req.file?.cloudStoragePublicUrl; // Use the public URL from uploadToGCS

        if (!photo_url) {
            return res.status(400).json({ error: 'Photo URL is required' });
        }

        // Save attendance record to database
        const attendance = await Attendance.create({
            user_id,
            photo_url,
        });

        res.status(201).json({
            message: 'Attendance recorded successfully',
            attendance,
        });
    } catch (err) {
        console.error('Error saving attendance:', err); // Log error for debugging
        res.status(500).json({ error: 'Failed to record attendance', details: err.message });
    }
};
