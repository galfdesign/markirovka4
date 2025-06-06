import React, { useRef, useLayoutEffect, useState } from 'react';
import FlowChart from './FlowChart';

interface RadiatorNorSectionProps {
  collectorName: string;
  loops: { room?: string; flowRate?: number; resistance?: number; power?: number; regime?: string; usefulLength?: number; supplyLength?: number; placement?: string; }[];
  photo?: string | null;
  containerRef?: React.Ref<HTMLDivElement>;
  forceReady?: boolean;
}

const RadiatorNorSection: React.FC<RadiatorNorSectionProps> = ({ collectorName, loops, photo, containerRef, forceReady }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [cardsStartY, setCardsStartY] = useState(0);
  useLayoutEffect(() => {
    if (sectionRef.current && cardsContainerRef.current) {
      const sectionRect = sectionRef.current.getBoundingClientRect();
      const cardsRect = cardsContainerRef.current.getBoundingClientRect();
      setCardsStartY(cardsRect.top - sectionRect.top);
    }
  }, [loops, photo, collectorName]);

  const totalFlow = loops.reduce((sum, l) => sum + (l.flowRate || 0), 0);
  const maxResistance = Math.max(...loops.map(l => l.resistance ?? 0));
  const maxLoops = loops
    .map((l, idx) => ({ ...l, idx }))
    .filter(l => l.resistance === maxResistance && maxResistance > 0);

  return (
    <div ref={el => {
      if (typeof containerRef === 'function') containerRef(el);
      else if (containerRef) (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      sectionRef.current = el;
    }} style={{width: '1200px', boxSizing: 'border-box', margin: '40px auto 0 auto', borderRadius: '12px', position: 'relative'}}>
      {/* Прозрачная линия переноса — только если высота блока >= 1586px */}
      {sectionRef.current && sectionRef.current.offsetHeight >= 1586 && (
        <div style={{
          position: 'absolute',
          top: '1586px',
          left: 0,
          width: '100%',
          borderTop: '2px dashed #bbb',
          zIndex: 10,
          pointerEvents: 'none',
          opacity: 0
        }} />
      )}
      <div style={{padding: '0 50px'}}>
        <div style={{
          background:'#c4c4c4',
          borderRadius:2,
          height:32,
          display:'flex',
          alignItems:'center',
          justifyContent:'space-between',
          padding: 0,
          marginBottom:18,
          width: '100%'
        }}>
          <span style={{fontWeight:700, color:'#fff', fontSize:16, marginLeft:24}}>GalfDesign</span>
          <span style={{color:'#fff', fontSize:14, marginRight:24}}>инженерные системы</span>
        </div>
        <div style={{padding: 0}}>
          <div style={{textAlign: 'center', marginBottom: 12, marginTop: 0}}>
            <h2 style={{fontSize: 22, fontWeight: 700, margin: 0, textAlign: 'center'}}>Радиаторы</h2>
            <div style={{fontSize: 15, color: '#666', fontWeight: 400, marginTop: 4}}>
              {(() => {
                const now = new Date();
                const pad = (n: number) => n.toString().padStart(2, '0');
                return `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
              })()}
            </div>
          </div>
          {photo && (
            <div style={{
              marginBottom: 18,
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              boxSizing: 'border-box',
              justifyContent: 'space-between',
              gap: 0
            }}>
              <div style={{width: '100%', maxWidth: 500, minWidth: 0}}>
                <FlowChart loops={loops} forceReady={forceReady} />
              </div>
              <div style={{flex: 1, textAlign: 'right', minWidth: 0, display: 'flex', justifyContent: 'flex-end'}}>
                <img src={photo} alt="Фото" style={{height: 320, maxWidth: 500, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', objectFit: 'contain'}} />
              </div>
            </div>
          )}
          <div style={{marginBottom: 12}}>
            <b>Коллектор:</b> {collectorName || '-'}
          </div>
          <div style={{marginBottom: 12}}>
            <b>Сводная таблица</b>
          </div>
          <div style={{display:'flex', gap:24, marginBottom: 12}}>
            <div><b>Суммарный расход:</b> {totalFlow.toFixed(2)} л/мин</div>
            <div><b>Макс. сопротивление:</b> {maxResistance > 0 ? maxResistance.toFixed(2) + ' кПа' : '-'}</div>
          </div>
          <div style={{marginBottom: 18}}>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:15, background:'#fff', boxSizing: 'border-box'}}>
              <thead>
                <tr style={{background:'#f5f6fa'}}>
                  <th style={{padding:'6px 8px', border:'1px solid #eee'}}>№</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Размещение</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Помещение</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Длина</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Расход</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Сопротивление</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Мощность</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Режим</th>
                </tr>
              </thead>
              <tbody>
                {loops.map((l, idx) => (
                  <tr key={idx} style={idx % 2 === 1 ? {background:'#f5f6fa'} : {}}>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{idx+1}</td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.placement || '-'}</td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.room || '-'}</td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.supplyLength !== undefined ? l.supplyLength.toFixed(1) + ' м' : '-'}</td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.flowRate !== undefined ? l.flowRate.toFixed(2) : '-'}</td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.resistance !== undefined ? l.resistance.toFixed(2) : '-'}</td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.power !== undefined ? l.power : '-'}</td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.regime || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{fontSize: 13, color: '#888', marginTop: 4}}>* нумерация петель слева направо</div>
          </div>
          <div style={{ width: '100%', textAlign: 'center', fontWeight: 700, fontSize: 20, margin: '24px 0 16px 0', letterSpacing: 1 }}>Маркировка</div>
          <div ref={cardsContainerRef}>
          {(() => {
            const cardHeightPx = 113;
            const cardGapPx = 21;
            const lineYAbsolute = 1586;
            const lineY = lineYAbsolute - cardsStartY;
            const cardsPerRow = 4;
            let rows = [];
            for (let i = 0; i < loops.length; i += cardsPerRow) {
              rows.push(loops.slice(i, i + cardsPerRow));
            }
            const rowHeightPx = cardHeightPx + cardGapPx;
            let blocks: React.ReactElement[] = [];
            let currentHeight = 0;
            rows.forEach((row, rowIdx) => {
              if (currentHeight < lineY && currentHeight + rowHeightPx > lineY) {
                blocks.push(
                  <div key={'break-row-' + rowIdx} style={{ width: '100%', height: (lineY - currentHeight) + cardGapPx + 'px' }} />
                );
                currentHeight = lineY;
              }
              blocks.push(
                <div key={'row-' + rowIdx} style={{ display: 'flex', flexWrap: 'nowrap', gap: cardGapPx, justifyContent: 'center', marginBottom: rowIdx === rows.length-1 ? 0 : cardGapPx }}>
                  {row.map((l, idx) => (
                    <div key={idx} className='card' style={{
                      background: '#fff',
                      borderRadius: 14,
                      padding: '12px',
                      width: '60mm',
                      height: '30mm',
                      border: '4px solid rgb(164,177,194)',
                      marginBottom: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      fontSize: 15,
                      position: 'relative'
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: '#333',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left',
                        paddingLeft: '4px'
                      }}>
                        {(l.room ? l.room : `Радиатор №${rowIdx * cardsPerRow + idx + 1}`).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 15, color: '#333', fontWeight: 500, marginTop: 2, paddingLeft: '4px' }}>{l.placement || '-'}</div>
                      <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '2px',
                        paddingLeft: '4px'
                      }}>
                        <div style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>Длина: {l.supplyLength !== undefined ? `${l.supplyLength.toFixed(1)} м` : '-'}</div>
                        <div style={{ fontSize: 13, color: '#333', fontWeight: 500 }}>Расход: {l.flowRate !== undefined ? `${Number(l.flowRate).toFixed(2)} л/мин` : '-'}</div>
                      </div>
                      <div style={{
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        opacity: 0.8,
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img src={process.env.PUBLIC_URL + '/logocart.png'} alt="logo" style={{ height: 80 }} />
                      </div>
                    </div>
                  ))}
                </div>
              );
              currentHeight += rowHeightPx;
            });
            return (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 28, marginBottom: blocks.length > 0 ? 50 : 0 }}>
                {blocks}
              </div>
            );
          })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiatorNorSection; 