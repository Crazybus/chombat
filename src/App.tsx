import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SimulationProvider>
        <Layout />
      </SimulationProvider>
    </BrowserRouter>
  );
};

export default App;
