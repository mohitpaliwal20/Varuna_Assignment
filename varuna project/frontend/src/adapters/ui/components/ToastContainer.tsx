import React from 'react';
import Toast, { ToastType } from './Toast';

interface ToastState {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastState[];
  onClose: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md w-full sm:w-96 pointer-events-none">
      <div className="space-y-2 pointer-events-auto">
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            style={{ 
              transform: `translateY(${index * 4}px)`,
              transition: 'transform 0.3s ease-out'
            }}
          >
            <Toast
              type={toast.type}
              message={toast.message}
              onClose={() => onClose(toast.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
