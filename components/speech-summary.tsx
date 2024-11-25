import React, { useState } from 'react';
import axios from 'axios';

interface SpeechSummaryProps {
  transcript: string;
}

export const SpeechSummary: React.FC<SpeechSummaryProps> = ({ transcript }) => {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    if (!transcript.trim()) {
      alert('No transcript available to summarize.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/summary', { transcript });
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Error generating summary:', error);
      alert('Failed to generate summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Generate Summary Button */}
      <div className="flex justify-start">
        <button
          onClick={generateSummary}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 text-sm"
          disabled={isLoading}
        >
          {isLoading ? 'Summarizing...' : 'Generate Summary'}
        </button>
      </div>

      {/* Summary Box */}
      <div
        className="flex-1 p-3 bg-gray-100 rounded resize-y overflow-auto"
        style={{ minHeight: '100px', maxHeight: '300px', width: '100%' }}
      >
        <p className="font-semibold text-gray-800">Summary:</p>
        <p className="text-gray-900">
          {summary || 'Summary will appear here...'}
        </p>
      </div>
    </div>
  );
};
