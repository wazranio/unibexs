'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Modal {
  id: string;
  component: ReactNode;
  isOpen: boolean;
}

interface ModalContextType {
  modals: Modal[];
  openModal: (id: string, component: ReactNode) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modals, setModals] = useState<Modal[]>([]);

  const openModal = (id: string, component: ReactNode) => {
    setModals(prev => [
      ...prev.filter(modal => modal.id !== id),
      { id, component, isOpen: true }
    ]);
  };

  const closeModal = (id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  };

  const closeAllModals = () => {
    setModals([]);
  };

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal, closeAllModals }}>
      {children}
      {/* Render modals */}
      <div className="modal-container">
        {modals.map(modal => (
          <div key={modal.id}>
            {modal.component}
          </div>
        ))}
      </div>
    </ModalContext.Provider>
  );
};

export default ModalProvider;