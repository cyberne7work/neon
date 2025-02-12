import React from 'react';

interface MessageDialogProps {
  isOpen: boolean;
  message: string;
  onClose?: () => void;
}

const MessageDialog: React.FC<MessageDialogProps> = ({
  isOpen,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <p className="text-gray-600 text-center mb-6">{message}</p>
        {onClose && (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageDialog;