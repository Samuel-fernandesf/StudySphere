// src/components/Modal/Modal.js
import React from 'react';
import './Modal.css'; // Vamos criar o CSS abaixo

const Modal = ({ isOpen, type, title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancelar' }) => {
  if (!isOpen) return null;

  // Define cores baseadas no tipo (success, error, warning, info)
  const getHeaderColor = () => {
    switch (type) {
      case 'error': return '#ff4d4f';
      case 'success': return '#52c41a';
      case 'warning': return '#faad14';
      default: return '#1890ff';
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" role="dialog" aria-modal="true">
        <div className="modal-header" style={{ borderLeft: `5px solid ${getHeaderColor()}` }}>
          <h3>{title}</h3>
        </div>
        
        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          {/* Só mostra botão de cancelar se a função onCancel existir (para confirms) */}
          {onCancel && (
            <button onClick={onCancel} className="btn-cancel">
              {cancelText}
            </button>
          )}
          <button 
            onClick={onConfirm} 
            className="btn-confirm"
            style={{ backgroundColor: getHeaderColor() }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
