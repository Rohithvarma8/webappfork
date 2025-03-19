const fileService = require("./../service/fileUploadService");

console.log("im here at controller")

const fileController = {
    // Upload a new file
    uploadFile: async (req, res) => {
        if (!req.profile_pic) {
            return res.status(400).json({ error: 'No file provided' });
        }

        try {
            const savedFile = await fileService.uploadFile(req.file);
            
            return res.status(201).json({
                file_name: savedFile.file_name,
                id: savedFile.id,
                url: savedFile.url,
                upload_date: savedFile.upload_date
            });
        } catch (error) {
            console.error("File upload error:", error);
            return res.status(500).json({ error: error.message });
        }
    },

    // Get file by ID
    getFileById: async (req, res) => {
        try {
            const profile_pic = await fileService.getFileById(req.params.id);
            
            if (!profile_pic) {
                return res.status(404).json({ error: 'File not found' });
            }
            
            return res.status(200).json({
                file_name: profile_pic.file_name,
                id: profile_pic.id,
                url: profile_pic.url,
                upload_date: profile_pic.upload_date
            });
        } catch (error) {
            console.error("Error fetching file:", error);
            return res.status(500).json({ error: error.message });
        }
    },

    // Delete file by ID
    deleteFile: async (req, res) => {
        try {
            const result = await fileService.deleteFile(req.params.id);
            
            if (result.notFound) {
                return res.status(404).json({ error: 'File not found' });
            }
            
            return res.status(204).end();
        } catch (error) {
            console.error("Error deleting file:", error);
            
            if (error.code === 'NoSuchKey') {
                return res.status(404).json({ error: 'File not found in storage' });
            }
            
            if (error.name === 'UnauthorizedError' || error.code === 'AccessDenied') {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            
            return res.status(500).json({ error: error.message });
        }
    },
    
    // Unallowed methods
    UnallowedMethods: (req,res) => {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
    
};

module.exports = fileController;