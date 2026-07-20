import { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Plus, X } from 'lucide-react';

function AppContent() {
  const { hypotheses, createHypothesis, updateHypothesis, deleteHypothesis, addTimeline, getRandomHypothesis, getHypothesisById } = useApp();

  const [tab, setTab] = useState('list');
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(null);

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
    if (h) { setSelected(h); }
  }, [getHypothesisById]);

  const handleRandom = useCallback(async () => {
    const r = await getRandomHypothesis();
    if (r) { setSelected(r); setTab('detail'); }
  }, [getRandomHypothesis]);

  // Detail View
  if (tab === 'detail' && selected) {
    return <DetailView
      item={selected}
      all={hypotheses}
      onEdit={() => { setEditMode(selected); setTab('edit'); }}
      onDelete={handleDelete}
      onTimeline={handleTimeline}
      onRelated={handleRelated}
      onRandom={handleRandom}
      onBack={() => { setSelected(null); setTab('list'); }}
    />;
  }

  // Edit View
  if (tab === 'edit' || tab === 'new') {
    return <EditView
      item={editMode}
      all={hypotheses}
      onSave={handleSave}
      onCancel={() => { setEditMode(null); setTab(editMode ? 'detail' : 'list'); setSelected(null); }}
    />;
  }

  // List View
  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-30 px-6 py-5" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hipotesa</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{hypotheses.length} items</p>
          </div>
          <button onClick={handleRandom} className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>
            🎲
          </button>
        </div>
      </header>

      <main className="px-6 py-6">
        {hypotheses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <p className="font-semibold mb-2">Belum ada jurnal</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Tekan + untuk membuat</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hypotheses.map((h, i) => (
              <ItemCard key={h.id} item={h} onClick={() => handleSelect(h.id)} />
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0" style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <button onClick={() => setTab('new')} className="w-full py-4 flex items-center justify-center gap-3 font-semibold" style={{ color: 'white', background: 'var(--primary)' }}>
          <Plus className="w-5 h-5" /> New
        </button>
      </div>
    </div>
  );
}

function ItemCard({ item, onClick }) {
  const badge = {
    'needs-research': { label: 'Research', class: 'badge-blue' },
    'proven': { label: 'Proven', class: 'badge-green' },
    'broken': { label: 'Broken', class: 'badge-rose' }
  }[item.status] || { label: 'Research', class: 'badge-blue' };

  return (
    <div className="card p-5 cursor-pointer animate" onClick={onClick}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: 'var(--bg)' }}>
          {(item.title || 'U')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1 line-clamp-2">{item.title || 'Untitled'}</h3>
          <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>{item.author || 'Anonim'}</p>
          <div className="flex items-center gap-2">
            <span className={`badge ${badge.class}`}>{badge.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditView({ item, all, onSave, onCancel }) {
  const [author, setAuthor] = useState(item?.author || '');
  const [content, setContent] = useState(item?.content || '');
  const [hypothesis, setHypothesis] = useState(item?.hypothesis || '');
  const [supporting, setSupporting] = useState(item?.supporting || '');
  const [counter, setCounter] = useState(item?.counter || '');
  const [status, setStatus] = useState(item?.status || 'needs-research');
  const [sources, setSources] = useState(item?.sources || []);
  const [relatedIds, setRelatedIds] = useState(item?.relatedIds || []);
  const [showHak, setShowHak] = useState(!!(item?.hypothesis || item?.supporting || item?.counter));
  const [showSources, setShowSources] = useState(false);
  const [showRelated, setShowRelated] = useState(false);
  const [newSource, setNewSource] = useState({ title: '', author: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content && !hypothesis) return;
    setSaving(true);
    const title = (content || hypothesis).substring(0, 50);
    await onSave({
      id: item?.id,
      title: item?.title || title,
      author, content, hypothesis, supporting, counter, status, sources, relatedIds
    });
    setSaving(false);
  };

  const addSource = () => {
    if (!newSource.title) return;
    setSources(prev => [...prev, { id: Date.now(), ...newSource }]);
    setNewSource({ title: '', author: '' });
  };

  const removeSource = (id) => setSources(prev => prev.filter(s => s.id !== id));
  const toggleRelated = (id) => setRelatedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onCancel} className="p-2 rounded-lg" style={{ background: 'var(--bg)' }}>
          <X className="w-5 h-5" />
        </button>
        <h1 className="font-semibold">{item ? 'Edit' : 'New'}</h1>
        <div className="w-10" />
      </header>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted)' }}>Author</label>
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Name..." />
        </div>

        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted)' }}>Content</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write..." rows={5} />
        </div>

        <button type="button" onClick={() => setShowHak(!showHak)} className="w-full py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--bg)' }}>
          H • A • K Structure {showHak ? '▲' : '▼'}
        </button>

        {showHak && (
          <div className="space-y-4 pl-4">
            <div>
              <label className="text-xs font-medium block mb-2" style={{ color: '#8B5CF6' }}>H - Hypothesis</label>
              <textarea value={hypothesis} onChange={e => setHypothesis(e.target.value)} placeholder="..." rows={2} className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-2" style={{ color: '#22C55E' }}>A - Arguments</label>
              <textarea value={supporting} onChange={e => setSupporting(e.target.value)} placeholder="..." rows={2} className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium block mb-2" style={{ color: '#F59E0B' }}>K - Counter</label>
              <textarea value={counter} onChange={e => setCounter(e.target.value)} placeholder="..." rows={2} className="text-sm" />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted)' }}>Status</label>
          <div className="grid grid-cols-3 gap-2">
            {['needs-research', 'proven', 'broken'].map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className="py-3 rounded-xl text-center text-sm font-medium"
                style={{ background: status === s ? 'var(--primary)' : 'var(--bg)', color: status === s ? 'white' : 'var(--text)' }}>
                {{ 'needs-research': '🔬 Research', proven: '✅ Proven', broken: '❌ Broken' }[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4">
          <button type="button" onClick={() => setShowSources(!showSources)} className="w-full flex items-center justify-between text-sm font-medium">
            📚 Sources ({sources.length}) {showSources ? '▲' : '▼'}
          </button>
          {showSources && (
            <div className="mt-3 space-y-2">
              {sources.map(s => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--bg)' }}>
                  <span className="text-sm">{s.title}</span>
                  <button onClick={() => removeSource(s.id)} className="text-xs px-2 py-1 rounded" style={{ color: '#E11D48', background: '#FFE4E6' }}>✕</button>
                </div>
              ))}
              <div className="space-y-2 pt-2">
                <input value={newSource.title} onChange={e => setNewSource(p => ({...p, title: e.target.value}))} placeholder="Title..." className="text-sm" />
                <input value={newSource.author} onChange={e => setNewSource(p => ({...p, author: e.target.value}))} placeholder="Author" className="text-sm" />
                <button type="button" onClick={addSource} className="w-full py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--primary)', color: 'white' }}>
                  + Add Source
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card p-4">
          <button type="button" onClick={() => setShowRelated(!showRelated)} className="w-full flex items-center justify-between text-sm font-medium">
            🔗 Related ({relatedIds.length}) {showRelated ? '▲' : '▼'}
          </button>
          {showRelated && all.length > 0 && (
            <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
              {all.filter(h => h.id !== item?.id).map(h => (
                <label key={h.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer" style={{ background: 'var(--bg)' }}>
                  <input type="checkbox" checked={relatedIds.includes(h.id)} onChange={() => toggleRelated(h.id)} className="w-4 h-4" />
                  <span className="text-sm truncate">{h.title || 'Untitled'}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={saving || (!content && !hypothesis)} className="btn btn-primary w-full py-4">
          {saving ? 'Saving...' : '💾 Save'}
        </button>
      </form>
    </div>
  );
}

function DetailView({ item, all, onEdit, onDelete, onTimeline, onRelated, onRandom, onBack }) {
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineContent, setTimelineContent] = useState('');
  const [copied, setCopied] = useState(false);

  const badge = {
    'needs-research': { label: 'Research', class: 'badge-blue' },
    'proven': { label: 'Proven', class: 'badge-green' },
    'broken': { label: 'Broken', class: 'badge-rose' }
  }[item.status] || { label: 'Research', class: 'badge-blue' };

  const relatedItems = item.relatedIds?.map(id => all.find(h => h.id === id)).filter(Boolean) || [];

  const handleShare = async () => {
    const text = [
      `📝 ${item.title || 'Untitled'}`,
      `Author: ${item.author || 'Anonim'}`,
      `Status: ${badge.label}`,
      '',
      item.content,
      '',
      '---',
      'Via Hipotesa'
    ].filter(Boolean).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between" style={{ background: 'var(--bg)' }}>
        <button onClick={onBack} className="p-2 rounded-lg" style={{ background: 'var(--card)' }}>
          ←
        </button>
        <div className="flex gap-2">
          <button onClick={onRandom} className="p-2 rounded-lg" style={{ background: 'var(--card)' }}>🎲</button>
          <button onClick={onEdit} className="p-2 rounded-lg" style={{ background: 'var(--card)' }}>✏️</button>
          <button onClick={onDelete} className="p-2 rounded-lg" style={{ background: '#FFE4E6', color: '#E11D48' }}>🗑️</button>
        </div>
      </header>

      <main className="px-6 py-6">
        <div className="mb-6">
          <span className={`badge ${badge.class} mb-3`}>{badge.label}</span>
          <h1 className="text-2xl font-bold mb-2">{item.title || 'Untitled'}</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {item.author || 'Anonim'} • {new Date(item.createdAt).toLocaleDateString('id-ID')}
          </p>
        </div>

        {item.content && <p className="mb-6 leading-relaxed" style={{ color: 'var(--muted)' }}>{item.content}</p>}

        {(item.hypothesis || item.supporting || item.counter) && (
          <div className="space-y-4 mb-6">
            {item.hypothesis && (
              <div className="card p-4 border-l-4" style={{ borderColor: '#8B5CF6' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#8B5CF6' }}>H - Hypothesis</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{item.hypothesis}</p>
              </div>
            )}
            {item.supporting && (
              <div className="card p-4 border-l-4" style={{ borderColor: '#22C55E' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#22C55E' }}>A - Arguments</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{item.supporting}</p>
              </div>
            )}
            {item.counter && (
              <div className="card p-4 border-l-4" style={{ borderColor: '#F59E0B' }}>
                <p className="text-xs font-bold mb-1" style={{ color: '#F59E0B' }}>K - Counter</p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>{item.counter}</p>
              </div>
            )}
          </div>
        )}

        {item.sources?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">📚 Sources</h3>
            <div className="space-y-2">
              {item.sources.map(s => (
                <div key={s.id} className="card p-3">
                  <p className="text-sm font-medium">{s.title}</p>
                  {s.author && <p className="text-xs" style={{ color: 'var(--muted)' }}>{s.author}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {relatedItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">🔗 Related</h3>
            <div className="space-y-2">
              {relatedItems.map(r => (
                <button key={r.id} onClick={() => onRelated(r.id)} className="card card-hover p-4 w-full text-left">
                  <p className="text-sm font-medium">{r.title || 'Untitled'}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{r.author || 'Anonim'}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <button onClick={() => setShowTimeline(!showTimeline)} className="text-sm font-semibold mb-3">
            📅 Updates ({item.timeline?.length || 0}) {showTimeline ? '▲' : '▼'}
          </button>

          {showTimeline && (
            <div className="space-y-3 mb-4">
              <textarea value={timelineContent} onChange={e => setTimelineContent(e.target.value)} placeholder="Add update..." rows={2} className="text-sm" />
              <button onClick={async () => {
                if (timelineContent.trim()) {
                  await onTimeline(timelineContent);
                  setTimelineContent('');
                }
              }} className="btn btn-primary py-2 text-sm">Save</button>
            </div>
          )}

          {item.timeline?.map(t => (
            <div key={t.id} className="pl-4 border-l-2 mb-3" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{t.content}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {new Date(t.date).toLocaleDateString('id-ID')}
              </p>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0" style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleShare} className="w-full py-4 font-semibold" style={{ background: copied ? '#22C55E' : 'var(--primary)', color: 'white' }}>
          {copied ? '✓ Copied!' : '📤 Share'}
        </button>
      </div>
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
