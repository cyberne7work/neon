import React from 'react';
import Editor from '@monaco-editor/react';
import useThemeStore from '../../stores/useThemeStore';

interface FileContentDialogProps {
  isOpen: boolean;
  filePath: string;
  content: string;
  onClose: () => void;
}

const FileContentDialog: React.FC<FileContentDialogProps> = ({
  isOpen,
  filePath,
  content,
  onClose,
}) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);

  if (!isOpen) return null;

  // Get file language for Monaco Editor
  const getLanguage = (filePath: string): string => {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const languageMap: { [key: string]: string } = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      css: 'css',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
      sh: 'shell',
      bash: 'shell',
      html: 'html',
      htm: 'html',
      xml: 'xml',
      md: 'markdown',
      sql: 'sql',
      php: 'php',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      cs: 'csharp',
      go: 'go',
      rs: 'rust',
      rb: 'ruby',
      pl: 'perl',
      swift: 'swift',
      kt: 'kotlin',
      scala: 'scala',
      dart: 'dart',
      lua: 'lua'
    };
    return languageMap[ext] || 'plaintext';
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div 
        className="max-w-4xl w-full mx-4 h-[80vh] flex flex-col rounded-lg shadow-xl"
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderColor: 'var(--color-border)',
          borderWidth: '1px'
        }}
      >
        <div 
          className="flex justify-between items-center p-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 
            className="text-xl font-semibold truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {filePath}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:brightness-90"
            style={{ 
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)'
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          <Editor
            height="100%"
            defaultLanguage={getLanguage(filePath)}
            value={content}
            theme={isDarkMode ? 'vs-dark' : 'vs-light'}
            options={{
              readOnly: true,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              scrollbar: {
                vertical: 'visible',
                horizontal: 'visible',
                useShadows: true
              },
              wordWrap: 'on',
              wrappingIndent: 'indent',
              renderWhitespace: 'all',
              trimAutoWhitespace: false,
              useTabStops: true,
              formatOnPaste: true,
              fontFamily: 'monospace',
              renderFinalNewline: 'on',
              smoothScrolling: true,
              cursorBlinking: 'solid',
              cursorStyle: 'line',
              roundedSelection: true,
              automaticLayout: true,
              padding: { top: 8, bottom: 8 }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FileContentDialog;