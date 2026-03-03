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

// Register once at module level
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
  const labels = history.map(h => h.time.toFixed(1) + 's');
  
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 }, // Faster updates
    interaction: { intersect: false, mode: 'index' as const },
    scales: {
      x: { 
        ticks: { maxTicksLimit: 15 },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    },
    plugins: {
      legend: { position: 'top' as const },
    },
    elements: {
      line: { tension: 0.1, borderWidth: 2 },
      point: { radius: 0 }
    }
  };

  const createData = (keyA: keyof BattleTick, keyB: keyof BattleTick) => ({
    labels,
    datasets: [
      { 
        label: nameA, 
        data: history.map(h => h[keyA] as number), 
        borderColor: '#3498db', 
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        fill: true
      },
      { 
        label: nameB, 
        data: history.map(h => h[keyB] as number), 
        borderColor: '#e74c3c', 
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        fill: true
      },
    ],
  });

  return (
    <div className="charts-area" style={{ width: '100%', marginTop: '20px' }}>
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))', gap: '20px', width: '100%' }}>
        <div className="chart-wrapper" style={{ height: '300px', background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
          <h4 style={{ marginBottom: '10px', color: 'var(--text-dim)' }}>Unit Counts</h4>
          <div className="chart-container" style={{ height: 'calc(100% - 30px)' }}>
            <Line data={createData('countA', 'countB')} options={commonOptions} />
          </div>
        </div>
        <div className="chart-wrapper" style={{ height: '300px', background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
          <h4 style={{ marginBottom: '10px', color: 'var(--text-dim)' }}>Total HP</h4>
          <div className="chart-container" style={{ height: 'calc(100% - 30px)' }}>
            <Line data={createData('hpA', 'hpB')} options={commonOptions} />
          </div>
        </div>
        <div className="chart-wrapper" style={{ height: '300px', background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
          <h4 style={{ marginBottom: '10px', color: 'var(--text-dim)' }}>Resource Value</h4>
          <div className="chart-container" style={{ height: 'calc(100% - 30px)' }}>
            <Line data={createData('valRemainingA', 'valRemainingB')} options={commonOptions} />
          </div>
        </div>
        <div className="chart-wrapper" style={{ height: '300px', background: 'var(--panel-bg)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-dim)' }}>
          <h4 style={{ marginBottom: '10px', color: 'var(--text-dim)' }}>Damage Per Hit (Group)</h4>
          <div className="chart-container" style={{ height: 'calc(100% - 30px)' }}>
            <Line data={createData('dpsA', 'dpsB')} options={commonOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombatCharts;
