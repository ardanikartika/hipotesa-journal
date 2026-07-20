import { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import BottomNav from './components/BottomNav';
import InputForm from './components/InputForm';
import Archive from './components/Archive';
import HypothesisDetail from './components/HypothesisDetail';
import { Sun, Moon, Sparkles } from 'lucide-react';

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
      console.error('Failed to get random:', err);
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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b px-5 py-4"
        style={{
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--orange-400), var(--accent))' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1
                className="font-serif font-semibold text-xl tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Hipotesa
              </h1>
              <p
                className="text-xs -mt-0.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {hypotheses.length} journals
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
              <span
                className="status-dot"
                style={{ background: isConnected ? '#22c55e' : 'var(--slate-400)' }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {isConnected ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'var(--bg-tertiary)' }}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" style={{ color: 'var(--orange-400)' }} />
              ) : (
                <Moon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-6">
        {/* Connection Status */}
        {!isConnected && (
          <div
            className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
            style={{
              background: 'var(--accent-soft)',
              color: 'var(--accent)'
            }}
          >
            <span className="status-dot offline" />
            Offline — Data dari cache lokal
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="mb-4 p-3 rounded-xl text-sm"
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              color: '#f43f5e'
            }}
          >
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="w-10 h-10 rounded-full animate-spin"
              style={{
                borderWidth: '3px',
                borderColor: 'var(--border)',
                borderTopColor: 'var(--accent)'
              }}
            />
            <p className="mt-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Loading...
            </p>
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
