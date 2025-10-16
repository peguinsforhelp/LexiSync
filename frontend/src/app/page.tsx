'use client';

import { useState } from 'react';
import DocumentUploader from '@/components/DocumentUploader';
import TextEditor from '@/components/TextEditor';
import SummaryDisplay from '@/components/SummaryDisplay';

export default function Home() {
  const [uploadedContent, setUploadedContent] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  
  // Placeholder for using summary state
  console.log('Current summary:', summary);

  const handleContentExtracted = (content: string) => {
    setUploadedContent(content);
  };

  const handleSummaryGenerated = (summaryText: string) => {
    setSummary(summaryText);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">LexiSync</h1>
          <p className="text-lg text-gray-600">
            Generate summaries using AI and local LLM models
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Document Upload</h2>
              <DocumentUploader onContentExtracted={handleContentExtracted} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Text Editor</h2>
              <TextEditor 
                content={uploadedContent} 
                onContentChange={setUploadedContent}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Generated Summary</h2>
            <SummaryDisplay 
              content={uploadedContent}
              onSummaryGenerated={handleSummaryGenerated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
