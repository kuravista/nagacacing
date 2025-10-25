/**
 * NagaCacing MVP - Frontend Entry Point
 * Main React application component with data loading and error handling
 */

import React, { useEffect } from 'react';
import { loadDataWithFallback, getCachedData } from './data/loader.js';
import { useAppStore, useDataState, useUIState, useVersionInfo } from './state/store.js';
import Visualization from './components/Visualization.js';

function App(): React.ReactElement {
  const { setData, setLoading, setError, setIsMobileMode } = useAppStore();
  const { data, isLoading, error } = useDataState();
  const { isMobileMode } = useUIState();
  const { version, generatedAt } = useVersionInfo();

  // Detect mobile mode
  useEffect(() => {
    const checkMobile = (): void => {
      setIsMobileMode(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsMobileMode]);

  // Load data on mount
  useEffect(() => {
    const loadAppData = async (): Promise<void> => {
      const dataUrl =
        import.meta.env.VITE_DATA_JSON_URL || 'https://data.nagacacing.com/data.json';

      const cached = getCachedData();
      const result = await loadDataWithFallback(
        {
          url: dataUrl,
          onRetry: (attempt, delay) => {
            console.log(`Retry attempt ${attempt} in ${delay}ms...`);
          },
        },
        cached
      );

      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.error || 'Failed to load data');
      }

      setLoading(false);
    };

    loadAppData().catch((err) => {
      console.error('Error in loadAppData:', err);
      setError('Unexpected error loading data');
      setLoading(false);
    });
  }, [setData, setLoading, setError]);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header
        style={{
          padding: '1rem',
          borderBottom: '1px solid #ddd',
          backgroundColor: '#f9f9f9',
        }}
      >
        <h1>🐉 NagaCacing MVP</h1>
        <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
          Market Storytelling: Naga vs Cacing
        </p>
      </header>

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          padding: '1rem',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isLoading ? (
          <LoadingState />
        ) : error && !data ? (
          <ErrorState error={error} />
        ) : data ? (
          <Visualization
            data={data}
            isMobileMode={isMobileMode}
          />
        ) : (
          <ErrorState error='No data available' />
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '1rem',
          borderTop: '1px solid #ddd',
          backgroundColor: '#f9f9f9',
          fontSize: '0.85rem',
          color: '#666',
          textAlign: 'center',
        }}
      >
        <p>
          {version && generatedAt ? (
            <>
              v{version} • Generated: {new Date(generatedAt).toLocaleString()}
            </>
          ) : (
            'Loading version info...'
          )}
        </p>
      </footer>
    </div>
  );
}

/**
 * Loading state component
 */
function LoadingState(): React.ReactElement {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '4px solid #ddd',
          borderTop: '4px solid #0066cc',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem',
        }}
      />
      <p>Loading market data...</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Error state component
 */
interface ErrorStateProps {
  error: string;
}

function ErrorState({ error }: ErrorStateProps): React.ReactElement {
  return (
    <div
      style={{
        padding: '2rem',
        backgroundColor: '#fee',
        border: '1px solid #f88',
        borderRadius: '4px',
        maxWidth: '500px',
        textAlign: 'center',
      }}
    >
      <h2 style={{ color: '#c00', margin: '0 0 1rem 0' }}>⚠️ Error Loading Data</h2>
      <p style={{ margin: '0 0 1rem 0', color: '#666' }}>{error}</p>
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#999' }}>
        Please check your internet connection and refresh the page.
      </p>
    </div>
  );
}

export default App;
