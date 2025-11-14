// State management
let currentFileId = null;
let currentFileName = null;

// DOM elements
const uploadScreen = document.getElementById('uploadScreen');
const qaScreen = document.getElementById('qaScreen');
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const uploadProgress = document.getElementById('uploadProgress');
const uploadSuccess = document.getElementById('uploadSuccess');
const uploadedFileName = document.getElementById('uploadedFileName');
const startQuestionsBtn = document.getElementById('startQuestionsBtn');
const uploadNewFileBtn = document.getElementById('uploadNewFileBtn');
const documentName = document.getElementById('documentName');
const chatMessages = document.getElementById('chatMessages');
const questionInput = document.getElementById('questionInput');
const sendBtn = document.getElementById('sendBtn');

// File upload handlers
selectFileBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('drag-over');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('drag-over');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileUpload(files[0]);
    }
});

uploadBox.addEventListener('click', () => fileInput.click());

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
}

async function handleFileUpload(file) {
    // Validate file type
    if (!file.type.includes('pdf')) {
        alert('Please upload a PDF file');
        return;
    }

    // Show progress
    uploadBox.classList.add('hidden');
    uploadProgress.classList.remove('hidden');
    uploadSuccess.classList.add('hidden');

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            currentFileId = data.fileId;
            currentFileName = data.fileName;

            // Show success
            uploadProgress.classList.add('hidden');
            uploadSuccess.classList.remove('hidden');
            uploadedFileName.textContent = data.fileName;
        } else {
            throw new Error(data.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Error uploading file: ' + error.message);

        // Reset UI
        uploadBox.classList.remove('hidden');
        uploadProgress.classList.add('hidden');
        uploadSuccess.classList.add('hidden');
    }
}

// Navigate to Q&A screen
startQuestionsBtn.addEventListener('click', () => {
    uploadScreen.classList.remove('active');
    qaScreen.classList.add('active');
    documentName.textContent = currentFileName;
    questionInput.focus();
});

// Navigate back to upload screen
uploadNewFileBtn.addEventListener('click', () => {
    qaScreen.classList.remove('active');
    uploadScreen.classList.add('active');

    // Reset upload screen
    uploadBox.classList.remove('hidden');
    uploadProgress.classList.add('hidden');
    uploadSuccess.classList.add('hidden');
    fileInput.value = '';

    // Clear chat
    chatMessages.innerHTML = '<div class="welcome-message"><p>Your document is ready! Ask me anything about it.</p></div>';
    questionInput.value = '';
});

// Question handling
sendBtn.addEventListener('click', sendQuestion);
questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendQuestion();
    }
});

async function sendQuestion() {
    const question = questionInput.value.trim();

    if (!question) return;

    // Disable input while processing
    questionInput.disabled = true;
    sendBtn.disabled = true;

    // Add user message
    addMessage(question, 'user');
    questionInput.value = '';

    // Add loading message
    const loadingId = addLoadingMessage();

    try {
        const response = await fetch('/api/question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileId: currentFileId,
                question: question
            })
        });

        const data = await response.json();

        // Remove loading message
        removeLoadingMessage(loadingId);

        if (data.success) {
            addMessage(data.answer, 'ai');
        } else {
            throw new Error(data.error || 'Failed to get answer');
        }
    } catch (error) {
        console.error('Question error:', error);
        removeLoadingMessage(loadingId);
        addMessage('Sorry, I encountered an error processing your question. Please try again.', 'ai');
    } finally {
        // Re-enable input
        questionInput.disabled = false;
        sendBtn.disabled = false;
        questionInput.focus();
    }
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addLoadingMessage() {
    const loadingId = 'loading-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message ai loading';
    messageDiv.id = loadingId;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return loadingId;
}

function removeLoadingMessage(loadingId) {
    const loadingMsg = document.getElementById(loadingId);
    if (loadingMsg) {
        loadingMsg.remove();
    }
}
