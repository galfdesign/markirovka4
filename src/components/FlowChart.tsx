import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FlowChartProps {
  loops: { room?: string; flowRate?: number }[];
}

const FlowChart: React.FC<FlowChartProps> = ({ loops }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300); // 300ms задержка для гарантии рендера

    return () => clearTimeout(timer);
  }, [loops]); // Перерисовка при изменении данных

  const maxFlow = Math.max(...loops.map(l => l.flowRate ?? 0), 1);
  const percentData = loops.map(l => maxFlow ? ((l.flowRate ?? 0) / maxFlow) * 100 : 0);
  const data = {
    labels: loops.map((l, idx) => l.room ? l.room : `Петля ${idx + 1}`),
    datasets: [
      {
        label: 'Расход, л/мин',
        data: loops.map(l => l.flowRate ?? 0),
        backgroundColor: '#0071e3',
        borderRadius: 6,
        maxBarThickness: 32,
        yAxisID: 'y',
      },
      {
        label: 'Проценты',
        data: percentData,
        backgroundColor: 'rgba(0,113,227,0.15)',
        borderRadius: 6,
        maxBarThickness: 32,
        yAxisID: 'y1',
        hidden: true // не отображаем отдельные бары, только шкалу
      }
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        ticks: { color: '#222', font: { size: 13, weight: 'bold' as const } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#222', font: { size: 13 } },
        grid: { color: '#eee' },
        title: { display: true, text: 'л/мин', color: '#222', font: { size: 13 } },
        min: 0,
        max: 5,
      },
      y1: {
        type: 'linear' as const,
        position: 'right' as const,
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        min: 0,
        max: 100,
        ticks: {
          color: '#0071e3',
          font: { size: 13 },
          callback: (tickValue: string | number) => Number(tickValue) + '%'
        },
        title: { display: true, text: '% от макс.', color: '#0071e3', font: { size: 13 } },
      }
    },
    maintainAspectRatio: false,
  };
  return (
    <div style={{width: '100%', maxWidth: 500, minWidth: 0, height: 320, background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 8}}>
      {isReady ? (
        <Bar data={data} options={options} height={320} />
      ) : (
        <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666'}}>
          Загрузка...
        </div>
      )}
    </div>
  );
};

export default FlowChart; 