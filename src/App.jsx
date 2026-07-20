import { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import BottomNav from './components/BottomNav';
import InputForm from './components/InputForm';
import Archive from './components/Archive';
import HypothesisDetail from './components/HypothesisDetail';
import { Sun, Moon, Plus, BookOpen } from 'lucide-react';

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

  const [activeTab, setActiveTab] = useState('archive');
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

  // Detail View
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

  // Input/Edit View
  if (activeTab === 'input') {
    return (
      <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
        <header className="sticky top-0 z-30 px-5 py-4 flex items-center justify-between" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {editingHypothesis ? 'Edit Jurnal' : 'Jurnal Baru'}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <main className="px-5 py-6">
          <InputForm
            onSave={handleSave}
            existingHypotheses={hypotheses}
            editMode={editingHypothesis || undefined}
            onCancel={editingHypothesis ? handleCancelEdit : undefined}
          />
        </main>

        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isConnected={isConnected}
          onRefresh={handleRefresh}
        />
      </div>
    );
  }

  // Archive View (Default)
  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 px-5 py-4" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Hipotesa
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {hypotheses.length} jurnal
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setActiveTab('input')}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 py-6">
        {/* Connection Status */}
        {!isConnected && (
          <div
            className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
            style={{ background: 'rgba(255, 149, 0, 0.1)', color: 'var(--amber)' }}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            Offline — Data dari cache lokal
          </div>
        )}

        {error && (
          <div
            className="mb-4 p-3 rounded-xl text-sm"
            style={{ background: 'rgba(255, 59, 48, 0.1)', color: 'var(--rose)' }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div
              className="w-8 h-8 rounded-full animate-spin"
              style={{ borderWidth: '2px', borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
            />
          </div>
        ) : (
          <Archive
            hypotheses={hypotheses}
            onSelectHypothesis={handleSelectHypothesis}
            onGetRandom={handleGetRandom}
          />
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
