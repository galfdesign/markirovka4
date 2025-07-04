import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './AppleCard.css';

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  number: number;
  deltaT: number;
  setDeltaT: (v: number) => void;
  supplyLength: number;
  setSupplyLength: (v: number) => void;
  innerDiameter: number;
  setInnerDiameter: (v: number) => void;
  pipeStep: number;
  setPipeStep: (v: number) => void;
  usefulLength: number;
  setUsefulLength: (v: number) => void;
}

const DetailsModal: React.FC<DetailsModalProps> = ({
  open,
  onClose,
  onSave,
  number,
  deltaT,
  setDeltaT,
  supplyLength,
  setSupplyLength,
  innerDiameter,
  setInnerDiameter,
  pipeStep,
  setPipeStep,
  usefulLength,
  setUsefulLength
}) => {
  const totalLength = supplyLength + usefulLength;

  // Значение по умолчанию для pipeStep — 150 мм
  const actualPipeStep = pipeStep || 150;

  // Расчет по логике пользователя
  const calculateResults = () => {
    const diameter = innerDiameter;
    // шаг укладки в мм → Вт/м
    let wattsPerMeter;
    switch (actualPipeStep) {
      case 100: wattsPerMeter = 8; break;
      case 150: wattsPerMeter = 9; break;
      case 200: wattsPerMeter = 10; break;
      case 250: wattsPerMeter = 11; break;
      case 300: wattsPerMeter = 12; break;
      default: wattsPerMeter = 9;
    }
    let deltaCoef = 1;
    if (deltaT >= 10) deltaCoef = 0.8;
    else if (deltaT > 5) deltaCoef = 1 - (deltaT - 5) * 0.06;
    const power = Math.round((usefulLength * wattsPerMeter * deltaCoef) + (supplyLength * 5));
    const flowRate = deltaT > 0 ? power / (1.16 * deltaT * 60) : 0;
    const Q_m3s = flowRate / 1000 / 60;
    const d_m = diameter / 1000;
    const A = Math.PI * (d_m / 2) ** 2;
    const rho = 1000, g = 9.81, nu = 1e-6, mu = 0.001;
    if (d_m <= 0 || A === 0 || Q_m3s <= 0) {
      return { power, flowRate, resistance: Infinity, regime: 'ошибка', totalLength, usefulLength };
    }
    const v = Q_m3s / A;
    const Re = v * d_m / nu;
    let deltaPUseful, deltaPSupply, resistance, regime;
    if (Re < 2300) {
      const baseDeltaP = (128 * mu * Q_m3s) / (Math.PI * Math.pow(d_m, 4));
      deltaPUseful = baseDeltaP * usefulLength * 1.4;
      deltaPSupply = baseDeltaP * supplyLength * 1.2;
      resistance = (deltaPUseful + deltaPSupply) / 1000 + 7;
      regime = `Ламинарный (Re = ${Math.round(Re)})`;
    } else {
      const lambda = 0.03;
      const hfPerMeter = (lambda * Math.pow(v, 2)) / (2 * g * d_m);
      deltaPUseful = rho * g * hfPerMeter * usefulLength * 1.4;
      deltaPSupply = rho * g * hfPerMeter * supplyLength * 1.2;
      resistance = (deltaPUseful + deltaPSupply) / 1000 + 7;
      regime = `Турбулентный (Re = ${Math.round(Re)})`;
    }
    return { power, flowRate, resistance, regime, totalLength, usefulLength };
  };

  const results = calculateResults();
  const [spoilerOpen, setSpoilerOpen] = useState(false);

  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="details-modal-backdrop" onClick={onClose}>
      <div className="details-modal-window" onClick={e => e.stopPropagation()} style={{
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto',
        padding: '2px 2px 3px 2px',
        boxSizing: 'border-box',
      }}>
        <div className="apple-card-field">
          <div style={{textAlign:'center', fontSize: '14px', fontWeight: 700, marginBottom: 3}}>
            Параметры петли №{number}
          </div>
          <div className="details-grid" style={{gap: '4px 6px', marginBottom: 6}}>
            <div className="details-item" style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap: 0, marginBottom: 4}}>
              <label style={{fontSize: '15px', margin: 0, minWidth: 120, textAlign: 'left'}}>Длина подводящих (м)</label>
              <input
                type="number"
                value={supplyLength || ''}
                onChange={e => setSupplyLength(Number(e.target.value))}
                placeholder="Длина подводящих"
                inputMode="numeric"
                style={{padding: '8px 10px', fontSize: '15px', height: 32, width: 110}}
              />
            </div>
            <div className="details-item" style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap: 0, marginBottom: 4}}>
              <label style={{fontSize: '15px', margin: 0, minWidth: 120, textAlign: 'left'}}>Полезная длина (м)</label>
              <input
                type="number"
                value={usefulLength || ''}
                onChange={e => setUsefulLength(Number(e.target.value))}
                placeholder="Полезная длина"
                inputMode="numeric"
                style={{padding: '8px 10px', fontSize: '15px', height: 32, width: 110}}
              />
            </div>
            <div style={{margin: '4px 0'}}>
              <button type="button" aria-label="Показать расширенные параметры" onClick={() => setSpoilerOpen(v => !v)} style={{background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  border: '1.5px solid #0071e3',
                  borderRadius: 8,
                  background: '#f5f6fa',
                  transition: 'transform 0.2s',
                  boxSizing: 'border-box',
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" style={{transition: 'transform 0.2s', transform: spoilerOpen ? 'rotate(0deg)' : 'rotate(-90deg)'}}><polyline points="4,7 9,12 14,7" fill="none" stroke="#0071e3" strokeWidth="2" strokeLinecap="round"/></svg>
                </span>
              </button>
              {spoilerOpen && (
                <div>
                  <div className="details-item" style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap: 0, marginBottom: 4, marginTop: 4}}>
                    <label style={{fontSize: '15px', margin: 0, minWidth: 120, textAlign: 'left'}}>Шаг укладки (мм)</label>
                    <select
                      value={actualPipeStep}
                      onChange={e => setPipeStep(Number(e.target.value))}
                      style={{padding: '6px 10px', fontSize: '15px', height: 32, width: 110}}
                    >
                      <option value="100">100 мм</option>
                      <option value="150">150 мм</option>
                      <option value="200">200 мм</option>
                      <option value="250">250 мм</option>
                      <option value="300">300 мм</option>
                    </select>
                  </div>
                  <div className="details-item" style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap: 0, marginBottom: 4}}>
                    <label style={{fontSize: '15px', margin: 0, minWidth: 120, textAlign: 'left'}}>ΔT</label>
                    <input
                      type="number"
                      min={2}
                      max={15}
                      value={deltaT || ''}
                      onChange={e => setDeltaT(Number(e.target.value))}
                      placeholder="ΔT"
                      inputMode="numeric"
                      style={{padding: '8px 10px', fontSize: '15px', height: 32, width: 110}}
                    />
                  </div>
                  <div className="details-item" style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap: 0, marginBottom: 4}}>
                    <label style={{fontSize: '15px', margin: 0, minWidth: 120, textAlign: 'left'}}>Вн. диаметр (мм)</label>
                    <input
                      type="number"
                      value={innerDiameter || ''}
                      onChange={e => setInnerDiameter(Number(e.target.value))}
                      placeholder="Диаметр"
                      inputMode="numeric"
                      style={{padding: '8px 10px', fontSize: '15px', height: 32, width: 110}}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="details-results" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4px 6px',
            marginTop: '1px',
            paddingTop: '1px',
            borderTop: '1px solid #eee',
            justifyContent: 'flex-start',
          }}>
            <div style={{background:'#f5f6fa',borderRadius:7,padding:'0px 1px',minWidth:38,display:'flex',flexDirection:'column',alignItems:'center',fontSize:'8px'}}>
              <span className="metric-label">ΔT</span>
              <span className="metric-value">{deltaT}°C</span>
            </div>
            <div style={{background:'#f5f6fa',borderRadius:7,padding:'0px 1px',minWidth:38,display:'flex',flexDirection:'column',alignItems:'center',fontSize:'8px'}}>
              <span className="metric-label">Длина</span>
              <span className="metric-value">{usefulLength}m</span>
            </div>
            <div style={{background:'#f5f6fa',borderRadius:7,padding:'0px 1px',minWidth:38,display:'flex',flexDirection:'column',alignItems:'center',fontSize:'8px'}}>
              <span className="metric-label">Мощность</span>
              <span className="metric-value">{results.power}Вт</span>
            </div>
            <div style={{background:'#f5f6fa',borderRadius:7,padding:'0px 1px',minWidth:38,display:'flex',flexDirection:'column',alignItems:'center',fontSize:'8px'}}>
              <span className="metric-label">Сопротивление</span>
              <span className="metric-value" style={{color: results.resistance > 21 ? '#ff3b30' : undefined}}>{results.resistance !== undefined ? results.resistance.toFixed(2) + ' кПа' : '-'}</span>
            </div>
            <div style={{background:'#f5f6fa',borderRadius:7,padding:'0px 1px',minWidth:38,display:'flex',flexDirection:'column',alignItems:'center',fontSize:'8px'}}>
              <span className="metric-label">Расход</span>
              <span className="metric-value">{results.flowRate.toFixed(2)} л/мин</span>
            </div>
            <div style={{background:'#f5f6fa',borderRadius:7,padding:'0px 1px',minWidth:38,display:'flex',flexDirection:'column',alignItems:'center',fontSize:'8px'}}>
              <span className="metric-label">Режим</span>
              <span className="metric-value" style={{fontSize:'9px',color:'#888',fontWeight:400}}>{results.regime}</span>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:6,marginTop:8}}>
          <button className="apple-create-btn--centered" style={{width: '100%', background:'#0071e3', fontSize: 15, padding: '10px 0', margin: 0}} onClick={() => onSave({
            deltaT,
            supplyLength,
            innerDiameter,
            pipeStep: actualPipeStep,
            usefulLength,
            totalLength,
            power: results.power,
            flowRate: results.flowRate,
            resistance: results.resistance,
            regime: results.regime
          })}>
            Сохранить
          </button>
          <button className="apple-create-btn--centered" style={{width: '100%', background:'#eee', color:'#222', fontSize: 15, padding: '10px 0', margin: 0}} onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DetailsModal; 