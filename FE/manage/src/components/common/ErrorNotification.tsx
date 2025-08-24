'use client';
import { AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import '@/styles/animationFade.css';

interface ErrorNotificationProps {
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  type?: 'error' | 'warning' | 'info';
}

export default function ErrorNotification({ 
  message, 
  onClose, 
  autoClose = false, 
  autoCloseDelay = 5000,
  type = 'error'
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Wait for animation to complete
  };

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-500',
          title: 'text-red-800',
          message: 'text-red-600'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-500',
          title: 'text-yellow-800',
          message: 'text-yellow-600'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-500',
          title: 'text-blue-800',
          message: 'text-blue-600'
        };
      default:
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-500',
          title: 'text-red-800',
          message: 'text-red-600'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`mb-4 p-3 ${styles.container} border rounded-xl flex items-start gap-3 animate-fadeIn transition-all duration-300 ${
      isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-2'
    }`}>
      <AlertCircle className={`w-4 h-4 ${styles.icon} mt-0.5 flex-shrink-0`} />
      <div className="flex-1">
        <p className={`${styles.title} font-medium text-sm`}>
          {type === 'error' ? 'Có lỗi xảy ra' : 
           type === 'warning' ? 'Cảnh báo' : 'Thông báo'}
        </p>
        <p className={`${styles.message} text-xs`}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={handleClose}
          className={`${styles.icon} hover:opacity-70 transition-opacity flex-shrink-0`}
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
