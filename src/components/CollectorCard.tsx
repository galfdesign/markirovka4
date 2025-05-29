import React from 'react';

interface CollectorCardProps {
  collectorName: string;
  setCollectorName: (v: string) => void;
  loops: { flowRate?: number; resistance?: number; name?: string; number?: number }[];
}

const CollectorCard: React.FC<CollectorCardProps> = ({ collectorName, setCollectorName, loops }) => {
  const totalFlow = loops.reduce((sum, l) => sum + (l.flowRate || 0), 0);
  const maxResistance = Math.max(...loops.map(l => l.resistance ?? 0));
  const maxLoops = loops
    .map((l, idx) => ({ ...l, idx }))
    .filter(l => l.resistance === maxResistance && maxResistance > 0);

  return (
    <div className="apple-card" style={{marginBottom: 20, background: '#f5f6fa'}}>
      <div className="apple-card-header">
        <div className="apple-card-title">Коллектор</div>
        <a 
          href="https://youtu.be/q1s82KxJwO0?si=NfTu0sgRakBxhP3X" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 8,
            borderRadius: '50%',
            background: 'rgba(0, 113, 227, 0.1)',
            color: '#0071e3',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(0, 113, 227, 0.2)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(0, 113, 227, 0.1)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"/>
          </svg>
        </a>
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
        {maxLoops.length > 0 && (
          <div style={{marginTop: 8, fontSize: 13, color: '#666'}}>
            <b>Петли с макс. сопротивлением:</b> {maxLoops.map(l => l.name || `Петля №${l.number || l.idx + 1}`).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectorCard; 