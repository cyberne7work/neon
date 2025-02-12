import React from 'react';

interface ProgressBarProps {
  progress: number;
  status: string;
}

const ProgressBar = ({ progress, status }: ProgressBarProps) => {
  // Convert negative progress (error state) to 0
  const normalizedProgress = progress < 0 ? 0 : progress;
  
  // Determine color based on status
  let bgColor = 'bg-blue-500';
  if (status === 'error' || status === 'failed') {
    bgColor = 'bg-red-500';
  } else if (status === 'completed') {
    bgColor = 'bg-green-500';
  }

  return (
    <div className="w-full">
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full transition-all duration-500 ${bgColor}`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
      <div className="mt-1 text-sm text-gray-600">
        {status === 'error' || status === 'failed' ? 'Error' : `${normalizedProgress}%`}
      </div>
    </div>
  );
};

export default ProgressBar;