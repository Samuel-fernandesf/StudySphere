// src/context/ModalContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/Modal/Modal';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'info', // info, success, warning, error
    title: '',
    message: '',
    confirmText: 'OK',
    cancelText: 'Cancelar',
    onConfirm: () => {},
    onCancel: null // null indica que é apenas um alert (sem botão cancelar)
  });

  // Função para fechar o modal
  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Exibe um alerta simples (substituto do alert())
   */
  const showAlert = useCallback((message, type = 'info', title = 'Atenção') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type,
        title,
        message,
        confirmText: 'OK',
        onCancel: null, // Esconde botão cancelar
        onConfirm: () => {
          closeModal();
          resolve(true);
        }
      });
    });
  }, [closeModal]);

  /**
   * Exibe confirmação (substituto do window.confirm())
   * Retorna true se confirmado, false se cancelado
   */
  const showConfirm = useCallback((message, title = 'Confirmação', type = 'warning') => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type,
        title,
        message,
        confirmText: 'Sim',
        cancelText: 'Não',
        onConfirm: () => {
          closeModal();
          resolve(true);
        },
        onCancel: () => {
          closeModal();
          resolve(false);
        }
      });
    });
  }, [closeModal]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {/* O Modal é renderizado aqui, globalmente */}
      <Modal 
        {...modalState} 
      />
    </ModalContext.Provider>
  );
};

// Hook personalizado para usar o modal
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal deve ser usado dentro de um ModalProvider');
  }
  return context;
};
