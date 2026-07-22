import { useState, useCallback } from 'react';
import { useApp } from './context/AppContext';
import { Plus, X, Search, Settings, Home, Download, Upload, RefreshCw } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import api from './utils/api';

// Author avatars
const getAuthorAvatar = (authorName) => {
  const lower = (authorName || '').toLowerCase();

  if (lower.includes('gugah')) {
    return { emoji: '👨‍💻', bg: '#3B82F6', initials: 'G' };
  }
  if (lower.includes('tika')) {
    return { emoji: '👩‍💻', bg: '#EC4899', initials: 'T' };
  }
  return { emoji: '👤', bg: '#6366F1', initials: (authorName || 'A')[0].toUpperCase() };
};

// Topik riset
const TOPICS = [
  { key: 'philosophy', label: 'Filsafat', emoji: '🤔' },
  { key: 'economics', label: 'Ekonomi', emoji: '💰' },
  { key: 'business', label: 'Bisnis', emoji: '💼' },
  { key: 'religion', label: 'Agama', emoji: '🕌' },
  { key: 'science', label: 'Sains', emoji: '🔬' },
  { key: 'tech', label: 'Teknologi', emoji: '💻' },
  { key: 'politics', label: 'Politik', emoji: '🏛️' },
  { key: 'art', label: 'Seni', emoji: '🎨' },
  { key: 'health', label: 'Kesehatan', emoji: '🏥' },
  { key: 'education', label: 'Pendidikan', emoji: '📚' },
  { key: 'life', label: 'Kehidupan', emoji: '🌱' },
  { key: 'parenting', label: 'Parenting', emoji: '👨‍👩‍👧' },
  { key: 'other', label: 'Lainnya', emoji: '📌' },
];

function App() {
  const { hypotheses, createHypothesis, updateHypothesis, deleteHypothesis, addTimeline, getHypothesisById, refreshData, addSource, updateSource, deleteSource } = useApp();
  const { theme, toggleTheme } = useTheme();
  const [tab, setTab] = useState('home'); // home | detail | new | edit | settings
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState('');

  // Filter & Search
  const filteredHypotheses = hypotheses.filter(h => {
    const matchSearch = !searchQuery ||
      h.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.author?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchTopic = !filterTopic || h.topic === filterTopic;
    return matchSearch && matchTopic;
  });

  const handleSave = useCallback(async (data) => {
    if (data.id) await updateHypothesis(data.id, data);
    else await createHypothesis(data);
    setTab('home');
    setEditMode(null);
  }, [createHypothesis, updateHypothesis]);

  const handleSelect = useCallback((id) => {
    const h = getHypothesisById(id);
    if (h) { setSelected(h); setTab('detail'); }
  }, [getHypothesisById]);

  const handleDelete = useCallback(async () => {
    if (selected) {
      await deleteHypothesis(selected.id);
      setSelected(null);
      setTab('home');
    }
  }, [selected, deleteHypothesis]);

  const handleTimeline = useCallback(async (content) => {
    if (selected) {
      await addTimeline(selected.id, content);
      const updated = getHypothesisById(selected.id);
      if (updated) setSelected(updated);
    }
  }, [selected, addTimeline, getHypothesisById]);

  const handleRelated = useCallback((id) => {
    const h = getHypothesisById(id);
    if (h) setSelected(h);
  }, [getHypothesisById]);

  const handleAddSource = useCallback(async (source) => {
    if (selected) {
      await addSource(selected.id, source);
      const updated = getHypothesisById(selected.id);
      if (updated) setSelected(updated);
    }
  }, [selected, addSource, getHypothesisById]);

  const handleUpdateSource = useCallback(async (sourceIndex, data) => {
    if (selected) {
      await updateSource(selected.id, sourceIndex, data);
      const updated = getHypothesisById(selected.id);
      if (updated) setSelected(updated);
    }
  }, [selected, updateSource, getHypothesisById]);

  const handleDeleteSource = useCallback(async (sourceIndex) => {
    if (selected) {
      await deleteSource(selected.id, sourceIndex);
      const updated = getHypothesisById(selected.id);
      if (updated) setSelected(updated);
    }
  }, [selected, deleteSource, getHypothesisById]);

  const handleExport = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hipotesa-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await api.importData(data);
      refreshData();
    } catch (err) {
      console.error('Import failed:', err);
    }
  };

  // Render based on current tab
  if (tab === 'detail' && selected) {
    return (
      <DetailView
        item={selected}
        all={hypotheses}
        onEdit={() => { setEditMode(selected); setTab('edit'); }}
        onDelete={handleDelete}
        onTimeline={handleTimeline}
        onRelated={handleRelated}
        onBack={() => { setSelected(null); setTab('home'); }}
        onAddSource={handleAddSource}
        onUpdateSource={handleUpdateSource}
        onDeleteSource={handleDeleteSource}
      />
    );
  }

  if (tab === 'edit' || tab === 'new') {
    return (
      <EditView
        item={editMode}
        onSave={handleSave}
        onCancel={() => { setEditMode(null); setTab(editMode ? 'detail' : 'home'); setSelected(null); }}
      />
    );
  }

  if (tab === 'settings') {
    return (
      <SettingsView
        onExport={handleExport}
        onImport={handleImport}
        onRefresh={refreshData}
        onBack={() => setTab('home')}
      />
    );
  }

  // Home Tab
  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="header-blur sticky top-0 z-30 px-6 py-4">
        <div className="header-container">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="logo-icon" title="Ganti Tema">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <h1 className="text-lg font-bold">Hipotesa</h1>
          </div>

          {/* Search */}
          <div className="search-bar">
            <Search className="w-4 h-4" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Cari jurnal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="clear-btn">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Topic Filter */}
      <div className="px-6 py-4">
        <div className="topic-filter">
          <button
            onClick={() => setFilterTopic('')}
            className={`filter-pill ${filterTopic === '' ? 'active' : ''}`}
          >
            Semua
          </button>
          {TOPICS.map(t => (
            <button
              key={t.key}
              onClick={() => setFilterTopic(filterTopic === t.key ? '' : t.key)}
              className={`filter-pill ${filterTopic === t.key ? 'active' : ''}`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <main className="px-6 pb-24">
        <div className="feed-container">
          {filteredHypotheses.length === 0 ? (
            <div className="empty-state">
              <div className="text-6xl mb-4">✨</div>
              <p className="font-medium mb-1">Belum ada jurnal</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {searchQuery ? 'Tidak ditemukan' : 'Mulai tulis jurnal pertamamu'}
              </p>
            </div>
          ) : (
            <div className="card-grid">
              {filteredHypotheses.map(h => (
                <ArticleCard key={h.id} item={h} onClick={() => handleSelect(h.id)} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button onClick={() => setTab('home')} className="nav-item">
          <Home className="w-5 h-5" />
          <span>Beranda</span>
        </button>

        <button onClick={() => setTab('new')} className="nav-new-btn">
          <Plus className="w-6 h-6" />
          <span>Baru</span>
        </button>

        <button onClick={() => setTab('settings')} className="nav-item">
          <Settings className="w-5 h-5" />
          <span>Pengaturan</span>
        </button>
      </nav>
    </div>
  );
}

// Settings View
function SettingsView({ onExport, onImport, onRefresh, onBack }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <header className="header-blur sticky top-0 z-30 px-6 py-4 flex items-center gap-4" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} className="p-2 rounded-lg" style={{ background: 'var(--bg)' }}>
          ←
        </button>
        <h1 className="text-lg font-bold">Pengaturan</h1>
      </header>

      <main className="px-6 py-6">
        <div className="settings-container">
          {/* Data Management */}
          <div className="settings-section">
            <h3 className="settings-title">💾 Data</h3>

            <button onClick={onExport} className="settings-btn">
              <Download className="w-5 h-5" />
              <span>Export Semua Jurnal</span>
            </button>

            <label className="settings-btn cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>Import Jurnal</span>
              <input type="file" accept=".json" onChange={onImport} className="hidden" />
            </label>

            <button onClick={onRefresh} className="settings-btn">
              <RefreshCw className="w-5 h-5" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ArticleCard({ item, onClick }) {
  const topic = TOPICS.find(t => t.key === item.topic);
  const authorAvatar = getAuthorAvatar(item.author);
  const sourceCount = item.sources?.length || 0;

  return (
    <div onClick={onClick} className="article-card">
      <div className="card-author">
        <div className="author-avatar" style={{ background: authorAvatar.bg }}>
          {authorAvatar.emoji}
        </div>
        <span className="author-name">Oleh {item.author || 'Anonim'}</span>
      </div>

      <h3 className="card-title">{item.title || 'Tanpa judul'}</h3>

      {item.content && (
        <p className="card-preview">{item.content.substring(0, 100)}...</p>
      )}

      <div className="card-footer">
        {topic && (
          <span className="topic-badge">
            {topic.emoji} {topic.label}
          </span>
        )}
        <div className="flex items-center gap-2">
          {sourceCount > 0 && (
            <span className="source-count">📚 {sourceCount}</span>
          )}
          <span className="card-date">
            {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>
    </div>
  );
}

function EditView({ item, onSave, onCancel }) {
  const [author, setAuthor] = useState(item?.author || '');
  const [content, setContent] = useState(item?.content || '');
  const [topic, setTopic] = useState(item?.topic || '');
  const [hypothesis, setHypothesis] = useState(item?.hypothesis || '');
  const [supporting, setSupporting] = useState(item?.supporting || '');
  const [conclusion, setConclusion] = useState(item?.conclusion || item?.counter || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content) return;
    setSaving(true);
    const title = content.substring(0, 50);
    await onSave({
      id: item?.id,
      title: item?.title || title,
      author, content, topic, hypothesis, supporting, conclusion,
      sources: item?.sources || []
    });
    setSaving(false);
  };

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onCancel} className="p-2 rounded-lg" style={{ background: 'var(--bg)' }}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="font-semibold">{item ? 'Edit' : 'Hipotesa Baru'}</h1>
        <div className="w-10" />
      </header>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--muted)' }}>Penulis</label>
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Nama kamu..." />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--muted)' }}>Konten *</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Tulis jurnal kamu..." rows={5} />
        </div>

        <div>
          <label className="text-sm font-medium block mb-3" style={{ color: 'var(--muted)' }}>Kategori</label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(t => (
              <button key={t.key} type="button" onClick={() => setTopic(topic === t.key ? '' : t.key)}
                className="topic-btn"
                style={{
                  background: topic === t.key ? 'var(--primary)' : 'var(--card)',
                  color: topic === t.key ? 'white' : 'var(--text)',
                  borderColor: topic === t.key ? 'var(--primary)' : 'var(--border)'
                }}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--muted)' }}>Hipotesa</label>
          <textarea value={hypothesis} onChange={e => setHypothesis(e.target.value)} placeholder="Hipotesa utama..." rows={3} />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--muted)' }}>Argumen Pendukung</label>
          <textarea value={supporting} onChange={e => setSupporting(e.target.value)} placeholder="Argumen pendukung..." rows={3} />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2" style={{ color: 'var(--muted)' }}>Kesimpulan</label>
          <textarea value={conclusion} onChange={e => setConclusion(e.target.value)} placeholder="Kesimpulan..." rows={3} />
        </div>

        <button type="submit" disabled={saving || !content}
          className="btn-primary w-full py-4 font-semibold" style={{ background: saving ? 'var(--muted)' : 'var(--primary)', color: 'white', borderRadius: '16px' }}>
          {saving ? 'Menyimpan...' : '💾 Simpan'}
        </button>
      </form>
    </div>
  );
}

function DetailView({ item, all, onEdit, onDelete, onTimeline, onRelated, onBack, onAddSource, onUpdateSource, onDeleteSource }) {
  const [showTimeline, setShowTimeline] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [timelineContent, setTimelineContent] = useState('');
  const [newSource, setNewSource] = useState({ title: '', url: '' });
  const [copied, setCopied] = useState(false);

  const topic = TOPICS.find(t => t.key === item.topic);
  const authorAvatar = getAuthorAvatar(item.author);
  const sources = item.sources || [];

  const handleShare = async () => {
    const text = [
      `📝 ${item.title || 'Tanpa judul'}`,
      `Oleh: ${item.author || 'Anonim'}`,
      '',
      item.content,
      item.hypothesis ? `\n📌 Hipotesa:\n${item.hypothesis}` : '',
      item.supporting ? `\n👍 Argumen:\n${item.supporting}` : '',
      item.conclusion || item.counter ? `\n✅ Kesimpulan:\n${item.conclusion || item.counter}` : '',
      '',
      '---',
      'Via Hipotesa - Gugah & Tika'
    ].filter(Boolean).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddSource = () => {
    if (newSource.title.trim()) {
      onAddSource({
        title: newSource.title.trim(),
        url: newSource.url.trim(),
        status: 'to-read',
        dateAdded: new Date().toISOString()
      });
      setNewSource({ title: '', url: '' });
    }
  };

  const cycleSourceStatus = (index) => {
    const s = sources[index];
    const next = s.status === 'to-read' ? 'reading' : s.status === 'reading' ? 'done' : 'to-read';
    onUpdateSource(index, { status: next });
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} className="p-2 rounded-lg" style={{ background: 'var(--bg)' }}>←</button>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-2 rounded-lg" style={{ background: 'var(--bg)' }}>✏️</button>
          <button onClick={onDelete} className="p-2 rounded-lg" style={{ background: '#FEE2E2' }}>🗑️</button>
        </div>
      </header>

      <main className="px-6 py-6">
        <div className="detail-container">
          <div className="flex items-center gap-3 mb-4">
            <div className="author-avatar-lg" style={{ background: authorAvatar.bg }}>
              {authorAvatar.emoji}
            </div>
            <div>
              <p className="font-semibold">{item.author || 'Anonim'}</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {topic && (
            <span className="topic-badge-lg">{topic.emoji} {topic.label}</span>
          )}

          <h1 className="detail-title">{item.title || 'Tanpa judul'}</h1>

          {item.content && <p className="detail-content">{item.content}</p>}

          {item.hypothesis && (
            <div className="detail-section">
              <h3 className="detail-section-title">📌 Hipotesa</h3>
              <p className="whitespace-pre-wrap">{item.hypothesis}</p>
            </div>
          )}

          {item.supporting && (
            <div className="detail-section">
              <h3 className="detail-section-title">👍 Argumen Pendukung</h3>
              <p className="whitespace-pre-wrap">{item.supporting}</p>
            </div>
          )}

          {(item.conclusion || item.counter) && (
            <div className="detail-section">
              <h3 className="detail-section-title">✅ Kesimpulan</h3>
              <p className="whitespace-pre-wrap">{item.conclusion || item.counter}</p>
            </div>
          )}

          {/* Sources Section */}
          <div className="detail-section">
            <button onClick={() => setShowSources(!showSources)} className="detail-section-title-btn">
              📚 Sumber ({sources.length}) {showSources ? '▲' : '▼'}
            </button>

            {showSources && (
              <div className="space-y-3">
                <div className="source-form">
                  <input value={newSource.title} onChange={(e) => setNewSource(p => ({ ...p, title: e.target.value }))} placeholder="Judul paper, buku, atau artikel..." className="text-sm" />
                  <input value={newSource.url} onChange={(e) => setNewSource(p => ({ ...p, url: e.target.value }))} placeholder="URL (opsional)" className="text-sm" />
                  <button onClick={handleAddSource} disabled={!newSource.title.trim()} className="btn-primary text-sm py-2">+ Tambah</button>
                </div>

                {sources.map((s, i) => {
                  const statusColors = { 'to-read': { bg: '#F1F5F9', color: '#64748B' }, reading: { bg: '#DBEAFE', color: '#3B82F6' }, done: { bg: '#D1FAE5', color: '#059669' } };
                  const sc = statusColors[s.status] || statusColors['to-read'];
                  const statusLabels = { 'to-read': '📖 Akan baca', reading: '📖 Dibaca', done: '✅ Selesai' };

                  return (
                    <div key={i} className="source-card">
                      <div className="flex items-start gap-3">
                        <span className="text-lg mt-0.5">📄</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{s.title}</p>
                          {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs source-link">🔗 {s.url.length > 40 ? s.url.substring(0, 40) + '...' : s.url}</a>}
                          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Ditambahkan {new Date(s.dateAdded).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => cycleSourceStatus(i)} className="source-status" style={{ background: sc.bg, color: sc.color }}>{statusLabels[s.status]}</button>
                        <button onClick={() => onDeleteSource(i)} className="source-delete">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {item.relatedIds?.length > 0 && (
            <div className="detail-section">
              <h3 className="detail-section-title">🔗 Terkait</h3>
              <div className="space-y-2">
                {item.relatedIds.map(id => {
                  const r = all.find(h => h.id === id);
                  return r && (
                    <button key={id} onClick={() => onRelated(id)} className="related-btn">
                      <p className="font-medium">{r.title || 'Tanpa judul'}</p>
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>{r.author || 'Anonim'}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="detail-section">
            <button onClick={() => setShowTimeline(!showTimeline)} className="detail-section-title-btn">
              📅 Updates ({item.timeline?.length || 0}) {showTimeline ? '▲' : '▼'}
            </button>

            {showTimeline && (
              <div className="space-y-3">
                <textarea value={timelineContent} onChange={e => setTimelineContent(e.target.value)} placeholder="Tambah update..." rows={2} className="text-sm" />
                <button onClick={async () => { if (timelineContent.trim()) { await onTimeline(timelineContent); setTimelineContent(''); } }} className="btn-primary py-2 px-4 text-sm font-medium" style={{ background: 'var(--primary)', color: 'white', borderRadius: '12px' }}>Simpan</button>
                {item.timeline?.map(t => (
                  <div key={t.id} className="timeline-item">
                    <p className="text-sm">{t.content}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 left-6 right-6">
        <button onClick={handleShare} className="share-btn" style={{ background: copied ? '#22C55E' : 'var(--primary)' }}>
          {copied ? '✓ Tersalin!' : '📤 Bagikan'}
        </button>
      </div>
    </div>
  );
}

export default App;
