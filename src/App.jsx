import { useState, useCallback } from 'react';
import { useApp } from './context/AppContext';
import { Plus, X, Search, Download, Upload, Sparkles } from 'lucide-react';
import api from './utils/api';

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
  const { hypotheses, createHypothesis, updateHypothesis, deleteHypothesis, addTimeline, getHypothesisById, refreshData } = useApp();
  const [tab, setTab] = useState('list');
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
    setTab('list');
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
      setTab('list');
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

  if (tab === 'detail' && selected) {
    return (
      <DetailView
        item={selected}
        all={hypotheses}
        onEdit={() => { setEditMode(selected); setTab('edit'); }}
        onDelete={handleDelete}
        onTimeline={handleTimeline}
        onRelated={handleRelated}
        onBack={() => { setSelected(null); setTab('list'); }}
      />
    );
  }

  if (tab === 'edit' || tab === 'new') {
    return (
      <EditView
        item={editMode}
        onSave={handleSave}
        onCancel={() => { setEditMode(null); setTab(editMode ? 'detail' : 'list'); setSelected(null); }}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="header-blur sticky top-0 z-30 px-6 py-4">
        <div className="header-container">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="logo-icon">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Hipotesa</h1>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Gugah & Tika</p>
            </div>
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

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="icon-btn" title="Export">
              <Download className="w-5 h-5" />
            </button>
            <label className="icon-btn cursor-pointer" title="Import">
              <Upload className="w-5 h-5" />
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
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

      {/* FAB */}
      <button onClick={() => setTab('new')} className="fab-button">
        <Plus className="w-5 h-5" />
        <span>Hipotesa Baru</span>
      </button>
    </div>
  );
}

function ArticleCard({ item, onClick }) {
  const topic = TOPICS.find(t => t.key === item.topic);
  const firstLetter = (item.author || 'A')[0].toUpperCase();

  return (
    <div onClick={onClick} className="article-card">
      {/* Author Avatar */}
      <div className="card-author">
        <div className="author-avatar">{firstLetter}</div>
        <span className="author-name">Oleh {item.author || 'Anonim'}</span>
      </div>

      {/* Title */}
      <h3 className="card-title">{item.title || 'Tanpa judul'}</h3>

      {/* Preview */}
      {item.content && (
        <p className="card-preview">{item.content.substring(0, 100)}...</p>
      )}

      {/* Footer */}
      <div className="card-footer">
        {topic && (
          <span className="topic-badge">
            {topic.emoji} {topic.label}
          </span>
        )}
        <span className="card-date">
          {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </span>
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
      author, content, topic, hypothesis, supporting, conclusion
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

function DetailView({ item, all, onEdit, onDelete, onTimeline, onRelated, onBack }) {
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineContent, setTimelineContent] = useState('');
  const [copied, setCopied] = useState(false);

  const topic = TOPICS.find(t => t.key === item.topic);
  const firstLetter = (item.author || 'A')[0].toUpperCase();

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
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <div className="author-avatar-lg">{firstLetter}</div>
            <div>
              <p className="font-medium">{item.author || 'Anonim'}</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Topic */}
          {topic && (
            <span className="topic-badge-lg">
              {topic.emoji} {topic.label}
            </span>
          )}

          {/* Title */}
          <h1 className="detail-title">{item.title || 'Tanpa judul'}</h1>

          {/* Content */}
          {item.content && (
            <p className="detail-content">{item.content}</p>
          )}

          {/* Hypothesis */}
          {item.hypothesis && (
            <div className="detail-section">
              <h3 className="detail-section-title">📌 Hipotesa</h3>
              <p className="whitespace-pre-wrap">{item.hypothesis}</p>
            </div>
          )}

          {/* Supporting */}
          {item.supporting && (
            <div className="detail-section">
              <h3 className="detail-section-title">👍 Argumen Pendukung</h3>
              <p className="whitespace-pre-wrap">{item.supporting}</p>
            </div>
          )}

          {/* Conclusion */}
          {(item.conclusion || item.counter) && (
            <div className="detail-section">
              <h3 className="detail-section-title">✅ Kesimpulan</h3>
              <p className="whitespace-pre-wrap">{item.conclusion || item.counter}</p>
            </div>
          )}

          {/* Related */}
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

          {/* Timeline */}
          <div className="detail-section">
            <button onClick={() => setShowTimeline(!showTimeline)} className="detail-section-title-btn">
              📅 Updates ({item.timeline?.length || 0}) {showTimeline ? '▲' : '▼'}
            </button>

            {showTimeline && (
              <div className="space-y-3">
                <textarea
                  value={timelineContent}
                  onChange={e => setTimelineContent(e.target.value)}
                  placeholder="Tambah update..."
                  rows={2}
                  className="text-sm"
                />
                <button
                  onClick={async () => {
                    if (timelineContent.trim()) {
                      await onTimeline(timelineContent);
                      setTimelineContent('');
                    }
                  }}
                  className="btn-primary py-2 px-4 text-sm font-medium"
                  style={{ background: 'var(--primary)', color: 'white', borderRadius: '12px' }}
                >
                  Simpan
                </button>

                {item.timeline?.map(t => (
                  <div key={t.id} className="timeline-item">
                    <p className="text-sm">{t.content}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Share Button */}
      <div className="fixed bottom-6 left-6 right-6">
        <button onClick={handleShare} className="share-btn" style={{ background: copied ? '#22C55E' : 'var(--primary)' }}>
          {copied ? '✓ Tersalin!' : '📤 Bagikan'}
        </button>
      </div>
    </div>
  );
}

export default App;
