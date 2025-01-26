const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize Google Cloud Storage
const storage = new Storage({
    keyFilename: path.join(__dirname, '../../alvin-cloud-95cbb836cbde.json'),
});
const bucketName = 'alvin-uploads';
const bucket = storage.bucket(bucketName);

// Multer configuration for handling file uploads (no local storage)
const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage to hold files in buffer
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'), false);
        }
    },
});

// Middleware to upload file directly to GCS
const uploadToGCS = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const originalName = req.file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
    const gcsFolder = 'attendance_photos';
    const gcsFileName = `${gcsFolder}/${Date.now()}-${originalName}`;

    try {
        // Create a writable stream to GCS
        const blob = bucket.file(gcsFileName);
        const blobStream = blob.createWriteStream({
            resumable: false,
            metadata: {
                contentType: req.file.mimetype, // Set the correct content type
            },
        });

        // Pipe the file buffer to the GCS stream
        blobStream.on('error', (err) => {
            console.error('Error uploading to GCS:', err);
            return res.status(500).json({ error: 'Failed to upload file to Google Cloud Storage', details: err.message });
        });

        blobStream.on('finish', () => {
            // Make file publicly accessible (if needed)
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${gcsFileName}`;
            req.file.cloudStoragePublicUrl = publicUrl;
            next();
        });

        blobStream.end(req.file.buffer);
    } catch (err) {
        console.error('Error uploading to GCS:', err);
        return res.status(500).json({ error: 'Failed to upload file to Google Cloud Storage', details: err.message });
    }
};

module.exports = { upload, uploadToGCS };
