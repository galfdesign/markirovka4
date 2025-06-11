import React, { createContext, useReducer, useEffect, useState, ReactNode } from 'react';
import throttle from 'lodash.throttle';
import {
  getAppState,
  setAppState,
  getSnapshots,
  saveSnapshot as saveSnapshotToStorage,
  deleteSnapshot as deleteSnapshotFromStorage,
  clearSnapshots as clearSnapshotsInStorage,
  Snapshot
} from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';
import { CardData } from '../App'; // поправьте путь, если нужно

// Описываем весь стейт приложения
export interface AppState {
  objectName: string;
  // Напольное отопление
  floorCards: CardData[];
  floorCollectorName: string;
  floorPhoto: string | null;
  // Водоснабжение
  waterCards: CardData[];
  waterCollectorName: string;
  waterPhoto: string | null;
  // Радиаторы
  radiatorCards: CardData[];
  radiatorCollectorName: string;
  radiatorPhoto: string | null;
}

// Начальный стейт
export const initialState: AppState = {
  objectName: '',
  floorCards: [],
  floorCollectorName: '',
  floorPhoto: process.env.PUBLIC_URL + '/koltp.png',
  waterCards: [],
  waterCollectorName: '',
  waterPhoto: process.env.PUBLIC_URL + '/voda.png',
  radiatorCards: [],
  radiatorCollectorName: '',
  radiatorPhoto: process.env.PUBLIC_URL + '/rad.png',
};

export type Action =
  | { type: 'LOAD'; payload: any }
  | { type: 'EDIT'; payload: Partial<AppState> }
  | { type: 'LOAD_SNAPSHOT'; payload: any }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD':
      return { ...action.payload } as AppState;
    case 'EDIT':
      return { ...state, ...action.payload };
    case 'LOAD_SNAPSHOT':
      return { ...action.payload } as AppState;
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export interface AppStateContextProps {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  dirty: boolean;
  snapshots: Snapshot[];
  saveSnapshot: (name: string) => Promise<void>;
  loadSnapshot: (snapshot: Snapshot) => Promise<void>;
  deleteSnapshot: (id: string) => Promise<void>;
  clearSnapshots: () => Promise<void>;
  resetState: () => void;
  historyEnabled: boolean;
  toggleHistoryEnabled: (enabled: boolean) => void;
  setObjectName: (name: string) => void;
}

export const AppStateContext = createContext<AppStateContextProps>(null!);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch]                   = useReducer(reducer, initialState);
  const [dirty, setDirty]                   = useState(false);
  const [snapshots, setSnapshots]           = useState<Snapshot[]>([]);
  const [historyEnabled, setHistoryEnabled] = useState(true);

  // 1) При старте загружаем стейт и снапшоты
  useEffect(() => {
    getAppState().then(saved => {
      if (saved) dispatch({ type: 'LOAD', payload: saved });
    });
    getSnapshots().then(setSnapshots);
  }, []);

  // 2) Автосохранение стейта
  const throttledSave = throttle((s: AppState) => {
    if (historyEnabled) {
      setAppState(s);
      setDirty(false);
    }
  }, 2000);
  useEffect(() => { throttledSave(state); }, [state, historyEnabled]);

  // 3) Предупреждение при уходе
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  const saveSnapshot = async (name: string) => {
    // ищем существующий снапшот по имени
    const existing       = snapshots.find(s => s.name === name);
    const id             = existing ? existing.id : uuidv4();
    const snap: Snapshot = { id, name, timestamp: Date.now(), data: state };
    await saveSnapshotToStorage(snap);
    setSnapshots(await getSnapshots());
    setDirty(false);
  };

  const loadSnapshot   = async (snap: Snapshot) => {
    if (dirty && window.confirm('Есть несохранённые изменения — сохранить?')) {
      await saveSnapshot(`Снапшот ${new Date().toLocaleString()}`);
    }
    dispatch({ type: 'LOAD_SNAPSHOT', payload: snap.data });
    dispatch({ type: 'EDIT', payload: { objectName: snap.name } });
    setDirty(false);
  };
  const deleteSnapshot = async (id: string) => {
    await deleteSnapshotFromStorage(id);
    setSnapshots(await getSnapshots());
  };
  const clearSnapshots = async () => {
    await clearSnapshotsInStorage();
    setSnapshots([]);
  };

  // 5) История
  const toggleHistoryEnabled = (on: boolean) => {
    setHistoryEnabled(on);
    if (!on) setDirty(false);
  };
  // 6) Новый документ
  const resetState           = () => {
    dispatch({ type: 'RESET' });
    setDirty(false);
  };
  // 7) Обновить название
  const setObjectName        = (name: string) => {
    dispatch({ type: 'EDIT', payload: { objectName: name } });
    setDirty(true);
  };

  return (
    <AppStateContext.Provider value={{
      state, dispatch, dirty,
      snapshots, saveSnapshot, loadSnapshot, deleteSnapshot, clearSnapshots,
      resetState, historyEnabled, toggleHistoryEnabled,
      setObjectName
    }}>
      {children}
    </AppStateContext.Provider>
  );
};
