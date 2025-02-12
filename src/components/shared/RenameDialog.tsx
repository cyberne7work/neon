import { Dialog } from '@headlessui/react';
import { useState } from 'react';

interface RenameDialogProps {
  isOpen: boolean;
  title: string;
  currentName: string;
  onRename: (newName: string) => void;
  onCancel: () => void;
}

export default function RenameDialog({
  isOpen,
  title,
  currentName,
  onRename,
  onCancel,
}: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName);

  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel 
          className="relative mx-auto max-w-sm rounded-lg p-6 shadow-xl w-full"
          style={{
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          <Dialog.Title 
            className="text-lg font-medium mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {title}
          </Dialog.Title>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-2 rounded-md mb-6 transition-colors"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px'
            }}
            placeholder="Enter new name"
            autoFocus
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md transition-colors hover:brightness-95"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (newName && newName !== currentName) {
                  onRename(newName);
                }
              }}
              disabled={!newName || newName === currentName}
              className="px-4 py-2 rounded-md transition-colors hover:brightness-90 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'white'
              }}
            >
              Rename
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}