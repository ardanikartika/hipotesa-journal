import { useState, useCallback } from 'react';
import { useApp } from './context/AppContext';
import { Plus, X } from 'lucide-react';

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
    if (h) setSelected(h);
  }, [getHypothesisById]);

  const handleRandom = useCallback(async () => {
    const r = await getRandomHypothesis();
    if (r) { setSelected(r); setTab('detail'); }
  }, [getRandomHypothesis]);

  if (tab === 'detail' && selected) {
    return (
      <DetailView
        item={selected}
        all={hypotheses}
        onEdit={() => { setEditMode(selected); setTab('edit'); }}
        onDelete={handleDelete}
        onTimeline={handleTimeline}
        onRelated={handleRelated}
        onRandom={handleRandom}
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
    <div className="min-h-screen pb-24" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-30 px-6 py-5" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hipotesa</h1>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{hypotheses.length} jurnal</p>
          </div>
          <button onClick={handleRandom} className="p-3 rounded-xl" style={{ background: 'var(--bg)' }}>🎲</button>
        </div>
      </header>

      <main className="px-6 py-6">
        {hypotheses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <p className="font-semibold mb-2">Belum ada jurnal</p>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Tekan tombol + untuk membuat</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hypotheses.map(h => (
              <ItemCard key={h.id} item={h} onClick={() => handleSelect(h.id)} />
            ))}
          </div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0" style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <button onClick={() => setTab('new')} className="w-full py-4 flex items-center justify-center gap-3 font-semibold" style={{ color: 'white', background: 'var(--primary)' }}>
          <Plus className="w-5 h-5" /> Baru
        </button>
      </div>
    </div>
  );
}

function ItemCard({ item, onClick }) {
  const topic = TOPICS.find(t => t.key === item.topic);

  return (
    <div onClick={onClick} className="card p-5 cursor-pointer animate" style={{ animation: 'fadeUp 0.3s ease' }}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: 'var(--bg)' }}>
          {topic ? topic.emoji : (item.title || 'U')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1 line-clamp-2">{item.title || 'Tanpa judul'}</h3>
          <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>{item.author || 'Anonim'}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {topic && <span className="badge badge-outline">{topic.emoji} {topic.label}</span>}
          </div>
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
      author, content, topic, hypothesis, supporting, conclusion
    });
    setSaving(false);
  };

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--bg)' }}>
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between" style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onCancel} className="p-2 rounded-lg" style={{ background: 'var(--bg)' }}><X className="w-5 h-5" /></button>
        <h1 className="font-semibold">{item ? 'Edit' : 'Baru'}</h1>
        <div className="w-10" />
      </header>

      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted)' }}>Author</label>
          <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Nama..." />
        </div>

        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted)' }}>Content</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Tulis jurnal kamu..." rows={6} />
        </div>

        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted)' }}>Topik</label>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(t => (
              <button key={t.key} type="button" onClick={() => setTopic(topic === t.key ? '' : t.key)}
                className="px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  background: topic === t.key ? 'var(--primary)' : 'var(--bg)',
                  color: topic === t.key ? 'white' : 'var(--muted)'
                }}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted)' }}>Hipotesa</label>
          <textarea value={hypothesis} onChange={e => setHypothesis(e.target.value)} placeholder="Hipotesa utama..." rows={3} />
        </div>

        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted)' }}>Argumen Pendukung</label>
          <textarea value={supporting} onChange={e => setSupporting(e.target.value)} placeholder="Argumen pendukung..." rows={3} />
        </div>

        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted)' }}>Kesimpulan</label>
          <textarea value={conclusion} onChange={e => setConclusion(e.target.value)} placeholder="Kesimpulan..." rows={3} />
        </div>

        <button type="submit" disabled={saving || !content}
          className="btn btn-primary w-full py-4" style={{ background: saving ? 'var(--muted)' : 'var(--primary)' }}>
          {saving ? 'Menyimpan...' : '💾 Simpan'}
        </button>
      </form>
    </div>
  );
}

function DetailView({ item, all, onEdit, onDelete, onTimeline, onRelated, onRandom, onBack }) {
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineContent, setTimelineContent] = useState('');
  const [copied, setCopied] = useState(false);

  const topic = TOPICS.find(t => t.key === item.topic);
  const topicLabel = {
    philosophy: 'Filsafat', economics: 'Ekonomi', business: 'Bisnis', religion: 'Agama',
    science: 'Sains', tech: 'Teknologi', politics: 'Politik', art: 'Seni',
    health: 'Kesehatan', education: 'Pendidikan', life: 'Kehidupan', parenting: 'Parenting', other: 'Lainnya'
  };

  const relatedItems = item.relatedIds?.map(id => all.find(h => h.id === id)).filter(Boolean) || [];

  const handleShare = async () => {
    const text = [
      `📝 ${item.title || 'Tanpa judul'}`,
      `Author: ${item.author || 'Anonim'}`,
      topic ? `Topik: ${topicLabel[topic.key] || topic.key}` : '',
      '',
      item.content,
      item.hypothesis ? `\n📌 Hipotesa:\n${item.hypothesis}` : '',
      item.supporting ? `\n👍 Argumen:\n${item.supporting}` : '',
      item.conclusion || item.counter ? `\n✅ Kesimpulan:\n${item.conclusion || item.counter}` : '',
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
      <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between" style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <button onClick={onBack} className="p-2 rounded-lg" style={{ background: 'var(--card)' }}>←</button>
        <div className="flex gap-2">
          <button onClick={onRandom} className="p-2 rounded-lg" style={{ background: 'var(--card)' }}>🎲</button>
          <button onClick={onEdit} className="p-2 rounded-lg" style={{ background: 'var(--card)' }}>✏️</button>
          <button onClick={onDelete} className="p-2 rounded-lg" style={{ background: '#FFE4E6', color: '#E11D48' }}>🗑️</button>
        </div>
      </header>

      <main className="px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            {topic && <span className="badge badge-outline">{topic.emoji} {topic.label}</span>}
          </div>
          <h1 className="text-2xl font-bold mb-2">{item.title || 'Tanpa judul'}</h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {item.author || 'Anonim'} • {new Date(item.createdAt).toLocaleDateString('id-ID')}
          </p>
        </div>

        {item.content && <p className="mb-6 leading-relaxed" style={{ color: 'var(--muted)' }}>{item.content}</p>}

        {item.hypothesis && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">📌 Hipotesa</h3>
            <div className="card p-4">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{item.hypothesis}</p>
            </div>
          </div>
        )}

        {item.supporting && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">👍 Argumen Pendukung</h3>
            <div className="card p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--muted)' }}>{item.supporting}</p>
            </div>
          </div>
        )}

        {(item.conclusion || item.counter) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2">✅ Kesimpulan</h3>
            <div className="card p-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--muted)' }}>{item.conclusion || item.counter}</p>
            </div>
          </div>
        )}

        {relatedItems.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">🔗 Related</h3>
            <div className="space-y-2">
              {relatedItems.map(r => (
                <button key={r.id} onClick={() => onRelated(r.id)} className="card card-hover p-4 w-full text-left">
                  <p className="text-sm font-medium">{r.title || 'Tanpa judul'}</p>
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
              <textarea value={timelineContent} onChange={e => setTimelineContent(e.target.value)}
                placeholder="Tambah update..." rows={2} className="text-sm" />
              <button onClick={async () => {
                if (timelineContent.trim()) {
                  await onTimeline(timelineContent);
                  setTimelineContent('');
                }
              }} className="btn btn-primary py-2 text-sm">Simpan</button>
            </div>
          )}

          {item.timeline?.map(t => (
            <div key={t.id} className="pl-4 border-l-2 mb-3" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{t.content}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{new Date(t.date).toLocaleDateString('id-ID')}</p>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }}>
        <button onClick={handleShare} className="w-full py-4 font-semibold"
          style={{ background: copied ? '#22C55E' : 'var(--primary)', color: 'white' }}>
          {copied ? '✓ Tersalin!' : '📤 Bagikan'}
        </button>
      </div>
    </div>
  );
}

export default App;
