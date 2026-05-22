// App — Root component with routing and loading screen
import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useWebSocket from './hooks/useWebSocket';
import Dashboard from './components/Dashboard';
import ControlPanel from './components/ControlPanel';
import LoadingScreen from './components/LoadingScreen';

export default function App() {
  const [loading, setLoading] = useState(true);
  const { motorData, isConnected, alerts, history, sendCommand } = useWebSocket();

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {loading && <LoadingScreen onComplete={handleLoadingComplete} />}

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(17, 24, 39, 0.9)',
            backdropFilter: 'blur(12px)',
            color: '#e2e8f0',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            borderRadius: '12px',
            fontSize: '13px',
          },
          duration: 4000,
        }}
      />

      <div className={`transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard
                  motorData={motorData}
                  isConnected={isConnected}
                  alerts={alerts}
                  history={history}
                />
              }
            />
            <Route
              path="/control"
              element={
                <ControlPanel
                  sendCommand={sendCommand}
                  isConnected={isConnected}
                  motorData={motorData}
                />
              }
            />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}
