import { useState, useCallback, useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Plus, X, Search, BookOpen, ChevronRight, ExternalLink } from 'lucide-react';

// Topik riset - warna simple
const TOPICS = [
  { key: 'philosophy', label: 'Filsafat', emoji: '🤔', color: '#6366F1' },
  { key: 'economics', label: 'Ekonomi', emoji: '💰', color: '#059669' },
  { key: 'business', label: 'Bisnis', emoji: '💼', color: '#D97706' },
  { key: 'religion', label: 'Agama', emoji: '🕌', color: '#7C3AED' },
  { key: 'science', label: 'Sains', emoji: '🔬', color: '#2563EB' },
  { key: 'tech', label: 'Teknologi', emoji: '💻', color: '#DC2626' },
  { key: 'politics', label: 'Politik', emoji: '🏛️', color: '#DB2777' },
  { key: 'art', label: 'Seni', emoji: '🎨', color: '#EA580C' },
  { key: 'health', label: 'Kesehatan', emoji: '🏥', color: '#0891B2' },
  { key: 'education', label: 'Pendidikan', emoji: '📚', color: '#4F46E5' },
  { key: 'other', label: 'Lainnya', emoji: '📌', color: '#64748B' },
];

function App() {
  const { hypotheses, createHypothesis, updateHypothesis, deleteHypothesis, addFinding, addSource, updateSource, deleteFinding, deleteSource, getRandomHypothesis, getHypothesisById } = useApp();
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('');

  const filtered = useMemo(() => {
    return hypotheses.filter(h => {
      const q = search.toLowerCase();
      const matchSearch = !q || h.title?.toLowerCase().includes(q) || h.content?.toLowerCase().includes(q);
      const matchTopic = !filterTopic || h.topic === filterTopic;
      return matchSearch && matchTopic;
    });
  }, [hypotheses, search, filterTopic]);

  const handleSelect = useCallback((id) => {
    const h = getHypothesisById(id);
    if (h) { setSelected(h); setView('detail'); }
  }, [getHypothesisById]);

  const handleRandom = useCallback(async () => {
    const r = await getRandomHypothesis();
    if (r) { setSelected(r); setView('detail'); }
  }, [getRandomHypothesis]);

  const handleSave = useCallback(async (data) => {
    if (data.id) await updateHypothesis(data.id, data);
    else await createHypothesis(data);
    setView('list');
    setSelected(null);
  }, [createHypothesis, updateHypothesis]);

  const handleDelete = useCallback(async () => {
    if (selected) {
      await deleteHypothesis(selected.id);
      setSelected(null);
      setView('list');
    }
  }, [selected, deleteHypothesis]);

  const handleBack = useCallback(() => {
    setSelected(null);
    setView('list');
  }, []);

  const refreshSelected = useCallback(() => {
    if (selected) {
      const updated = getHypothesisById(selected.id);
      if (updated) setSelected(updated);
    }
  }, [selected, getHypothesisById]);

  if (view === 'detail' && selected) {
    return (
      <DetailView
        item={selected}
        onBack={handleBack}
        onEdit={() => setView('edit')}
        onDelete={handleDelete}
        onAddFinding={async (finding) => { await addFinding(selected.id, finding); refreshSelected(); }}
        onDeleteFinding={async (findingId) => { await deleteFinding(selected.id, findingId); refreshSelected(); }}
        onAddSource={async (source) => { await addSource(selected.id, source); refreshSelected(); }}
        onUpdateSource={async (sourceId, data) => { await updateSource(selected.id, sourceId, data); refreshSelected(); }}
        onDeleteSource={async (sourceId) => { await deleteSource(selected.id, sourceId); refreshSelected(); }}
      />
    );
  }

  if (view === 'new' || view === 'edit') {
    return (
      <FormView
        item={view === 'edit' ? selected : null}
        onSave={handleSave}
        onCancel={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 px-6 pt-6 pb-4" style={{ background: 'var(--bg)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Hipotesa</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              {hypotheses.length} riset
            </p>
          </div>
          <button onClick={handleRandom} className="p-3 rounded-xl" style={{ background: 'var(--card)' }} title="Random">
            🎲
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Cari hipotesa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-5 h-5" style={{ color: 'var(--muted)' }} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
          <button
            onClick={() => setFilterTopic('')}
            className={`filter-pill ${filterTopic === '' ? 'active' : ''}`}
          >
            Semua ({hypotheses.length})
          </button>
          {TOPICS.map(t => (
            <button
              key={t.key}
              onClick={() => setFilterTopic(filterTopic === t.key ? '' : t.key)}
              className={`filter-pill ${filterTopic === t.key ? 'active' : ''}`}
              style={filterTopic === t.key ? { background: t.color, color: 'white' } : {}}
            >
              {t.emoji} {t.label} ({hypotheses.filter(h => h.topic === t.key).length})
            </button>
          ))}
        </div>
      </header>

      {/* List */}
      <main className="px-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔬</div>
            <p className="font-semibold mb-2">Belum ada riset</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Tekan tombol + untuk ajukan hipotesa</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((h, i) => {
              const topic = TOPICS.find(t => t.key === h.topic);
              const findingCount = h.findings?.length || 0;
              const sourceCount = h.sources?.length || 0;
              const doneSourceCount = h.sources?.filter(s => s.status === 'done').length || 0;

              return (
                <div
                  key={h.id}
                  onClick={() => handleSelect(h.id)}
                  className="card p-5 cursor-pointer animate"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{ background: topic?.color + '20', color: topic?.color }}
                    >
                      {topic?.emoji || '📌'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1 line-clamp-2">{h.title || 'Tanpa judul'}</h3>
                      <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>
                        {h.content || 'Tidak ada deskripsi'}
                      </p>

                      <div className="flex items-center gap-3 flex-wrap">
                        {topic && (
                          <span className="meta-badge" style={{ background: topic.color + '20', color: topic.color }}>
                            {topic.emoji} {topic.label}
                          </span>
                        )}
                        {findingCount > 0 && (
                          <span className="meta-badge">📌 {findingCount}</span>
                        )}
                        {sourceCount > 0 && (
                          <span className="meta-badge">📚 {doneSourceCount}/{sourceCount}</span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 shrink-0" style={{ color: 'var(--muted)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => setView('new')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40"
        style={{ background: 'var(--primary)', color: 'white' }}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}

// Detail View
function DetailView({ item, onBack, onEdit, onDelete, onAddFinding, onDeleteFinding, onAddSource, onUpdateSource, onDeleteSource }) {
  const [activeTab, setActiveTab] = useState('hipotesa');
  const [showAddFinding, setShowAddFinding] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [findingText, setFindingText] = useState('');
  const [newSource, setNewSource] = useState({ title: '', url: '' });

  const topic = TOPICS.find(t => t.key === item.topic);
  const findings = item.findings || [];
  const sources = item.sources || [];

  const handleAddFinding = () => {
    if (findingText.trim()) {
      onAddFinding({ text: findingText.trim(), date: new Date().toISOString() });
      setFindingText('');
      setShowAddFinding(false);
    }
  };

  const handleAddSource = () => {
    if (newSource.title.trim()) {
      onAddSource({
        title: newSource.title.trim(),
        url: newSource.url.trim(),
        type: newSource.url.includes('pdf') ? 'pdf' : 'link',
        status: 'to-read',
        dateAdded: new Date().toISOString()
      });
      setNewSource({ title: '', url: '' });
      setShowAddSource(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} className="p-2 rounded-lg" style={{ background: 'var(--card)' }}>
          ←
        </button>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 rounded-lg" style={{ background: 'var(--card)' }}>✏️</button>
          <button onClick={onDelete} className="p-2 rounded-lg" style={{ background: '#FEE2E2' }}>🗑️</button>
        </div>
      </header>

      {/* Topic Badge */}
      <div className="px-6 pt-4">
        {topic && (
          <span className="badge" style={{ background: topic.color + '20', color: topic.color }}>
            {topic.emoji} {topic.label}
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 pb-2 flex gap-1">
        <button
          onClick={() => setActiveTab('hipotesa')}
          className={`tab-btn ${activeTab === 'hipotesa' ? 'active' : ''}`}
        >
          💡 Hipotesa
        </button>
        <button
          onClick={() => setActiveTab('findings')}
          className={`tab-btn ${activeTab === 'findings' ? 'active' : ''}`}
        >
          📌 Findings ({findings.length})
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`tab-btn ${activeTab === 'sources' ? 'active' : ''}`}
        >
          📚 Sources ({sources.length})
        </button>
      </div>

      <main className="px-6">
        {/* Hipotesa Tab */}
        {activeTab === 'hipotesa' && (
          <div className="space-y-4">
            <h1 className="text-xl font-bold">{item.title || 'Tanpa judul'}</h1>
            {item.content && (
              <p className="text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
                {item.content}
              </p>
            )}
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Dibuat {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}

        {/* Findings Tab */}
        {activeTab === 'findings' && (
          <div className="space-y-3">
            {showAddFinding ? (
              <div className="card p-4 space-y-3">
                <textarea
                  value={findingText}
                  onChange={(e) => setFindingText(e.target.value)}
                  placeholder="Tulis finding baru..."
                  rows={3}
                  className="text-sm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={handleAddFinding} className="btn btn-primary flex-1 py-2 text-sm">
                    Simpan
                  </button>
                  <button onClick={() => setShowAddFinding(false)} className="btn py-2 px-4 text-sm" style={{ background: 'var(--card)' }}>
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddFinding(true)}
                className="w-full py-4 rounded-xl border border-dashed text-sm font-medium"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                + Tambah Finding
              </button>
            )}

            {findings.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
                <div className="text-4xl mb-2">📌</div>
                <p className="text-sm">Belum ada finding</p>
                <p className="text-xs">Tambahkan evidence untuk mendukung atau menolak hipotesa</p>
              </div>
            ) : (
              findings.map((f, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-lg mt-0.5">📌</span>
                      <div>
                        <p className="text-sm leading-relaxed">{f.text}</p>
                        <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>
                          {new Date(f.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onDeleteFinding(i)}
                      className="p-1 text-xs"
                      style={{ color: '#EF4444' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Sources Tab */}
        {activeTab === 'sources' && (
          <div className="space-y-3">
            {showAddSource ? (
              <div className="card p-4 space-y-3">
                <input
                  value={newSource.title}
                  onChange={(e) => setNewSource(p => ({ ...p, title: e.target.value }))}
                  placeholder="Judul jurnal, paper, atau artikel..."
                  className="text-sm"
                  autoFocus
                />
                <input
                  value={newSource.url}
                  onChange={(e) => setNewSource(p => ({ ...p, url: e.target.value }))}
                  placeholder="URL (opsional)"
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <button onClick={handleAddSource} className="btn btn-primary flex-1 py-2 text-sm">
                    Simpan
                  </button>
                  <button onClick={() => setShowAddSource(false)} className="btn py-2 px-4 text-sm" style={{ background: 'var(--card)' }}>
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddSource(true)}
                className="w-full py-4 rounded-xl border border-dashed text-sm font-medium"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                + Tambah Source
              </button>
            )}

            {sources.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--muted)' }}>
                <div className="text-4xl mb-2">📚</div>
                <p className="text-sm">Belum ada source</p>
                <p className="text-xs">Tambahkan jurnal atau paper untuk dibaca ulang</p>
              </div>
            ) : (
              sources.map((s, i) => {
                const statusColors = {
                  'to-read': { bg: '#F3F4F6', color: '#64748B' },
                  'reading': { bg: '#DBEAFE', color: '#2563EB' },
                  'done': { bg: '#D1FAE5', color: '#059669' },
                };
                const sc = statusColors[s.status] || statusColors['to-read'];
                const statusLabels = { 'to-read': '📖 Akan baca', reading: '📖 Dibaca', done: '✅ Selesai' };

                const cycleStatus = () => {
                  const next = s.status === 'to-read' ? 'reading' : s.status === 'reading' ? 'done' : 'to-read';
                  onUpdateSource(i, { status: next });
                };

                return (
                  <div key={i} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <BookOpen className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--muted)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{s.title}</p>
                          {s.url && (
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1 mt-1"
                              style={{ color: 'var(--primary)' }}
                            >
                              <ExternalLink className="w-3 h-3" />
                              {s.url.length > 40 ? s.url.substring(0, 40) + '...' : s.url}
                            </a>
                          )}
                          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                            Ditambahkan {new Date(s.dateAdded).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={cycleStatus}
                          className="badge text-xs cursor-pointer"
                          style={{ background: sc.bg, color: sc.color }}
                        >
                          {statusLabels[s.status]}
                        </button>
                        <button
                          onClick={() => onDeleteSource(i)}
                          className="p-1 text-xs"
                          style={{ color: '#EF4444' }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Form View
function FormView({ item, onSave, onCancel }) {
  const [title, setTitle] = useState(item?.title || '');
  const [content, setContent] = useState(item?.content || '');
  const [topic, setTopic] = useState(item?.topic || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onSave({
      id: item?.id,
      title: title.trim(),
      content: content.trim(),
      topic,
      findings: item?.findings || [],
      sources: item?.sources || [],
    });
    setSaving(false);
  };

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onCancel} className="p-2 rounded-lg" style={{ background: 'var(--card)' }}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="font-semibold">{item ? 'Edit' : 'Hipotesa Baru'}</h1>
        <div className="w-10" />
      </header>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        <div>
          <label className="text-sm font-medium block mb-2">Hipotesa *</label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Apakah...?"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Deskripsi / Latar Belakang</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Jelaskan konteks hipotesa..."
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-3">Topik</label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(t => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTopic(topic === t.key ? '' : t.key)}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={{
                  background: topic === t.key ? t.color : 'var(--card)',
                  color: topic === t.key ? 'white' : 'var(--text)',
                  border: '1px solid var(--border)',
                }}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="btn btn-primary w-full py-4 text-base"
          style={{ background: saving ? 'var(--muted)' : 'var(--primary)' }}
        >
          {saving ? 'Menyimpan...' : '💾 Simpan Hipotesa'}
        </button>
      </form>
    </div>
  );
}

export default App;
