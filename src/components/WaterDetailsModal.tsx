import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './AppleCard.css';

interface WaterDetailsModalProps {
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
  photo?: string | null;
}

// Функция для сжатия фото до 80 КБ
async function compressImageToMaxSize(imageUrl: string, maxWidth = 800, maxSizeKB = 80): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context is null'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      // Подбираем качество
      let quality = 0.8;
      let dataUrl = canvas.toDataURL('image/jpeg', quality);
      while (dataUrl.length / 1024 > maxSizeKB && quality > 0.1) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      resolve(dataUrl);
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

const WaterDetailsModal: React.FC<WaterDetailsModalProps> = ({
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
  setUsefulLength,
  photo: initialPhoto
}) => {
  const totalLength = supplyLength + usefulLength;
  const actualPipeStep = pipeStep || 150;
  const calculateResults = () => {
    const diameter = innerDiameter;
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
  const [photo, setPhoto] = useState<string | null>(initialPhoto || null);
  useEffect(() => {
    if (open) setPhoto(initialPhoto || null);
  }, [open, initialPhoto]);
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
            Выход №{number}
          </div>
          <div className="details-grid" style={{gap: '4px 6px', marginBottom: 6}}>
            <div className="details-item" style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap: 0, marginBottom: 4}}>
              <label style={{fontSize: '15px', margin: 0, minWidth: 120, textAlign: 'left'}}>Длина (м)</label>
              <input
                type="number"
                value={supplyLength || ''}
                onChange={e => setSupplyLength(Number(e.target.value))}
                placeholder="Длина"
                inputMode="numeric"
                style={{padding: '8px 10px', fontSize: '15px', height: 32, width: 110}}
              />
            </div>
            <div className="details-item" style={{display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between', gap: 0, marginBottom: 4}}>
              <label style={{fontSize: '15px', margin: 0, minWidth: 120, textAlign: 'left'}}>Внутренний диаметр (мм)</label>
              <input
                type="number"
                value={innerDiameter || 12}
                onChange={e => setInnerDiameter(Number(e.target.value))}
                placeholder="Внутренний диаметр"
                inputMode="numeric"
                style={{padding: '8px 10px', fontSize: '15px', height: 32, width: 110}}
              />
            </div>
            <div style={{margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
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
              <span style={{marginLeft: 12, fontSize: 14, color: '#1976d2', fontWeight: 500}}>Контроль опрессовки</span>
            </div>
            {spoilerOpen && (
              <div>
                {/* Квадратное окно для фото */}
                <div style={{margin: '12px 0 0 0', display: 'flex', justifyContent: 'center'}}>
                  <label htmlFor="water-details-photo-input" style={{
                    width: 120,
                    height: 120,
                    background: '#f5f6fa',
                    border: '2px dashed #b0b8c9',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#888',
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'border 0.2s',
                  }}>
                    <input
                      id="water-details-photo-input"
                      type="file"
                      accept="image/*"
                      style={{display: 'none'}}
                      onChange={async e => {
                        const file = e.target.files && e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = async (ev) => {
                            if (ev.target?.result) {
                              try {
                                const compressed = await compressImageToMaxSize(ev.target.result as string, 800, 80);
                                const img = document.getElementById('water-details-photo-img');
                                if (img) {
                                  img.setAttribute('src', compressed);
                                  img.style.display = 'block';
                                }
                                const clearBtn = document.getElementById('water-details-photo-clear');
                                if (clearBtn) clearBtn.style.display = 'flex';
                                setPhoto(compressed);
                              } catch {
                                setPhoto(ev.target.result as string);
                              }
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <img id="water-details-photo-img" alt="Фото" style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      borderRadius: 10,
                      display: photo ? 'block' : 'none',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 1
                    }} src={photo || undefined} />
                    <button
                      id="water-details-photo-clear"
                      type="button"
                      title="Удалить фото"
                      style={{
                        display: 'none',
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.85)',
                        border: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
                        cursor: 'pointer',
                        zIndex: 3
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        const img = document.getElementById('water-details-photo-img');
                        if (img) img.style.display = 'none';
                        const input = document.getElementById('water-details-photo-input') as HTMLInputElement;
                        if (input) input.value = '';
                        const clearBtn = document.getElementById('water-details-photo-clear');
                        if (clearBtn) clearBtn.style.display = 'none';
                        setPhoto(null);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#ff3b30" strokeWidth="2"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
                    </button>
                    <span style={{zIndex: 2}}>Добавить фото</span>
                  </label>
                </div>
              </div>
            )}
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
            regime: results.regime,
            photo
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

export default WaterDetailsModal; 