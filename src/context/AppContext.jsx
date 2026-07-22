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

  // Findings
  const addFinding = useCallback(async (id, finding) => {
    const hypothesis = hypotheses.find(h => h.id === id);
    if (!hypothesis) return;

    const newFindings = [...(hypothesis.findings || []), finding];
    const updated = await api.update(id, { ...hypothesis, findings: newFindings });
    setHypotheses(prev => prev.map(h => h.id === id ? updated : h));
    return updated;
  }, [hypotheses]);

  const deleteFinding = useCallback(async (id, findingIndex) => {
    const hypothesis = hypotheses.find(h => h.id === id);
    if (!hypothesis) return;

    const newFindings = (hypothesis.findings || []).filter((_, i) => i !== findingIndex);
    const updated = await api.update(id, { ...hypothesis, findings: newFindings });
    setHypotheses(prev => prev.map(h => h.id === id ? updated : h));
    return updated;
  }, [hypotheses]);

  // Sources
  const addSource = useCallback(async (id, source) => {
    const hypothesis = hypotheses.find(h => h.id === id);
    if (!hypothesis) return;

    const newSources = [...(hypothesis.sources || []), source];
    const updated = await api.update(id, { ...hypothesis, sources: newSources });
    setHypotheses(prev => prev.map(h => h.id === id ? updated : h));
    return updated;
  }, [hypotheses]);

  const updateSource = useCallback(async (id, sourceIndex, data) => {
    const hypothesis = hypotheses.find(h => h.id === id);
    if (!hypothesis) return;

    const newSources = [...(hypothesis.sources || [])];
    newSources[sourceIndex] = { ...newSources[sourceIndex], ...data };
    const updated = await api.update(id, { ...hypothesis, sources: newSources });
    setHypotheses(prev => prev.map(h => h.id === id ? updated : h));
    return updated;
  }, [hypotheses]);

  const deleteSource = useCallback(async (id, sourceIndex) => {
    const hypothesis = hypotheses.find(h => h.id === id);
    if (!hypothesis) return;

    const newSources = (hypothesis.sources || []).filter((_, i) => i !== sourceIndex);
    const updated = await api.update(id, { ...hypothesis, sources: newSources });
    setHypotheses(prev => prev.map(h => h.id === id ? updated : h));
    return updated;
  }, [hypotheses]);

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

  // Timeline
  const addTimeline = useCallback(async (id, content) => {
    const hypothesis = hypotheses.find(h => h.id === id);
    if (!hypothesis) return;

    const timelineItem = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content
    };
    const newTimeline = [...(hypothesis.timeline || []), timelineItem];
    const updated = await api.update(id, { ...hypothesis, timeline: newTimeline });
    setHypotheses(prev => prev.map(h => h.id === id ? updated : h));
    return updated;
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
      addFinding,
      deleteFinding,
      addTimeline,
      addSource,
      updateSource,
      deleteSource,
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
