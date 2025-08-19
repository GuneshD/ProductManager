import { toast } from 'react-hot-toast';

// Custom warning toast with golden yellow styling
export const showWarning = (message: string) => {
  return toast(message, {
    icon: '⚠️',
    style: {
      background: '#fefce8',
      color: '#a16207',
      border: '1px solid #fde047',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    duration: 4000,
  });
};

// Custom info toast with sky blue styling
export const showInfo = (message: string) => {
  return toast(message, {
    icon: 'ℹ️',
    style: {
      background: '#f0f9ff',
      color: '#0c4a6e',
      border: '1px solid #7dd3fc',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    duration: 4000,
  });
};

// Re-export toast for convenience
export { toast };