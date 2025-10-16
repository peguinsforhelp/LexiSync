import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Document from './models/Document';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lexisync';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'LexiSync Backend is running' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to LexiSync API' });
});

// Document processing routes
app.post('/api/documents/upload', (req, res) => {
  res.json({ message: 'Document upload endpoint - to be implemented' });
});

app.post('/api/documents/parse', (req, res) => {
  res.json({ message: 'Document parsing endpoint - to be implemented' });
});

app.post('/api/documents/ocr', (req, res) => {
  res.json({ message: 'OCR processing endpoint - to be implemented' });
});

// Save document
app.post('/api/documents', async (req, res) => {
  try {
    const { title, content, fileType, originalFileName } = req.body;
    
    const document = new Document({
      title: title || 'Untitled Document',
      content,
      fileType,
      originalFileName
    });
    
    await document.save();
    res.status(201).json(document);
  } catch (error) {
    console.error('Error saving document:', error);
    res.status(500).json({ error: 'Failed to save document' });
  }
});

// Get all documents
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get document by ID
app.get('/api/documents/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

app.post('/api/documents/summarize', async (req, res) => {
  const { content, documentId } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  try {
    // Simple extractive summarization (placeholder for LLM integration)
    const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    const wordCount = content.split(/\s+/).length;
    
    let summarySentences: string[] = [];
    
    if (sentences.length > 0) {
      // Always include the first sentence
      summarySentences.push(sentences[0].trim());
      
      // Add sentences containing key words
      const keyWords = ['important', 'key', 'main', 'significant', 'conclusion', 'summary', 'result'];
      const keySentences = sentences.filter((sentence: string) => 
        keyWords.some(word => sentence.toLowerCase().includes(word))
      ).slice(0, 2);
      
      summarySentences = [...summarySentences, ...keySentences];
      
      // Add middle sentence if document is long
      if (sentences.length > 5) {
        const midIndex = Math.floor(sentences.length / 2);
        summarySentences.push(sentences[midIndex].trim());
      }
    }
    
    const summaryText = summarySentences.join('. ') + '.';
    const summary = `Document Summary (${wordCount} words):\n\n${summaryText}`;
    
    // Save summary to document if documentId provided
    if (documentId) {
      await Document.findByIdAndUpdate(documentId, { summary });
    }
    
    res.json({ 
      summary,
      wordCount,
      sentenceCount: sentences.length 
    });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(console.error);