import * as React from 'react';
import { Button } from '@/components/ui/button';

interface RenameNotebookModalProps {
  isOpen: boolean;
  currentTitle: string;
  onClose: () => void;
  onSubmit: (newTitle: string) => void;
  onDelete: () => void; // New prop for delete functionality
}

export function RenameNotebookModal({
  isOpen,
  currentTitle,
  onClose,
  onSubmit,
  onDelete,
}: RenameNotebookModalProps) {
  const [newTitle, setNewTitle] = React.useState(currentTitle);

  React.useEffect(() => {
    if (isOpen) {
      setNewTitle(currentTitle); // Reset title when modal opens
    }
  }, [isOpen, currentTitle]);

  const handleSave = () => {
    if (newTitle.trim() !== '') {
      onSubmit(newTitle.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-md w-96">
        <h3 className="text-lg font-semibold mb-4">Rename Notebook</h3>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full mb-4 p-2 border border-gray-300 rounded"
        />
        <div className="flex gap-2 justify-between">
          <Button variant="outline" onClick={onDelete} className="bg-red-500 text-white">
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-500 text-white">
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
