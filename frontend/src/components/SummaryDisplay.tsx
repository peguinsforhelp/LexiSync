'use client';

import { useState } from 'react';
import axios from 'axios';

interface SummaryDisplayProps {
  content: string;
  onSummaryGenerated: (summary: string) => void;
}

export default function SummaryDisplay({ content, onSummaryGenerated }: SummaryDisplayProps) {
  const [summary, setSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');

  const generateSummary = async () => {
    if (!content.trim()) {
      setError('Please provide content to summarize');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      // For now, we'll create a simple client-side summary
      // In a real implementation, this would call your LLM API
      const response = await axios.post(`${apiUrl}/documents/summarize`, {
        content: content
      });
      
      const generatedSummary = response.data.summary || createSimpleSummary(content);
      setSummary(generatedSummary);
      onSummaryGenerated(generatedSummary);
    } catch (err) {
      // Fallback to simple summary if API is not available
      console.warn('API not available, using simple summary:', err);
      const fallbackSummary = createSimpleSummary(content);
      setSummary(fallbackSummary);
      onSummaryGenerated(fallbackSummary);
    } finally {
      setIsGenerating(false);
    }
  };

  const createSimpleSummary = (text: string): string => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const wordCount = text.split(/\s+/).length;
    
    // Simple extractive summary - take first and key sentences
    let summarySentences: string[] = [];
    
    if (sentences.length > 0) {
      // Always include the first sentence
      summarySentences.push(sentences[0].trim());
      
      // Add sentences containing key words
      const keyWords = ['important', 'key', 'main', 'significant', 'conclusion', 'summary', 'result'];
      const keySentences = sentences.filter(sentence => 
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
    
    return `Document Summary (${wordCount} words):\n\n${summaryText}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          onClick={generateSummary}
          disabled={isGenerating || !content.trim()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Summary'}
        </button>
        
        {summary && (
          <button
            onClick={copyToClipboard}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Copy
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {summary && (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <pre className="whitespace-pre-wrap text-sm text-gray-800">{summary}</pre>
        </div>
      )}

      {!summary && !isGenerating && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">
            Upload a document or enter text to generate a summary
          </p>
        </div>
      )}
    </div>
  );
}