const Attendance = require('../models/attendanceModel');

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
