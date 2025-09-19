// Implemented a generic ConfirmationModal for user action confirmations.
import React from 'react';

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonClass?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  confirmText,
  onConfirm,
  onCancel,
  confirmButtonClass = 'bg-red-600 hover:bg-red-500',
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-sm m-4 text-white shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-gray-300 my-4">{message}</p>
        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-5 rounded-full text-sm transition">
            Cancel
          </button>
          <button onClick={onConfirm} className={`${confirmButtonClass} text-white font-semibold py-2 px-5 rounded-full text-sm transition`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
