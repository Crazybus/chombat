import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { BattleTick } from '../sim/CombatSim';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface CombatChartsProps {
  history: BattleTick[];
  nameA: string;
  nameB: string;
}

const CombatCharts: React.FC<CombatChartsProps> = ({ history, nameA, nameB }) => {
  if (!history || history.length === 0) return null;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: { intersect: false, mode: 'index' as const },
    scales: { 
      y: { 
        grid: { color: 'rgba(255,255,255,0.05)' }, 
        ticks: { color: '#888', font: { size: 10 } } 
      },
      x: { 
        grid: { color: 'rgba(255,255,255,0.05)' }, 
        ticks: { 
          color: '#888', 
          maxTicksLimit: 8,
          maxRotation: 45,
          minRotation: 0,
          font: { size: 10 }
        } 
      }
    },
    plugins: {
      legend: { position: 'top' as const, labels: { color: '#e0e0e0', font: { size: 11 } } },
    },
    elements: { line: { tension: 0.1, borderWidth: 2 }, point: { radius: 0 } }
  };

  const createData = (keyA: keyof BattleTick, keyB: keyof BattleTick) => ({
    labels: history.map(h => h.time.toFixed(1) + 's'),
    datasets: [
      { 
        label: nameA, 
        data: history.map(h => h[keyA] as number), 
        borderColor: '#3498db', 
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        fill: true
      },
      { 
        label: nameB, 
        data: history.map(h => h[keyB] as number), 
        borderColor: '#e74c3c', 
        backgroundColor: 'rgba(231, 76, 60, 0.2)',
        fill: true
      },
    ],
  });

  return (
    <div className="charts-area" style={{ width: '100%', marginTop: '20px' }}>
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', gap: '20px', width: '100%' }}>
        <div className="chart-wrapper" style={{ height: '350px' }}>
          <h4 style={{ marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Unit Counts</h4>
          <div className="chart-container" style={{ height: 'calc(100% - 25px)' }}>
            <Line data={createData('countA', 'countB')} options={commonOptions} />
          </div>
        </div>
        <div className="chart-wrapper" style={{ height: '350px' }}>
          <h4 style={{ marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Total HP</h4>
          <div className="chart-container" style={{ height: 'calc(100% - 25px)' }}>
            <Line data={createData('hpA', 'hpB')} options={commonOptions} />
          </div>
        </div>
        <div className="chart-wrapper" style={{ height: '350px' }}>
          <h4 style={{ marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Resource Value</h4>
          <div className="chart-container" style={{ height: 'calc(100% - 25px)' }}>
            <Line data={createData('valRemainingA', 'valRemainingB')} options={commonOptions} />
          </div>
        </div>
        <div className="chart-wrapper" style={{ height: '350px' }}>
          <h4 style={{ marginBottom: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>Damage Per Hit (Group)</h4>
          <div className="chart-container" style={{ height: 'calc(100% - 25px)' }}>
            <Line data={createData('dpsA', 'dpsB')} options={commonOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatCharts;
