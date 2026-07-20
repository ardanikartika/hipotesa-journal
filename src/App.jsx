import { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import BottomNav from './components/BottomNav';
import InputForm from './components/InputForm';
import Archive from './components/Archive';
import HypothesisDetail from './components/HypothesisDetail';
import { Sun, Moon, Search, Menu, X, ChevronLeft, ChevronRight, BookOpen, Sparkles, FileText, Settings, Home } from 'lucide-react';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const navItems = [
    { id: 'input', label: 'Buat Baru', icon: Sparkles },
    { id: 'archive', label: 'Arsip', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'} ${
          mobileSidebarOpen ? 'mobile-open' : ''
        } hidden lg:flex flex-col`}
      >
        {/* Logo */}
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--emerald-900)' }}
              >
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                  Hipotesa
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {hypotheses.length} jurnal
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-all"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''} relative`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={toggleTheme}
            className="sidebar-item w-full"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
            {!sidebarCollapsed && <span>{theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header
          className="sticky top-0 z-30 border-b px-5 py-4"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu & Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
              </button>
              <div className="lg:hidden flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--emerald-900)' }}
                >
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Hipotesa</span>
              </div>

              {/* Desktop Search */}
              <div className="hidden lg:flex relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  placeholder="Cari jurnal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-2.5 rounded-xl"
                  style={{ background: 'var(--bg-tertiary)' }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Status Indicator */}
              <div
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: isConnected ? 'var(--success)' : 'var(--slate-400)' }}
                />
                {isConnected ? 'Online' : 'Offline'}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" style={{ color: 'var(--amber-600)' }} />
                ) : (
                  <Moon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden mt-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Cari jurnal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-2.5 rounded-xl"
              style={{ background: 'var(--bg-tertiary)' }}
            />
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-6">
          {/* Connection Status */}
          {!isConnected && (
            <div
              className="mb-4 p-3 rounded-xl text-sm flex items-center gap-2"
              style={{ background: 'var(--amber-100)', color: '#996633' }}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              Offline — Data dari cache lokal
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="mb-4 p-3 rounded-xl text-sm"
              style={{ background: '#FEE2E2', color: '#DC2626' }}
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
                  borderTopColor: 'var(--emerald-600)'
                }}
              />
              <p className="mt-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                Memuat...
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
                  searchQuery={searchQuery}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Navigation - Mobile */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isConnected={isConnected}
          onRefresh={handleRefresh}
        />
      </div>
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
