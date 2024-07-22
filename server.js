// server.js
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.static(path.join(__dirname, "public")))
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
    }
});


app.post('/upload', upload.single('photo'), async (req, res) => {
    console.log("Upload request");
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    try {
        // Save the file if it passes the checks
        const fileBuffer = req.file.buffer
        const image = (sharp(fileBuffer))
        const metadata = await image.metadata()
        // console.log(metadata);
        const { width, height, density } = metadata;
        const isSizeValid = (fileBuffer.length <= 1024 * 1024 * 5); // File size <= 5MB
        const isResolutionValid = (width === 1920 && height === 1080); // Example resolution check
        const isDpiValid = (density >= 50); // Example DPI check
        const isImageValid = isSizeValid && isResolutionValid && isDpiValid;
        // console.log(width);
        const imageProperties = {
            "width" : width,
            "height" : height,
            "size": fileBuffer.length/(1024*1024).toFixed(3),
            "dpi": density,
            isSizeValid,
            isResolutionValid,
            isDpiValid
        };
        // console.log(imageProperties);
        if (isImageValid) {
            const outputPath = `uploads/${req.file.originalname}`;
            fs.writeFileSync(outputPath, req.file.buffer);
            res.json({message : 'File uploaded and validated successfully', imageProperties});
        } else {
            console.log("Invalid Image");
            res.status(400).json({error :'File does not meet the required specifications', imageProperties});
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error processing the file');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});