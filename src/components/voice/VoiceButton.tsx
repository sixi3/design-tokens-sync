import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface VoiceButtonProps {
  state: VoiceState;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  state,
  onClick,
  size = 'md',
  className,
}) => {
  const baseClasses = 'rounded-full flex items-center justify-center transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const stateClasses = {
    idle: 'bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm focus:ring-gray-500',
    listening: 'bg-primary-500 text-white shadow-lg animate-pulse focus:ring-primary-500',
    processing: 'bg-secondary-500 text-gray-900 shadow-md animate-spin focus:ring-secondary-500',
    speaking: 'bg-primary-500 text-white shadow-lg animate-bounce focus:ring-primary-500',
    error: 'bg-red-500 text-white shadow-sm animate-pulse focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const buttonClasses = clsx(
    baseClasses,
    stateClasses[state],
    sizeClasses[size],
    className
  );

  const iconClasses = iconSizeClasses[size];

  const getIcon = () => {
    switch (state) {
      case 'idle':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        );
      case 'listening':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        );
      case 'processing':
        return (
          <svg className={iconClasses} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'speaking':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.824L4.5 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.5l3.883-3.824zM15 8a3 3 0 000 6V8z" clipRule="evenodd" />
            <path d="M17 6a5 5 0 000 8V6z" />
          </svg>
        );
      case 'error':
        return (
          <svg className={iconClasses} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={buttonClasses}
      onClick={onClick}
      aria-label={`Voice ${state}`}
    >
      {getIcon()}
    </motion.button>
  );
};

export default VoiceButton; 