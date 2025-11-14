# Gemini File Search

A demo application showcasing how Google Gemini makes Retrieval Augmented Generation (RAG) incredibly simple and easy to integrate. Upload a PDF and ask questions about it - all RAG complexity is handled by Gemini under the hood!

## Overview

This project demonstrates the power and simplicity of Google's Gemini AI for document question-answering. Simply upload a PDF file, and Gemini automatically handles:
- Document parsing and understanding
- Semantic search and retrieval
- Context-aware question answering
- No complex RAG infrastructure needed!

## Features

- **Simple PDF Upload**: Drag-and-drop or click to upload PDF files
- **Intelligent Q&A**: Ask natural language questions about your document
- **Real-time Responses**: Get instant answers powered by Gemini AI
- **Beautiful UI**: Clean, modern interface with smooth animations
- **Zero RAG Complexity**: Gemini handles all the retrieval and generation

## Prerequisites

- Node.js (v16 or higher)
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/pawneetdev/gemini-file-search.git
cd gemini-file-search
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Add your Gemini API key to the `.env` file:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

## Usage

1. Start the server:
```bash
npm start
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

3. Upload a PDF file using the upload interface

4. Once uploaded, start asking questions about your document!

## Example Questions

Depending on your PDF content, you can ask questions like:
- "What is the main topic of this document?"
- "Summarize the key points in the introduction"
- "What are the conclusions mentioned?"
- "Explain the methodology described in section 3"
- "Find all mentions of [specific term]"

## How It Works

1. **Upload**: The PDF is uploaded to Google's Gemini File API
2. **Processing**: Gemini automatically processes and indexes the document
3. **Question**: Your question is sent to Gemini along with a reference to the uploaded file
4. **Answer**: Gemini retrieves relevant context and generates an accurate answer

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI**: Google Gemini API (@google/generative-ai)
- **File Upload**: Multer

## Project Structure

```
gemini-file-search/
├── public/
│   ├── index.html      # Main HTML structure
│   ├── styles.css      # Styling
│   └── app.js          # Frontend logic
├── uploads/            # Temporary file storage
├── server.js           # Express server & Gemini integration
├── package.json
└── .env.example
```

## API Endpoints

- `POST /api/upload` - Upload a PDF file
- `POST /api/question` - Ask a question about the uploaded document
- `GET /api/health` - Health check endpoint

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
