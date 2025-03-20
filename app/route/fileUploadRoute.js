const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const fileController = require('./../controller/fileUploadController');

console.log("i'm here at rote");

// Upload a new file
router.post("/", 
    // Second middleware: File upload
    upload.single('profile_pic'),(err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            if (err.field !== 'profile_pic') {
                console.log(err);
                return res.status(400).json({ error: 'only profile_pic works!!' });
            }
            if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                console.log(err);
                return res.status(400).json({ error: 'can send only one file at a time' });
            }
            return res.status(400).json({ error: err.message });
        }
        next();
    },
    // Third middleware: Your file controller
    fileController.uploadFile
);

// Get file by ID
router.get("/:id", fileController.getFileById);

// Delete file by ID
router.delete("/:id", fileController.deleteFile);

// Unallowed Methods for specfic profile_pic
router.all("/:id", fileController.UnallowedMethods);

// Unallowed Methods for all profiles
router.all("/", fileController.UnallowedMethods);

module.exports = router;