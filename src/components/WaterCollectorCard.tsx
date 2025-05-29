import React from 'react';

interface WaterCollectorCardProps {
  collectorName: string;
  setCollectorName: (v: string) => void;
  loops: { flowRate?: number; resistance?: number; name?: string; number?: number }[];
}

const WaterCollectorCard: React.FC<WaterCollectorCardProps> = ({ collectorName, setCollectorName, loops }) => {
  const totalFlow = loops.reduce((sum, l) => sum + (l.flowRate || 0), 0);
  const maxResistance = Math.max(...loops.map(l => l.resistance ?? 0));
  const maxLoops = loops
    .map((l, idx) => ({ ...l, idx }))
    .filter(l => l.resistance === maxResistance && maxResistance > 0);

  return (
    <div className="apple-card" style={{marginBottom: 20, background: '#f5f6fa'}}>
      <div className="apple-card-header">
        <div className="apple-card-title">Блок коллекторов</div>
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
        {/* {maxLoops.length > 0 && (
          <div style={{marginTop: 8, fontSize: 13, color: '#666'}}>
            <b>Петли с макс. сопротивлением:</b> {maxLoops.map(l => l.name || `Петля №${l.number || l.idx + 1}`).join(', ')}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default WaterCollectorCard; 