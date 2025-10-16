# LexiSync

A full-stack document processing and summarization application built with Next.js and Express.js.

## Features

- **Document Upload & Processing**: Support for PDF, DOCX, TXT, and image files
- **OCR Processing**: Extract text from images using Tesseract.js
- **Rich Text Editing**: TipTap-powered WYSIWYG editor with formatting options
- **AI-Powered Summarization**: Generate intelligent summaries of document content
- **Modern UI**: Responsive design built with Tailwind CSS
- **Authentication**: NextAuth.js integration for secure user management
- **Database Integration**: MongoDB with Mongoose for data persistence
- **Security**: Rate limiting, input validation, and XSS protection

## Tech Stack

### Frontend (Next.js 15 + TypeScript)
- **Framework**: Next.js 15 with TypeScript
- **UI Components**: Custom components with Tailwind CSS
- **Text Editor**: TipTap for rich text editing
- **Document Processing**: 
  - Mammoth.js for Word documents
  - Tesseract.js for OCR on images
  - PDF-parse for PDF processing (backend)
- **Authentication**: NextAuth.js
- **HTTP Client**: Axios

### Backend (Express.js + TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Security**: 
  - CORS protection
  - Rate limiting with express-rate-limit
  - Input validation and sanitization
- **Development**: Nodemon for hot reload

## Project Structure

```
LexiSync/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router
│   │   └── components/      # React components
│   └── package.json
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── models/          # MongoDB models
│   │   └── index.ts         # Main server file
│   └── package.json
└── package.json            # Root package.json for scripts
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (optional - app runs without database)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LexiSync
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   **Backend** (`backend/.env`):
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/lexisync
   NODE_ENV=development
   ```
   
   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```
   
   This will start both frontend (http://localhost:3000) and backend (http://localhost:3001) concurrently.

## Available Scripts

### Root level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both frontend and backend for production
- `npm run install:all` - Install dependencies for all projects

### Frontend (`cd frontend`)
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Backend (`cd backend`)
- `npm run dev` - Start Express server with nodemon
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/documents` - Get all documents
- `POST /api/documents` - Save a new document
- `GET /api/documents/:id` - Get document by ID
- `POST /api/documents/summarize` - Generate summary from content

## Usage

1. **Upload Documents**: Drag and drop or click to upload documents (TXT, DOCX, images)
2. **Edit Text**: Use the rich text editor to modify content with formatting options
3. **Generate Summaries**: Click "Generate Summary" to create AI-powered summaries
4. **Copy Results**: Use the copy button to share generated summaries

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All user inputs are validated and sanitized
- **XSS Protection**: Built-in protection against cross-site scripting
- **MongoDB Injection Prevention**: ObjectId validation prevents NoSQL injection

## Development

The application is designed for easy development with:
- Hot reload for both frontend and backend
- TypeScript for type safety
- ESLint for code quality
- Modular component architecture

## License

This project is licensed under the ISC License.
