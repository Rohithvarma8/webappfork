const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const fileController = require('./../controller/fileUploadController');

console.log("i'm here at rote");

// Upload a new file
router.post("/", upload.single('profile_pic'), fileController.uploadFile);

// Get file by ID
router.get("/:id", fileController.getFileById);

// Delete file by ID
router.delete("/:id", fileController.deleteFile);

// Unallowed Methods for specfic profile_pic
router.all("/:id", fileController.UnallowedMethods);

// Unallowed Methods for all profiles
router.all("/", fileController.UnallowedMethods);

module.exports = router;