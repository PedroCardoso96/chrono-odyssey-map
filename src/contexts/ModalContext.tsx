// src/contexts/ModalContext.tsx
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

// Define as opções que nosso modal pode receber
interface ModalOptions {
  title: string;
  body: ReactNode;
  isConfirmation?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// Define o que o nosso contexto irá fornecer
interface ModalContextType {
  showModal: (options: ModalOptions) => void;
  hideModal: () => void;
  modalOptions: ModalOptions | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// O provedor que irá envolver nossa aplicação
export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modalOptions, setModalOptions] = useState<ModalOptions | null>(null);

  const showModal = useCallback((options: ModalOptions) => {
    setModalOptions(options);
  }, []);

  const hideModal = useCallback(() => {
    if (modalOptions?.onCancel) {
      modalOptions.onCancel();
    }
    setModalOptions(null);
  }, [modalOptions]);

  const value = { showModal, hideModal, modalOptions };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
