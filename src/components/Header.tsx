// src/components/Header.tsx
import React, { useContext, useState } from 'react';
import { AppStateContext } from '../context/AppStateContext';
import History from '../pages/History';
import './Header.css';

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, onSectionChange }) => {
  const {
          state: { objectName },
          setObjectName,
          saveSnapshot,
          resetState,
        } = useContext(AppStateContext);

  const sections                      = [
    { id: 'floor', title: 'Напольное отопление' },
    { id: 'radiator', title: 'Радиаторы' },
    { id: 'water', title: 'Водоснабжение' }
  ];
  const currentIndex                  = sections.findIndex(s => s.id === activeSection);
  const [showHistory, setShowHistory] = useState(false);
  const [saved, setSaved] = useState(false);

  const prev = () => {
    const i = currentIndex <= 0 ? sections.length - 1 : currentIndex - 1;
    onSectionChange(sections[i].id);
  };
  const next = () => {
    const i = currentIndex === sections.length - 1 ? 0 : currentIndex + 1;
    onSectionChange(sections[i].id);
  };
  const handleSave = () => {
    const name = objectName.trim() || 'Новый объект';
    setObjectName(name);
    saveSnapshot(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <header className="header">
      <div className="logo">
        <img src={process.env.PUBLIC_URL + '/logo.png'} alt="Логотип" style={{ height: 22 }}/>
      </div>

      <div className="object-name-container">
        <span className="icon" onClick={() => resetState()}>🆕</span>
        <input
          className="object-name-input"
          value={objectName}
          onChange={e => setObjectName(e.target.value)}
          placeholder="Название объекта"
        />
        <span
          className="icon"
          onClick={handleSave}
          title="Сохранить снимок"
        >
          {saved ? '✅' : '💾'}
        </span>
        <span className="icon" onClick={() => setShowHistory(true)}>📜</span>
      </div>

      <nav className="header-nav">
        <button className="header-nav-arrow" onClick={prev}>←</button>
        <div className="header-nav-content">
          {sections[currentIndex]?.title}
        </div>
        <button className="header-nav-arrow" onClick={next}>→</button>
      </nav>

      {showHistory && <History onClose={() => setShowHistory(false)}/>}
    </header>
  );
};
export default Header;
