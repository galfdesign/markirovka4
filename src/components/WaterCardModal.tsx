import React from 'react';

interface WaterCardModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  data: any;
  setData: (data: any) => void;
  number: number;
  roomOptions: string[];
}

const WaterCardModal: React.FC<WaterCardModalProps> = ({
  open,
  onClose,
  onSave,
  data,
  setData,
  number,
  roomOptions
}) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-window modal-small" style={{ minHeight: 400 }}>
        <div className="apple-card-field" style={{marginBottom: 8}}>
          <label style={{textAlign: 'center', width: '100%', fontSize: 16, fontWeight: 600, marginBottom: 6}}>Выход №{number}</label>
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
              <select
                value={data.device || ''}
                onChange={e => setData({...data, device: e.target.value})}
                style={{ width: '100%', marginTop: 6, textAlign: 'center', fontSize: 14, padding: '6px 8px' }}
              >
                <option value="">Введите прибор</option>
                <option value="Душ">Душ</option>
                <option value="Унитаз">Унитаз</option>
                <option value="Раковина">Раковина</option>
                <option value="Ванна">Ванна</option>
                <option value="Гиг.душ">Гиг.душ</option>
                <option value="Стиральная машина">Стиральная машина</option>
                <option value="Посудомоечная машина">Посудомоечная машина</option>
                <option value="Биде">Биде</option>
                <option value="Полотенцесушитель">Полотенцесушитель</option>
              </select>
              <input
                type="text"
                value={data.device || ''}
                onChange={e => setData({...data, device: e.target.value})}
                placeholder="Или введите свой прибор"
                style={{ width: '100%', maxWidth: 320, margin: '6px auto 0 auto', display: 'block', textAlign: 'center', fontSize: 15, padding: '7px 10px' }}
              />
            </div>
            <div className="details-item" style={{marginBottom: 16, display: 'flex', justifyContent: 'center'}}>
              <div style={{
                display: 'flex',
                gap: 0,
                background: '#f0f2f7',
                borderRadius: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                padding: 3,
                border: '1.5px solid #e0e0e6',
                minWidth: 220,
                justifyContent: 'center',
              }}>
                {['ХВС', 'ГВС', 'РГВС'].map((type, idx) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setData({...data, type})}
                    style={{
                      flex: 1,
                      padding: '9px 0',
                      borderRadius: 20,
                      border: 'none',
                      fontWeight: 600,
                      fontSize: 15,
                      cursor: 'pointer',
                      background: data.type === type
                        ? (type === 'ХВС' ? 'linear-gradient(90deg,#2196f3 60%,#0071e3 100%)' : type === 'ГВС' ? 'linear-gradient(90deg,#ff6b6b 60%,#ff3b30 100%)' : 'linear-gradient(90deg,#ffe066 60%,#ffd600 100%)')
                        : 'transparent',
                      color: data.type === type
                        ? (type === 'РГВС' ? '#222' : '#fff')
                        : '#222',
                      boxShadow: data.type === type ? '0 2px 8px rgba(0,0,0,0.10)' : 'none',
                      margin: idx === 1 ? '0 4px' : 0,
                      outline: data.type === type ? '2px solid #2222' : 'none',
                      transition: 'background 0.25s, color 0.2s, box-shadow 0.2s',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {type}
                    {data.type === type && (
                      <span style={{
                        position: 'absolute',
                        left: 0, right: 0, top: 0, bottom: 0,
                        borderRadius: 20,
                        boxShadow: type === 'ХВС' ? '0 0 0 2px #2196f3' : type === 'ГВС' ? '0 0 0 2px #ff3b30' : '0 0 0 2px #ffd600',
                        pointerEvents: 'none',
                        zIndex: 0,
                      }} />
                    )}
                  </button>
                ))}
              </div>
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

export default WaterCardModal; 