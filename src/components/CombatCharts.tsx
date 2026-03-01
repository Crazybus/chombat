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
  Legend
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
    interaction: { intersect: false, mode: 'index' as const },
    scales: {
      x: { ticks: { maxTicksLimit: 10 } }
    },
    elements: {
      line: { tension: 0 },
      point: { radius: 0 }
    }
  };

  const createData = (keyA: keyof BattleTick, keyB: keyof BattleTick) => ({
    labels,
    datasets: [
      { label: nameA, data: history.map(h => h[keyA] as number), borderColor: '#3498db', backgroundColor: '#3498db' },
      { label: nameB, data: history.map(h => h[keyB] as number), borderColor: '#e74c3c', backgroundColor: '#e74c3c' },
    ],
  });

  return (
    <div className="charts-grid">
      <div className="chart-wrapper">
        <h4>Unit Counts</h4>
        <div className="chart-container">
          <Line data={createData('countA', 'countB')} options={commonOptions} />
        </div>
      </div>
      <div className="chart-wrapper">
        <h4>Total HP</h4>
        <div className="chart-container">
          <Line data={createData('hpA', 'hpB')} options={commonOptions} />
        </div>
      </div>
      <div className="chart-wrapper">
        <h4>Resource Value</h4>
        <div className="chart-container">
          <Line data={createData('valRemainingA', 'valRemainingB')} options={commonOptions} />
        </div>
      </div>
      <div className="chart-wrapper">
        <h4>Damage Per Hit</h4>
        <div className="chart-container">
          <Line data={createData('dpsA', 'dpsB')} options={commonOptions} />
        </div>
      </div>
    </div>
  );
};

export default CombatCharts;
