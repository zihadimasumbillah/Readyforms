import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function LoadingState({ message = "Loading...", size = 'medium' }: LoadingStateProps) {
  const spinnerSize = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
  };

  const textSize = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${spinnerSize[size]} border-2 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin mb-4`}></div>
      <p className={`${textSize[size]} text-muted-foreground`}>{message}</p>
    </div>
  );
}
