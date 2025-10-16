'use client';

import { useState } from 'react';
// Note: pdf-parse works in Node.js environment, not in browser
// For browser-based PDF parsing, we'd need a different library
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';

interface DocumentUploaderProps {
  onContentExtracted: (content: string) => void;
}

export default function DocumentUploader({ onContentExtracted }: DocumentUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError('');

    try {
      const fileType = selectedFile.type;
      let content = '';

      if (fileType === 'application/pdf') {
        // For now, we'll send PDF to backend for processing
        // In a production app, you might use a client-side PDF library
        throw new Error('PDF processing requires backend API. Please use other file types for now.');
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Process DOCX with Mammoth
        const arrayBuffer = await selectedFile.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
      } else if (fileType.startsWith('image/')) {
        // Process image with Tesseract OCR
        const result = await Tesseract.recognize(selectedFile, 'eng');
        content = result.data.text;
      } else if (fileType === 'text/plain') {
        // Process plain text
        content = await selectedFile.text();
      } else {
        throw new Error('Unsupported file type');
      }

      onContentExtracted(content);
    } catch (err) {
      setError(`Error processing file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm text-gray-600">
            Click to upload or drag and drop
          </span>
          <span className="text-xs text-gray-400 mt-1">
            PDF, DOCX, TXT, Images (PNG, JPG)
          </span>
        </label>
      </div>

      {selectedFile && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <span className="text-sm text-gray-700">{selectedFile.name}</span>
          <button
            onClick={processFile}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Process File'}
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}