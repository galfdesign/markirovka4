import React, { useRef } from 'react';

interface WaterSupplySectionProps {
  collectorName: string;
  loops: { room?: string; flowRate?: number; resistance?: number; power?: number; regime?: string; usefulLength?: number; type?: string; innerDiameter?: number; device?: string; photo?: string | null; }[];
  photo?: string | null;
  containerRef?: React.Ref<HTMLDivElement>;
}

const WaterSupplySection: React.FC<WaterSupplySectionProps> = ({ collectorName, loops, photo, containerRef }) => {
  const totalFlow = loops.reduce((sum, l) => sum + (l.flowRate || 0), 0);
  const maxResistance = Math.max(...loops.map(l => l.resistance ?? 0));
  const maxLoops = loops
    .map((l, idx) => ({ ...l, idx }))
    .filter(l => l.resistance === maxResistance && maxResistance > 0);

  // Фильтруем только ХВС
  const coldLoops = loops.filter(l => l.type === 'ХВС');
  // Фильтруем только ГВС и РГВС
  const hotLoops = loops.filter(l => l.type === 'ГВС');
  const recLoops = loops.filter(l => l.type === 'РГВС');

  return (
    <div ref={containerRef} style={{
      width: '1200px', 
      boxSizing: 'border-box', 
      margin: '40px auto 0 auto', 
      background: '#fff', 
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '0 50px',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto'
      }}>
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
            <h2 style={{fontSize: 22, fontWeight: 700, margin: 0, textAlign: 'center'}}>Водоснабжение</h2>
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
                <div style={{marginBottom: 16}}>
                  <b>Рекомендуемые расходы воды для санитарных приборов (Россия, СНиП/СП, СП 30.13330.2016):</b>
                  <div style={{marginTop: 8, width: '100%', background: '#f9f9fb', borderRadius: 8, padding: '8px 8px'}}>
                    {[
                      {name: 'Умывальник', min: 4, max: 6},
                      {name: 'Раковина кухонная', min: 6, max: 9},
                      {name: 'Ванна (смеситель)', min: 12, max: 18},
                      {name: 'Душ', min: 7, max: 12},
                      {name: 'Биде', min: 4, max: 6},
                      {name: 'Унитаз (слив)', min: 7, max: 9},
                      {name: 'Стиральная машина', min: 9, max: 12},
                      {name: 'Посудомоечная машина', min: 6, max: 9},
                      {name: 'Тропический душ', min: 9, max: 12},
                      {name: 'Поливочный кран', min: 9, max: 18},
                    ].map((item, idx) => {
                      const maxBar = 18;
                      const barMin = Math.round((item.min / maxBar) * 100);
                      const barMax = Math.round((item.max / maxBar) * 100);
                      const percent = Math.round((item.max / maxBar) * 100);
                      return (
                        <div key={item.name} style={{display:'flex',alignItems:'center',marginBottom:4}}>
                          <div style={{width: 120, fontSize: 13, color: '#222', flexShrink:0}}>{item.name}</div>
                          <div style={{flex:1, height: 12, position:'relative', background:'#e0e0e6', borderRadius: 6, margin: '0 6px', minWidth: 40}}>
                            <div style={{position:'absolute', left:0, top:0, height:'100%', borderRadius:6, background:'#0071e3', width: barMax + '%', opacity:0.25}}></div>
                            <div style={{position:'absolute', left:0, top:0, height:'100%', borderRadius:6, background:'#0071e3', width: barMin + '%'}}></div>
                          </div>
                          <div style={{width: 40, textAlign:'right', fontSize: 13, color:'#1976d2', fontWeight: 600}}>{item.min}–{item.max} л/мин</div>
                          <div style={{width: 38, textAlign:'left', fontSize: 12, color:'#888', marginLeft: 4}}>{percent}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div style={{flex: 1, textAlign: 'right', minWidth: 0, display: 'flex', justifyContent: 'flex-end'}}>
                <img src={photo} alt="Фото" style={{height: 320, maxWidth: 500, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', objectFit: 'contain'}} />
              </div>
            </div>
          )}
          <div style={{marginBottom: 12}}>
            <b>Коллектор:</b> {collectorName || '-'}
          </div>
          <div style={{marginBottom: 18}}>
            <div style={{fontWeight:700, fontSize:18, margin:'18px 0 8px 0', textAlign:'left'}}>Коллектор холодного водоснабжения</div>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:15, background:'#fff', boxSizing: 'border-box'}}>
              <thead>
                <tr style={{background:'#f5f6fa'}}>
                  <th style={{padding:'6px 8px', border:'1px solid #eee', width: '50px'}}>№</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '200px'}}>Помещение</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '450px'}}>Прибор</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '70px'}}>ХВС</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Длина</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee'}}>вн. диам.</th>
                  <th style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>опрессовка</th>
                </tr>
              </thead>
              <tbody>
                {coldLoops.map((l, idx) => (
                  <tr key={idx} style={idx % 2 === 1 ? {background:'#f5f6fa'} : {}}>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '50px'}}>{idx+1}</td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '200px'}}>{l.room || '-'}</td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '450px'}}>{l.device || '-'}</td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', background:'#2196f3', width:70}}></td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.usefulLength !== undefined ? l.usefulLength : '-'}</td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.innerDiameter !== undefined ? l.innerDiameter : '-'}</td>
                    <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.photo ? (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#4caf50" strokeWidth="2"><polyline points="5,11 9,15 15,7" fill="none"/></svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ff3b30" strokeWidth="2"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
                    )}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{fontSize: 13, color: '#888', marginTop: 4}}>* нумерация петель слева направо</div>
          </div>
          <div style={{fontWeight:700, fontSize:18, margin:'32px 0 8px 0', textAlign:'left'}}>Коллектор горячего водоснабжения</div>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:15, background:'#fff', boxSizing: 'border-box', marginBottom: 24}}>
            <thead>
              <tr style={{background:'#f5f6fa'}}>
                <th style={{padding:'6px 8px', border:'1px solid #eee', width: '50px'}}>№</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '200px'}}>Помещение</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '450px'}}>Прибор</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '70px'}}>ГВС</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Длина</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee'}}>вн. диам.</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>опрессовка</th>
              </tr>
            </thead>
            <tbody>
              {hotLoops.map((l, idx) => (
                <tr key={idx} style={idx % 2 === 1 ? {background:'#f5f6fa'} : {}}>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '50px'}}>{idx+1}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '200px'}}>{l.room || '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '450px'}}>{l.device || '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', background:'#ff3b30', width:70}}></td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.usefulLength !== undefined ? l.usefulLength : '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.innerDiameter !== undefined ? l.innerDiameter : '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.photo ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#4caf50" strokeWidth="2"><polyline points="5,11 9,15 15,7" fill="none"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ff3b30" strokeWidth="2"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{fontWeight:700, fontSize:18, margin:'32px 0 8px 0', textAlign:'left'}}>Коллектор рециркуляции ГВС</div>
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:15, background:'#fff', boxSizing: 'border-box', marginBottom: 24}}>
            <thead>
              <tr style={{background:'#f5f6fa'}}>
                <th style={{padding:'6px 8px', border:'1px solid #eee', width: '50px'}}>№</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '200px'}}>Помещение</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '450px'}}>Прибор</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '70px'}}>РГВС</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee'}}>Длина</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee'}}>вн. диам.</th>
                <th style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>опрессовка</th>
              </tr>
            </thead>
            <tbody>
              {recLoops.map((l, idx) => (
                <tr key={idx} style={idx % 2 === 1 ? {background:'#f5f6fa'} : {}}>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '50px'}}>{idx+1}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '200px'}}>{l.room || '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', width: '450px'}}>{l.device || '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center', background:'#ffd600', width:70}}></td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.usefulLength !== undefined ? l.usefulLength : '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.innerDiameter !== undefined ? l.innerDiameter : '-'}</td>
                  <td style={{padding:'6px 8px', border:'1px solid #eee', textAlign:'center'}}>{l.photo ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#4caf50" strokeWidth="2"><polyline points="5,11 9,15 15,7" fill="none"/></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ff3b30" strokeWidth="2"><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/></svg>
                  )}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ width: '100%', pageBreakBefore: 'always', breakBefore: 'page' }} />
        <div style={{ width: '100%', textAlign: 'center', fontWeight: 700, fontSize: 20, margin: '24px 0 16px 0', letterSpacing: 1 }}>Маркировка</div>
        {(() => {
          const cardHeightPx = 113;
          const cardGapPx = 16;
          const pageHeightPx = 800;
          const cardsPerRow = 3;
          // Сортировка по типу: ХВС, ГВС, РГВС
          const typeOrder = { 'ХВС': 1, 'ГВС': 2, 'РГВС': 3 };
          const sortedLoops = [...loops].sort((a, b) => {
            const aType = (a.type || '') as keyof typeof typeOrder;
            const bType = (b.type || '') as keyof typeof typeOrder;
            return (typeOrder[aType] || 99) - (typeOrder[bType] || 99);
          });
          let rows = [];
          for (let i = 0; i < sortedLoops.length; i += cardsPerRow) {
            rows.push(sortedLoops.slice(i, i + cardsPerRow));
          }
          const rowHeightPx = cardHeightPx + cardGapPx;
          let blocks: React.ReactElement[] = [];
          let currentHeight = 0;
          rows.forEach((row, rowIdx) => {
            if (currentHeight + rowHeightPx > pageHeightPx && currentHeight > 0) {
              blocks.push(
                <div key={'break-row-' + rowIdx} style={{ width: '100%', height: (pageHeightPx - currentHeight) + 'px' }} />
              );
              currentHeight = 0;
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
                    border: `4px solid ${l.type === 'ХВС' ? '#2196f3' : l.type === 'ГВС' ? '#ff3b30' : l.type === 'РГВС' ? '#ffd600' : '#111'}`,
                    marginBottom: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: 15,
                    position: 'relative'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: '#333',
                        maxWidth: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left',
                        paddingLeft: '4px'
                      }}>
                        {(l.room ? l.room : `Петля ${rowIdx * cardsPerRow + idx + 1}`).toUpperCase()}
                      </div>
                    </div>
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ 
                        fontSize: 18,
                        color: '#333',
                        marginBottom: '4px',
                        fontWeight: 500,
                        textAlign: 'left',
                        marginTop: '8px',
                        paddingLeft: '4px'
                      }}>
                        {l.device || '-'}
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                      marginTop: 'auto',
                      padding: '0 0 8px 8px',
                      boxSizing: 'border-box'
                    }}>
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
                  </div>
                ))}
              </div>
            );
            currentHeight += rowHeightPx;
          });
          return (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 28, marginBottom: 50 }}>
              {blocks}
            </div>
          );
        })()}
        {/* Блоки для фото опрессовки */}
        <div style={{ width: '100%', marginTop: '40px', marginBottom: '40px' }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: '20px', textAlign: 'center' }}>Фото опрессовки</div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
            gap: '20px',
            padding: '0 20px'
          }}>
            {loops.filter(l => l.photo).map((loop, index) => (
              <div key={index} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  <div style={{ 
                    fontWeight: 600, 
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    background: loop.type === 'ХВС' ? '#2196f3' : 
                              loop.type === 'ГВС' ? '#ff3b30' : 
                              loop.type === 'РГВС' ? '#ffd600' : '#f5f5f5',
                    color: loop.type === 'РГВС' ? '#333' : '#fff'
                  }}>
                    {loop.type || '-'}
                  </div>
                  <div style={{ marginTop: '4px' }}>{loop.room || '-'}</div>
                  <div>{loop.device || '-'}</div>
                </div>
                <div style={{
                  width: '200px',
                  height: '200px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f5f5f5'
                }}>
                  <img 
                    src={loop.photo || ''} 
                    alt={`Фото опрессовки ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      borderRadius: '8px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterSupplySection; 