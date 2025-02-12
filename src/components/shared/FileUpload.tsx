import { useCallback, useState, useRef } from 'react';
import { notify } from '../../utils/notifications';

interface FileUploadProps {
  accept: string;
  type: 'image' | 'sound';
  onUploadComplete: (url: string, filename: string) => void;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  type,
  onUploadComplete,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith(type === 'image' ? 'image/' : 'audio/')) {
      notify.error(`Invalid ${type} file type`);
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      notify.error(`File size must be less than 10MB`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/assets/${type}/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${type}`);
      }

      const data = await response.json();
      notify.assetUploaded(type);
      onUploadComplete(data.url, data.filename);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      notify.error(`Failed to upload ${type}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        await uploadFile(file);
      }
    },
    [type]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        await uploadFile(file);
      }
    },
    [type]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative ${className}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        onClick={handleClick}
        className={`
          cursor-pointer border-2 border-dashed rounded-lg p-6
          flex flex-col items-center justify-center space-y-2
          transition-colors duration-200
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {isUploading ? (
          <div className="w-full space-y-2">
            <div className="text-sm text-center text-gray-500">
              Uploading... {Math.round(uploadProgress)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="text-4xl">
              {type === 'image' ? '🖼️' : '🔊'}
            </div>
            <div className="text-sm text-center text-gray-500">
              Drop {type} here or click to upload
            </div>
            <div className="text-xs text-gray-400">
              Maximum file size: 10MB
            </div>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;
