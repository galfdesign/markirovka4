import React from 'react';

interface RadiatorCardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  data: any;
  setData: (data: any) => void;
  number: number;
  roomOptions: string[];
}

const RadiatorCardModal: React.FC<RadiatorCardModalProps> = ({ open, onClose, onSave, data, setData, number, roomOptions }) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-window modal-small">
        <div className="apple-card-field" style={{marginBottom: 8}}>
          <label style={{textAlign: 'center', width: '100%', fontSize: 16, fontWeight: 600, marginBottom: 6}}>Радиатор №{number}</label>
          <div className="details-grid" style={{gap: 6}}>
            <div className="details-item" style={{marginBottom: 4}}>
              <select
                value=""
                onChange={e => {
                  if (e.target.value) {
                    setData({...data, room: e.target.value});
                  }
                }}
                style={{ width: '100%', marginBottom: '4px', textAlign: 'center', fontSize: 14, padding: '6px 8px' }}
              >
                <option value="">Выберите помещение</option>
                {roomOptions.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
              <input
                type="text"
                value={data.room}
                onChange={e => setData({...data, room: e.target.value})}
                placeholder="Или введите своё название"
                style={{ width: '100%', maxWidth: 320, margin: '0 auto', display: 'block', textAlign: 'center', fontSize: 15, padding: '7px 10px' }}
              />
            </div>
            <div className="details-item" style={{marginBottom: 4}}>
              <select
                value={data.placement || ''}
                onChange={e => setData({...data, placement: e.target.value})}
                style={{ width: '100%', marginBottom: '4px', textAlign: 'center', fontSize: 15, padding: '7px 10px' }}
              >
                <option value="">Выберите размещение</option>
                <option value="1 этаж">1 этаж</option>
                <option value="2 этаж">2 этаж</option>
                <option value="гараж">гараж</option>
                <option value="подвал">подвал</option>
                <option value="мансарда">мансарда</option>
              </select>
              <input
                type="text"
                value={data.placement || ''}
                onChange={e => setData({...data, placement: e.target.value})}
                placeholder="Или введите своё размещение"
                style={{ width: '100%', maxWidth: 320, margin: '0 auto', display: 'block', textAlign: 'center', fontSize: 15, padding: '7px 10px' }}
              />
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:6,marginTop:8}}>
          <button className="apple-create-btn--centered" style={{width: '100%', background:'#0071e3', fontSize: 15, padding: '10px 0', margin: 0}} onClick={() => onSave(data)}>
            Сохранить
          </button>
          <button className="apple-create-btn--centered" style={{width: '100%', background:'#eee', color:'#222', fontSize: 15, padding: '10px 0', margin: 0}} onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default RadiatorCardModal; 