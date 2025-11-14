const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

// Store uploaded file info (in production, use a database)
let uploadedFiles = {};

// Upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploading file to Gemini:', req.file.originalname);

    // Upload file to Gemini
    const uploadResult = await fileManager.uploadFile(req.file.path, {
      mimeType: req.file.mimetype,
      displayName: req.file.originalname,
    });

    console.log('File uploaded to Gemini:', uploadResult.file.uri);

    // Store file info
    const fileId = uploadResult.file.name;
    uploadedFiles[fileId] = {
      name: req.file.originalname,
      uri: uploadResult.file.uri,
      mimeType: uploadResult.file.mimeType,
    };

    res.json({
      success: true,
      fileId: fileId,
      fileName: req.file.originalname,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Question endpoint
app.post('/api/question', async (req, res) => {
  try {
    const { fileId, question } = req.body;

    if (!fileId || !question) {
      return res.status(400).json({ error: 'Missing fileId or question' });
    }

    const fileInfo = uploadedFiles[fileId];
    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found' });
    }

    console.log('Processing question:', question);

    // Get the file from Gemini
    const file = await fileManager.getFile(fileId);

    // Use Gemini model with file context
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri
        }
      },
      { text: question }
    ]);

    const response = await result.response;
    const answer = response.text();

    res.json({
      success: true,
      answer: answer,
      question: question
    });

  } catch (error) {
    console.error('Question error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
