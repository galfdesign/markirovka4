import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './AppleCard.css';

interface RadiatorDetailsModalProps {
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

const RadiatorDetailsModal: React.FC<RadiatorDetailsModalProps> = ({
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
  const actualPipeStep = pipeStep || 150;
  const [manualPower, setManualPower] = useState<number | ''>(1200);
  const [localDeltaT, setLocalDeltaT] = useState<number>(15);

  // Копируем расчёт из DetailsModal
  const calculateResults = () => {
    // 1. Расчет мощности
    const power = manualPower !== '' && !isNaN(Number(manualPower)) 
      ? Number(manualPower) 
      : Math.round((usefulLength * 9) + (supplyLength * 5));

    // 2. Расчет расхода теплоносителя
    // G = Q / (c * Δt)
    // где c = 4200 Дж/(кг·°C) - удельная теплоемкость воды
    const flowRate_kg_s = power / (4200 * localDeltaT); // кг/с
    const flowRate_l_min = flowRate_kg_s * 60; // л/мин
    const flowRate_m3_s = flowRate_kg_s / 1000; // м³/с

    // 3. Расчет скорости воды в трубе
    const d_m = innerDiameter / 1000; // диаметр в метрах
    const A = Math.PI * Math.pow(d_m / 2, 2); // площадь поперечного сечения
    const v = flowRate_m3_s / A; // скорость в м/с

    // 4. Определение режима движения (число Рейнольдса)
    const nu = 1e-6; // кинематическая вязкость воды
    const Re = v * d_m / nu;

    // 5. Расчет потерь давления
    let deltaPUseful, deltaPSupply, resistance, regime;
    const mu = 0.7e-3; // динамическая вязкость воды при 40°C

    if (Re < 2300) {
      // Ламинарный режим
      const baseDeltaP = (128 * mu * flowRate_m3_s) / (Math.PI * Math.pow(d_m, 4));
      deltaPUseful = baseDeltaP * usefulLength * 1.4; // с учетом местных сопротивлений
      deltaPSupply = baseDeltaP * supplyLength * 1.2; // с учетом местных сопротивлений
      regime = `Ламинарный (Re = ${Math.round(Re)})`;
    } else {
      // Турбулентный режим
      const lambda = 0.03; // коэффициент трения
      const rho = 1000; // плотность воды
      const g = 9.81; // ускорение свободного падения
      const hfPerMeter = (lambda * Math.pow(v, 2)) / (2 * g * d_m);
      deltaPUseful = rho * g * hfPerMeter * usefulLength * 1.4;
      deltaPSupply = rho * g * hfPerMeter * supplyLength * 1.2;
      regime = `Турбулентный (Re = ${Math.round(Re)})`;
    }

    // 6. Расчет общего сопротивления
    // Добавляем сопротивление радиатора (3 кПа) и арматуры (1 кПа)
    const radiatorResistance = 3; // кПа
    const fittingsResistance = 1; // кПа
    resistance = (deltaPUseful + deltaPSupply) / 1000 + radiatorResistance + fittingsResistance;

    return { 
      power, 
      flowRate: flowRate_l_min, 
      resistance, 
      regime, 
      totalLength, 
      usefulLength 
    };
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
            Параметры радиатора №{number}
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
              <label style={{fontSize: '15px', margin: 0, minWidth: 120, textAlign: 'left'}}>Мощность (Вт)</label>
              <input
                type="number"
                value={manualPower}
                onChange={e => setManualPower(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Мощность радиатора, Вт"
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
                  <div className="details-item" style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap: 0, marginBottom: 4}}>
                    <label style={{fontSize: '15px', margin: 0, minWidth: 120, textAlign: 'left'}}>ΔT</label>
                    <input
                      type="number"
                      min={2}
                      max={15}
                      value={localDeltaT || ''}
                      onChange={e => setLocalDeltaT(Number(e.target.value))}
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
              <span className="metric-value">{localDeltaT}°C</span>
            </div>
            <div style={{background:'#f5f6fa',borderRadius:7,padding:'0px 1px',minWidth:38,display:'flex',flexDirection:'column',alignItems:'center',fontSize:'8px'}}>
              <span className="metric-label">Длина</span>
              <span className="metric-value">{supplyLength}m</span>
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
            deltaT: localDeltaT,
            supplyLength,
            innerDiameter,
            pipeStep: actualPipeStep,
            usefulLength: results.usefulLength,
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

export default RadiatorDetailsModal; 