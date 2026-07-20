import { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import BottomNav from './components/BottomNav';
import InputForm from './components/InputForm';
import Archive from './components/Archive';
import HypothesisDetail from './components/HypothesisDetail';
import { Sun, Moon, Plus } from 'lucide-react';

function AppContent() {
  const { hypotheses, loading, error, isConnected, refreshData, createHypothesis, updateHypothesis, deleteHypothesis, addTimeline, getRandomHypothesis, getHypothesisById } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('archive');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleSave = useCallback(async (data) => {
    if (data.id) await updateHypothesis(data.id, data);
    else await createHypothesis(data);
    setTab('archive');
  }, [createHypothesis, updateHypothesis]);

  const handleEdit = useCallback(() => {
    if (selected) { setEditing(selected); setShowDetail(false); setTab('input'); }
  }, [selected]);

  const handleDelete = useCallback(async () => {
    if (selected) {
      await deleteHypothesis(selected.id);
      setSelected(null); setShowDetail(false); setTab('archive');
    }
  }, [selected, deleteHypothesis]);

  const handleTimeline = useCallback(async (content) => {
    if (selected) {
      await addTimeline(selected.id, content);
      const updated = getHypothesisById(selected.id);
      if (updated) setSelected(updated);
    }
  }, [selected, addTimeline, getHypothesisById]);

  const handleSelect = useCallback((id) => {
    const h = getHypothesisById(id);
    if (h) { setSelected(h); setShowDetail(true); }
  }, [getHypothesisById]);

  const handleRandom = useCallback(async () => {
    const r = await getRandomHypothesis();
    if (r) { setSelected(r); setShowDetail(true); setTab('archive'); }
  }, [getRandomHypothesis]);

  const handleRelated = useCallback((id) => handleSelect(id), [handleSelect]);
  const handleBack = useCallback(() => { setShowDetail(false); setSelected(null); }, []);

  // Detail View
  if (showDetail && selected) {
    return (
      <HypothesisDetail
        hypothesis={selected}
        all={hypotheses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onTimeline={handleTimeline}
        onRelated={handleRelated}
        onRandom={handleRandom}
        onBack={handleBack}
      />
    );
  }

  // Input View
  if (tab === 'input') {
    return (
      <div className="min-h-screen pb-28" style={{ background: 'var(--cream)' }}>
        <header className="sticky top-0 z-30 px-6 py-5 flex items-center justify-between" style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)' }}>
          <h1 className="text-lg font-semibold">{editing ? 'Edit' : 'New'}</h1>
          <button onClick={toggleTheme} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--cream-dark)' }}>
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>
        <main className="px-6 py-8 max-w-xl mx-auto">
          <InputForm onSave={handleSave} all={hypotheses} edit={editing} />
        </main>
        <BottomNav tab={tab} onTab={setTab} connected={isConnected} onRefresh={refreshData} />
      </div>
    );
  }

  // Archive View
  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--cream)' }}>
      <header className="sticky top-0 z-30 px-6 py-5" style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: 'var(--charcoal)' }}>Hipotesa</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--warm-gray)' }}>{hypotheses.length} items</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--cream-dark)' }}>
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setTab('input')} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--charcoal)', color: 'var(--cream)' }}>
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="px-6 py-6">
        {error && <div className="mb-4 p-4 rounded-xl text-sm" style={{ background: 'rgba(244,63,94,0.1)', color: '#F43F5E' }}>{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid var(--border)', borderTopColor: 'var(--charcoal)' }} />
          </div>
        ) : (
          <Archive items={hypotheses} onSelect={handleSelect} onRandom={handleRandom} />
        )}
      </main>

      <BottomNav tab={tab} onTab={setTab} connected={isConnected} onRefresh={refreshData} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
