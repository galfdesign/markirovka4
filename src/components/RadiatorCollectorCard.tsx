import React from 'react';

interface RadiatorCollectorCardProps {
  collectorName: string;
  setCollectorName: (v: string) => void;
  loops: { flowRate?: number; resistance?: number; name?: string; number?: number }[];
}

const RadiatorCollectorCard: React.FC<RadiatorCollectorCardProps> = ({ collectorName, setCollectorName, loops }) => {
  const totalFlow = loops.reduce((sum, l) => sum + (l.flowRate || 0), 0);
  const maxResistance = Math.max(...loops.map(l => l.resistance ?? 0));
  const maxLoops = loops
    .map((l, idx) => ({ ...l, idx }))
    .filter(l => l.resistance === maxResistance && maxResistance > 0);

  return (
    <div className="apple-card" style={{marginBottom: 20, background: '#f5f6fa'}}>
      <div className="apple-card-header">
        <div className="apple-card-title">Коллектор</div>
      </div>
      <div className="apple-card-content">
        <div className="apple-card-field">
          <label>Название коллектора</label>
          <input
            type="text"
            value={collectorName}
            onChange={e => setCollectorName(e.target.value)}
            placeholder="Введите название"
            style={{width: '100%', maxWidth: 220, padding: 8, borderRadius: 8, border: '1.5px solid #e0e0e6', fontSize: 15}}
          />
        </div>
        <div className="apple-card-metrics">
          <div className="metric-item">
            <span className="metric-label">Суммарный расход</span>
            <span className="metric-value">{totalFlow.toFixed(2)} л/мин</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Макс. сопротивление</span>
            <span className="metric-value">{maxResistance > 0 ? maxResistance.toFixed(2) + ' кПа' : '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiatorCollectorCard; 