import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [hypotheses, setHypotheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const checkConnection = useCallback(async () => {
    try {
      const connected = await api.healthCheck();
      setIsConnected(connected);
      return connected;
    } catch {
      setIsConnected(false);
      return false;
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const connected = await checkConnection();

      if (connected) {
        const data = await api.getAll();
        setHypotheses(data.hypotheses || []);
        setLastSync(data.lastUpdated);
      } else {
        const cached = localStorage.getItem('hipotesa_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          setHypotheses(parsed.hypotheses || []);
          setError('Offline mode - using cached data');
        } else {
          setError('Tidak dapat terhubung ke server');
        }
      }
    } catch (err) {
      setError('Gagal memuat data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [checkConnection]);

  useEffect(() => {
    refreshData();

    const syncInterval = setInterval(async () => {
      if (await checkConnection()) {
        try {
          const data = await api.sync(lastSync || undefined);
          if (data && data.hypotheses) {
            setHypotheses(prev => {
              const merged = [...prev];
              data.hypotheses.forEach((newH) => {
                const index = merged.findIndex(h => h.id === newH.id);
                if (index >= 0) {
                  merged[index] = newH;
                } else {
                  merged.unshift(newH);
                }
              });
              return merged;
            });
            setLastSync(data.lastUpdated);
          }
        } catch (err) {
          console.error('Sync error:', err);
        }
      }
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [lastSync, checkConnection, refreshData]);

  useEffect(() => {
    if (hypotheses.length > 0) {
      localStorage.setItem('hipotesa_cache', JSON.stringify({
        hypotheses,
        lastUpdated: lastSync
      }));
    }
  }, [hypotheses, lastSync]);

  const createHypothesis = useCallback(async (data) => {
    const newH = await api.create(data);
    setHypotheses(prev => [newH, ...prev]);
    return newH;
  }, []);

  const updateHypothesis = useCallback(async (id, data) => {
    const updated = await api.update(id, data);
    setHypotheses(prev => prev.map(h => h.id === id ? updated : h));
    return updated;
  }, []);

  const deleteHypothesis = useCallback(async (id) => {
    await api.delete(id);
    setHypotheses(prev => prev.filter(h => h.id !== id));
  }, []);

  const addTimeline = useCallback(async (id, content) => {
    const update = await api.addTimeline(id, content);
    setHypotheses(prev => prev.map(h => {
      if (h.id === id) {
        return {
          ...h,
          timeline: [...(h.timeline || []), update]
        };
      }
      return h;
    }));
  }, []);

  const getRandomHypothesis = useCallback(async () => {
    try {
      return await api.getRandom();
    } catch {
      if (hypotheses.length > 0) {
        const randomIndex = Math.floor(Math.random() * hypotheses.length);
        return hypotheses[randomIndex];
      }
      return null;
    }
  }, [hypotheses]);

  const getHypothesisById = useCallback((id) => {
    return hypotheses.find(h => h.id === id);
  }, [hypotheses]);

  return (
    <AppContext.Provider value={{
      hypotheses,
      loading,
      error,
      lastSync,
      isConnected,
      refreshData,
      createHypothesis,
      updateHypothesis,
      deleteHypothesis,
      addTimeline,
      getRandomHypothesis,
      getHypothesisById
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
