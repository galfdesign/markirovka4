import React, { useContext, useState } from 'react';
import { AppStateContext } from '../context/AppStateContext';
import { Snapshot } from '../utils/storage';
import './History.css';

interface HistoryProps {
  onClose: () => void;
}

export const History: React.FC<HistoryProps> = ({ onClose }) => {
  const {
          snapshots,
          loadSnapshot,
          deleteSnapshot,
          clearSnapshots,
          historyEnabled,
          toggleHistoryEnabled,
          dirty
        } = useContext(AppStateContext);

  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleLoad = async (snap: Snapshot) => {
    setLoadingId(snap.id);
    await loadSnapshot(snap);
    setLoadingId(null);
    onClose();
  };

  return (
    <div className="history-overlay">
      <button onClick={onClose} className="history-close-btn">
        ✖ Закрыть
      </button>

      <h2 className="history-title">История изменений</h2>

      <div className="history-controls">
        <label>
          <input
            type="checkbox"
            checked={historyEnabled}
            onChange={e => toggleHistoryEnabled(e.target.checked)}
          />
          Автосохранение состояния
        </label>
        <button
          onClick={() => {
            if (window.confirm('Очистить всю историю?')) clearSnapshots();
          }}
          disabled={snapshots.length === 0}
        >
          🧹 Очистить всё
        </button>
      </div>

      {snapshots.length === 0 ? (
        <p>Нет сохранённых снимков.</p>
      ) : (
        <table className="history-table">
          <thead>
          <tr>
            <th>Название</th>
            <th>Дата / Время</th>
            <th>Действия</th>
          </tr>
          </thead>
          <tbody>
          {snapshots.map(snap => (
            <tr key={snap.id}>
              <td title={snap.name}>{snap.name}</td>
              <td title={new Date(snap.timestamp).toLocaleString()}>
                {new Date(snap.timestamp).toLocaleString()}
              </td>
              <td className="history-actions">
                <button
                  onClick={() => handleLoad(snap)}
                  disabled={loadingId === snap.id}
                  title="Восстановить"
                >
                  {loadingId === snap.id ? '⌛' : '🔄'}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Удалить этот снимок?')) {
                      deleteSnapshot(snap.id);
                    }
                  }}
                  title="Удалить"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      )}

      {dirty && (
        <div className="history-dirty">
          ⚠ Есть несохранённые изменения.
        </div>
      )}
    </div>
  );
};

export default History;
