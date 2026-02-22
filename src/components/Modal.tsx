// src/components/Modal.tsx
import React from 'react';
import { useModal } from '../contexts/ModalContext';

const Modal: React.FC = () => {
  const { modalOptions, hideModal } = useModal();

  if (!modalOptions) {
    return null;
  }

  const {
    title,
    body,
    isConfirmation = false,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    onConfirm,
  } = modalOptions;

  const handleConfirm = () => {
    onConfirm?.();
    hideModal();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999]"
      aria-modal="true"
      role="dialog"
      onClick={hideModal} // Fecha ao clicar fora
    >
      <div
        className="bg-dark-card-bg p-6 rounded-lg border-2 border-dark-border text-text-white max-w-sm w-full mx-4 shadow-xl transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()} // Impede de fechar ao clicar dentro
      >
        <h3 className="text-xl font-bold mb-4 text-accent-gold text-center">{title}</h3>
        <div className="text-gray-300 text-center mb-6">{body}</div>
        <div className={`flex gap-3 ${isConfirmation ? 'justify-between' : 'justify-center'}`}>
          {isConfirmation && (
            <button
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-semibold transition-colors"
              onClick={hideModal}
            >
              {cancelText}
            </button>
          )}
          <button
            className={`flex-1 ${isConfirmation ? 'bg-red-600 hover:bg-red-700' : 'bg-accent-gold hover:opacity-90'} text-white py-2 px-4 rounded font-semibold transition-colors`}
            onClick={handleConfirm}
          >
            {isConfirmation ? confirmText : 'OK'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;
