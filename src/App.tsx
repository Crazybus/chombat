import React from 'react';
import { SimulationProvider } from './context/SimulationContext';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <SimulationProvider>
      <Layout />
    </SimulationProvider>
  );
};

export default App;
