import React from 'react';
import { FaBookOpen } from 'react-icons/fa';
import { APP_NAME } from '../config/config';

export default function Logo({ size = 10, showText = false, className = '' }) {
  // size maps to Tailwind h-{n} w-{n} where default 10 => h-10 w-10
  const sz = typeof size === 'number' ? `h-${size} w-${size}` : size;
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sz} rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow`}>
        <FaBookOpen />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{APP_NAME}</span>
          <span className="text-xs text-gray-500">Library Management</span>
        </div>
      )}
    </div>
  );
}
