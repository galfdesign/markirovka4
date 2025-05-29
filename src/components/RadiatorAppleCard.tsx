import React, { useState } from 'react';
import './AppleCard.css';
import RadiatorDetailsModal from './RadiatorDetailsModal';

interface RadiatorAppleCardProps {
  number: number;
  onDelete: () => void;
  onEdit: () => void;
  onUpdate: (data: any) => void;
  room: string;
  collector: string;
  placement?: string;
  deltaT?: number;
  totalLength?: number;
  supplyLength?: number;
  innerDiameter?: number;
  pipeStep?: number;
  power?: number;
  flowRate?: number;
  resistance?: number;
  regime?: string;
  usefulLength?: number;
}

const RadiatorAppleCard: React.FC<RadiatorAppleCardProps> = ({
  number,
  onDelete,
  onEdit,
  onUpdate,
  room,
  collector,
  placement,
  deltaT,
  totalLength,
  supplyLength,
  innerDiameter,
  pipeStep,
  power,
  flowRate,
  resistance,
  regime,
  usefulLength
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [localDeltaT, setLocalDeltaT] = useState(deltaT || 7);
  const [localTotalLength, setLocalTotalLength] = useState(totalLength || 0);
  const [localSupplyLength, setLocalSupplyLength] = useState(supplyLength || 10);
  const [localInnerDiameter, setLocalInnerDiameter] = useState(innerDiameter || 12);
  const [localPipeStep, setLocalPipeStep] = useState(pipeStep || 150);
  const [localUsefulLength, setLocalUsefulLength] = useState(usefulLength || 70);

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDetailsModal(true);
  };

  const handleSaveDetails = (data: any) => {
    onUpdate(data);
    setLocalDeltaT(data.deltaT);
    setLocalTotalLength(data.totalLength);
    setLocalSupplyLength(data.supplyLength);
    setLocalInnerDiameter(data.innerDiameter);
    setLocalPipeStep(data.pipeStep);
    setLocalUsefulLength(data.usefulLength);
    setShowDetailsModal(false);
  };

  return (
    <div className="apple-card" onClick={onEdit}>
      <div className="apple-card-header">
        <div className="apple-card-title">Радиатор №{number}</div>
        <div className="apple-card-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className="apple-card-details"
            onClick={handleDetailsClick}
            title="расш.данные"
            style={{
              padding: '2px 8px',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #1976d2',
              borderRadius: 16,
              background: '#f7faff',
              color: '#1976d2',
              fontWeight: 500,
              fontSize: 12,
              gap: 4,
              transition: 'background 0.15s, border 0.15s',
              cursor: 'pointer',
              height: 26,
              minWidth: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 2}}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            расш.данные
          </button>
          <button
            className="apple-card-delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="Удалить"
            style={{
              padding: 0,
              margin: 0,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: '#fff',
              border: '2px solid #ff3b30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              cursor: 'pointer',
              transition: 'background 0.15s, border 0.15s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2">
              <rect x="5" y="6" width="14" height="12" rx="2" fill="#fff" stroke="#ff3b30" strokeWidth="2"/>
              <path d="M3 6h18" stroke="#ff3b30" strokeWidth="2"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#ff3b30" strokeWidth="2"/>
              <line x1="10" y1="11" x2="10" y2="17" stroke="#ff3b30" strokeWidth="2"/>
              <line x1="14" y1="11" x2="14" y2="17" stroke="#ff3b30" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="apple-card-content">
        <div className="apple-card-field">
          <label>Помещение</label>
          <div className="apple-card-value">{room || '-'}</div>
        </div>
        <div className="apple-card-field">
          <label>Размещение</label>
          <div className="apple-card-value">{placement || '-'}</div>
        </div>
        {(deltaT || totalLength || power || flowRate || resistance || regime || usefulLength) && (
          <div className="apple-card-metrics">
            <div className="metric-item">
              <span className="metric-label">Мощность</span>
              <span className="metric-value">{power?.toFixed(1)}Вт</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">ΔT</span>
              <span className="metric-value">{deltaT !== undefined ? deltaT.toFixed(1) + '°C' : '-'}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Длина</span>
              <span className="metric-value">{supplyLength !== undefined ? supplyLength.toFixed(1) + ' м' : '-'}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Сопротивление</span>
              <span className="metric-value">{resistance !== undefined ? resistance.toFixed(2) + ' кПа' : '-'}</span>
            </div>
          </div>
        )}
      </div>
      <RadiatorDetailsModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onSave={handleSaveDetails}
        number={number}
        deltaT={localDeltaT}
        setDeltaT={setLocalDeltaT}
        supplyLength={localSupplyLength}
        setSupplyLength={setLocalSupplyLength}
        innerDiameter={localInnerDiameter}
        setInnerDiameter={setLocalInnerDiameter}
        pipeStep={localPipeStep}
        setPipeStep={setLocalPipeStep}
        usefulLength={localUsefulLength}
        setUsefulLength={setLocalUsefulLength}
      />
    </div>
  );
};

export default RadiatorAppleCard; 