import React, { useState } from 'react';

export function ShareNotebookModal({
  isOpen,
  onClose,
  onShare,
}: {
  isOpen: boolean;
  onClose: () => void;
  onShare: (email: string) => void;
}) {
  const [email, setEmail] = useState('');

  const handleShare = () => {
    if (!email.trim()) {
      alert('Please enter a valid email address.');
      return;
    }
    onShare(email.trim());
    setEmail(''); // Clear input after sharing
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4">Share Notebook</h2>
        <input
          type="email"
          className="w-full p-2 border border-gray-300 rounded mb-4"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleShare}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
