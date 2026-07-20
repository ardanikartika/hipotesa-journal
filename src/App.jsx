import React, { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import BottomNav from './components/BottomNav';
import InputForm from './components/InputForm';
import Archive from './components/Archive';
import HypothesisDetail from './components/HypothesisDetail';
import api from './utils/api';
import './index.css';

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

  // Handle save (create or update)
  const handleSave = useCallback(async (data) => {
    if (data.id) {
      await updateHypothesis(data.id, data);
      setEditingHypothesis(null);
    } else {
      await createHypothesis(data);
    }
    // Switch to archive after save
    setActiveTab('archive');
  }, [createHypothesis, updateHypothesis]);

  // Handle edit
  const handleEdit = useCallback(() => {
    if (selectedHypothesis) {
      setEditingHypothesis(selectedHypothesis);
      setShowDetail(false);
      setActiveTab('input');
    }
  }, [selectedHypothesis]);

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (selectedHypothesis) {
      await deleteHypothesis(selectedHypothesis.id);
      setSelectedHypothesis(null);
      setShowDetail(false);
      setActiveTab('archive');
    }
  }, [selectedHypothesis, deleteHypothesis]);

  // Handle timeline add
  const handleAddTimeline = useCallback(async (content) => {
    if (selectedHypothesis) {
      await addTimeline(selectedHypothesis.id, content);
      // Refresh the selected hypothesis
      const updated = getHypothesisById(selectedHypothesis.id);
      if (updated) {
        setSelectedHypothesis(updated);
      }
    }
  }, [selectedHypothesis, addTimeline, getHypothesisById]);

  // Handle select hypothesis
  const handleSelectHypothesis = useCallback((id) => {
    const hypothesis = getHypothesisById(id);
    if (hypothesis) {
      setSelectedHypothesis(hypothesis);
      setShowDetail(true);
    }
  }, [getHypothesisById]);

  // Handle random hypothesis
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

  // Handle navigate to related
  const handleNavigateToRelated = useCallback((id) => {
    handleSelectHypothesis(id);
  }, [handleSelectHypothesis]);

  // Handle import
  const handleImport = useCallback(async (data) => {
    await api.importData(data);
    await refreshData();
    alert('Data berhasil diimport!');
  }, [refreshData]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  // Back from detail
  const handleBackFromDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedHypothesis(null);
  }, []);

  // Cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditingHypothesis(null);
  }, []);

  // Show detail view
  if (showDetail && selectedHypothesis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Connection Status Banner */}
        {!isConnected && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Offline Mode - Data tersimpan di cache lokal
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
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
