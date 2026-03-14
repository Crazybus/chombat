import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SimulationProvider } from './context/SimulationContext';
import Layout from './components/Layout';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SimulationProvider>
        <Routes>
          {/* Main app route - handles all paths */}
          <Route path="/*" element={<Layout />} />
        </Routes>
      </SimulationProvider>
    </BrowserRouter>
  );
};

export default App;
