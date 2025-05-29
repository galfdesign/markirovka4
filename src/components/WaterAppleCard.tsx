import React, { useState } from 'react';
import './AppleCard.css';
import WaterDetailsModal from './WaterDetailsModal';

interface WaterAppleCardProps {
  number: number;
  onDelete: () => void;
  onEdit: () => void;
  onUpdate: (data: any) => void;
  room: string;
  collector: string;
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
  type?: string;
  device?: string;
  photo?: string;
}

const WaterAppleCard: React.FC<WaterAppleCardProps> = ({
  number,
  onDelete,
  onEdit,
  onUpdate,
  room,
  collector,
  deltaT,
  totalLength,
  supplyLength,
  innerDiameter,
  pipeStep,
  power,
  flowRate,
  resistance,
  regime,
  usefulLength,
  type,
  device,
  photo,
}) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [localDeltaT, setLocalDeltaT] = useState(deltaT || 7);
  const [localTotalLength, setLocalTotalLength] = useState(totalLength || 0);
  const [localSupplyLength, setLocalSupplyLength] = useState(supplyLength || 10);
  const [localInnerDiameter, setLocalInnerDiameter] = useState(innerDiameter || 12);
  const [localPipeStep, setLocalPipeStep] = useState(pipeStep || 150);
  const [localUsefulLength, setLocalUsefulLength] = useState(usefulLength || 70);

  const calculateResults = () => {
    const usefulLength = Math.max(0, localTotalLength - localSupplyLength);
    let wattsPerMeter;
    switch (localPipeStep) {
      case 0.1: wattsPerMeter = 8; break;
      case 0.15: wattsPerMeter = 9; break;
      case 0.2: wattsPerMeter = 10; break;
      case 0.25: wattsPerMeter = 11; break;
      case 0.3: wattsPerMeter = 12; break;
      default: wattsPerMeter = 9;
    }
    let deltaCoef = 1;
    if (localDeltaT >= 10) deltaCoef = 0.8;
    else if (localDeltaT > 5) deltaCoef = 1 - (localDeltaT - 5) * 0.06;
    const power = Math.round(usefulLength * wattsPerMeter * deltaCoef);
    const flowRate = localDeltaT > 0 ? power / (1.16 * localDeltaT * 60) : 0;
    const Q_m3s = flowRate / 1000 / 60;
    const d_m = localInnerDiameter / 1000;
    const A = Math.PI * (d_m / 2) ** 2;
    const rho = 1000, g = 9.81, nu = 1e-6, mu = 0.001;
    if (d_m <= 0 || A === 0 || Q_m3s <= 0) {
      return { power, flowRate, resistance: Infinity, regime: 'ошибка' };
    }
    const v = Q_m3s / A;
    const Re = v * d_m / nu;
    let deltaPUseful, deltaPSupply, resistance, regime;
    if (Re < 2300) {
      const baseDeltaP = (128 * mu * Q_m3s) / (Math.PI * Math.pow(d_m, 4));
      deltaPUseful = baseDeltaP * usefulLength * 1.4;
      deltaPSupply = baseDeltaP * localSupplyLength * 1.2;
      resistance = (deltaPUseful + deltaPSupply) / 1000 + 7;
      regime = `Ламинарный (Re = ${Math.round(Re)})`;
    } else {
      const lambda = 0.03;
      const hfPerMeter = (lambda * Math.pow(v, 2)) / (2 * g * d_m);
      deltaPUseful = rho * g * hfPerMeter * usefulLength * 1.4;
      deltaPSupply = rho * g * hfPerMeter * localSupplyLength * 1.2;
      resistance = (deltaPUseful + deltaPSupply) / 1000 + 7;
      regime = `Турбулентный (Re = ${Math.round(Re)})`;
    }
    return {
      power,
      flowRate,
      resistance,
      regime
    };
  };

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
        <div className="apple-card-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          Выход №{number}
          {type && (
            <span style={{
              display: 'inline-block',
              width: 48,
              height: 16,
              borderRadius: 8,
              marginLeft: 6,
              background: type === 'ХВС' ? '#0071e3' : type === 'ГВС' ? '#ff3b30' : type === 'РГВС' ? '#ffd600' : '#eee',
              border: '1.5px solid #e0e0e6',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
              transition: 'background 0.2s',
            }} title={type} />
          )}
        </div>
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
          <label>Прибор</label>
          <div className="apple-card-value">{device || '-'}</div>
        </div>
        {(supplyLength || innerDiameter) && (
          <div className="apple-card-metrics" style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',gap:12}}>
              <div className="metric-item">
                <span className="metric-label">Длина</span>
                <span className="metric-value">{supplyLength}m</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Диаметр</span>
                <span className="metric-value">{innerDiameter}мм</span>
              </div>
            </div>
            {photo && (
              <>
                <span style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="30" height="30" viewBox="0 0 20 20" fill="none" stroke="#4caf50" strokeWidth="2"><polyline points="5,11 9,15 15,7" fill="none"/></svg>
                </span>
                <img src={photo} alt="Фото" style={{width:50,height:50,objectFit:'cover',borderRadius:6,marginLeft:20,border:'1.5px solid #e0e0e6'}} />
              </>
            )}
          </div>
        )}
      </div>
      <WaterDetailsModal
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
        photo={photo}
      />
    </div>
  );
};

export default WaterAppleCard; 