import { useState, useCallback } from 'react';
import { AppProvider, useApp, useTheme } from './context/AppContext';
import BottomNav from './components/BottomNav';
import InputForm from './components/InputForm';
import Archive from './components/Archive';
import HypothesisDetail from './components/HypothesisDetail';
import { Sun, Moon } from 'lucide-react';

function AppContent() {
  const {
    hypotheses,
    loading,
    error,
    isConnected,
    refreshData,
    createHypothesis,
    updateHypothesis,
    deleteHypothesis,
    addTimeline,
    getRandomHypothesis,
    getHypothesisById
  } = useApp();

  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('input');
  const [selectedHypothesis, setSelectedHypothesis] = useState(null);
  const [editingHypothesis, setEditingHypothesis] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleSave = useCallback(async (data) => {
    if (data.id) {
      await updateHypothesis(data.id, data);
      setEditingHypothesis(null);
    } else {
      await createHypothesis(data);
    }
    setActiveTab('archive');
  }, [createHypothesis, updateHypothesis]);

  const handleEdit = useCallback(() => {
    if (selectedHypothesis) {
      setEditingHypothesis(selectedHypothesis);
      setShowDetail(false);
      setActiveTab('input');
    }
  }, [selectedHypothesis]);

  const handleDelete = useCallback(async () => {
    if (selectedHypothesis) {
      await deleteHypothesis(selectedHypothesis.id);
      setSelectedHypothesis(null);
      setShowDetail(false);
      setActiveTab('archive');
    }
  }, [selectedHypothesis, deleteHypothesis]);

  const handleAddTimeline = useCallback(async (content) => {
    if (selectedHypothesis) {
      await addTimeline(selectedHypothesis.id, content);
      const updated = getHypothesisById(selectedHypothesis.id);
      if (updated) {
        setSelectedHypothesis(updated);
      }
    }
  }, [selectedHypothesis, addTimeline, getHypothesisById]);

  const handleSelectHypothesis = useCallback((id) => {
    const hypothesis = getHypothesisById(id);
    if (hypothesis) {
      setSelectedHypothesis(hypothesis);
      setShowDetail(true);
    }
  }, [getHypothesisById]);

  const handleGetRandom = useCallback(async () => {
    try {
      const random = await getRandomHypothesis();
      if (random) {
        setSelectedHypothesis(random);
        setShowDetail(true);
        setActiveTab('archive');
      }
    } catch (err) {
      console.error('Failed to get random hypothesis:', err);
    }
  }, [getRandomHypothesis]);

  const handleNavigateToRelated = useCallback((id) => {
    handleSelectHypothesis(id);
  }, [handleSelectHypothesis]);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  const handleBackFromDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedHypothesis(null);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingHypothesis(null);
  }, []);

  if (showDetail && selectedHypothesis) {
    return (
      <HypothesisDetail
        hypothesis={selectedHypothesis}
        allHypotheses={hypotheses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddTimeline={handleAddTimeline}
        onNavigateToRelated={handleNavigateToRelated}
        onGetRandom={handleGetRandom}
        onBack={handleBackFromDetail}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--bg-secondary)] border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[var(--purple)] to-[var(--accent)] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-[var(--text-primary)] logo-text">
                Hipotesa
              </h1>
              <p className="text-[10px] text-[var(--text-tertiary)] -mt-1">
                {hypotheses.length} catatan
              </p>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {/* Connection Status */}
        {!isConnected && (
          <div className="mb-4 p-3 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            Offline - Data dari cache lokal
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[rgba(244,63,94,0.1)] border border-[var(--rose)]/20 text-[var(--rose)] text-sm">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin mb-4" />
            <p className="text-[var(--text-tertiary)]">Memuat...</p>
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {activeTab === 'input' ? (
              <InputForm
                onSave={handleSave}
                existingHypotheses={hypotheses}
                editMode={editingHypothesis || undefined}
                onCancel={editingHypothesis ? handleCancelEdit : undefined}
              />
            ) : (
              <Archive
                hypotheses={hypotheses}
                onSelectHypothesis={handleSelectHypothesis}
                onGetRandom={handleGetRandom}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isConnected={isConnected}
        onRefresh={handleRefresh}
      />
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
