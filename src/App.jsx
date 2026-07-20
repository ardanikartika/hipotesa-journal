import React, { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import InputForm from './components/InputForm';
import Archive from './components/Archive';
import HypothesisDetail from './components/HypothesisDetail';
import api from './utils/api';

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

  const handleImport = useCallback(async (data) => {
    await api.importData(data);
    await refreshData();
  }, [refreshData]);

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
      <div className="min-h-screen bg-[#0a0a0f]">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20 pointer-events-none" />

      {/* Main Content */}
      <main className="relative max-w-lg mx-auto px-4 py-8">
        {/* Connection Status Banner */}
        {!isConnected && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            Offline Mode - Data dari cache lokal
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-500">Memuat...</p>
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
                onImport={handleImport}
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
