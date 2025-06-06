import React from 'react';
import './AppleCard.css';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Подтверждение',
  message = 'Вы уверены, что хотите выполнить это действие?',
  confirmText = 'Да',
  cancelText = 'Отмена',
}) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop modal-backdrop--centered">
      <div className="modal-window modal-window--confirm" style={{width: 300, height: 300, maxWidth: 300, maxHeight: 300, minWidth: 300, minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div style={{fontSize: 20, fontWeight: 600, marginBottom: 18, width: '100%'}}>{title}</div>
        <div style={{fontSize: 15, color: '#666', marginBottom: 32, width: '100%'}}>{message}</div>
        <div style={{display:'flex', gap: 12, width: '100%', justifyContent: 'center', alignItems: 'center', flex: 1}}>
          <button className="apple-create-btn--centered" style={{width: 110, background:'#ff3b30'}} onClick={onConfirm}>{confirmText}</button>
          <button className="apple-create-btn--centered" style={{width: 110, background:'#eee', color:'#222'}} onClick={onClose}>{cancelText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 