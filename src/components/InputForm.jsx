import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, User, Plus, Minus, Check } from 'lucide-react';
import VoiceInput from './VoiceInput';
import { generateTitle } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';

export default function InputForm({ onSave, all = [], edit }) {
  const [author, setAuthor] = useState(edit?.author || '');
  const [content, setContent] = useState(edit?.content || '');
  const [hypothesis, setHypothesis] = useState(edit?.hypothesis || '');
  const [supporting, setSupporting] = useState(edit?.supporting || '');
  const [counter, setCounter] = useState(edit?.counter || '');
  const [status, setStatus] = useState(edit?.status || 'needs-research');
  const [relatedIds, setRelatedIds] = useState(edit?.relatedIds || []);
  const [sources, setSources] = useState(edit?.sources || []);
  const [showHAK, setShowHAK] = useState(!!(edit?.hypothesis || edit?.supporting || edit?.counter));
  const [showSources, setShowSources] = useState(false);
  const [showRelated, setShowRelated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSource, setNewSource] = useState({ title: '', author: '', url: '' });

  const autoSaveRef = useRef(null);
  const title = edit?.title || generateTitle(content);

  useEffect(() => {
    if (!edit || (!author && !content)) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    setSaved(true);
    autoSaveRef.current = setTimeout(() => setSaved(false), 2000);
    return () => clearTimeout(autoSaveRef.current);
  }, [author, content, hypothesis, supporting, counter, status, edit]);

  const handleVoice = useCallback((text) => {
    setContent(prev => prev ? `${prev} ${text}` : text);
  }, []);

  const handleAutoStructure = () => {
    const lines = content.split('\n');
    let section = '';
    const h = [], a = [], k = [];
    lines.forEach(line => {
      const u = line.toUpperCase().trim();
      if (u.startsWith('H:')) { section = 'h'; const i = line.indexOf(':'); if (i >= 0) h.push(line.substring(i+1).trim()); }
      else if (u.startsWith('A:') || u.startsWith('ARG')) { section = 'a'; const i = line.indexOf(':'); if (i >= 0) a.push(line.substring(i+1).trim()); }
      else if (u.startsWith('K:') || u.startsWith('KON')) { section = 'k'; const i = line.indexOf(':'); if (i >= 0) k.push(line.substring(i+1).trim()); }
      else if (section === 'h' && line.trim()) h.push(line);
      else if (section === 'a' && line.trim()) a.push(line);
      else if (section === 'k' && line.trim()) k.push(line);
      else if (!section && line.trim()) { section = 'h'; h.push(line); }
    });
    setHypothesis(h.join('\n').trim());
    setSupporting(a.join('\n').trim());
    setCounter(k.join('\n').trim());
    setShowHAK(true);
  };

  const addSource = () => {
    if (!newSource.title.trim()) return;
    setSources(prev => [...prev, { id: uuidv4(), ...newSource, dateAdded: new Date().toISOString() }]);
    setNewSource({ title: '', author: '', url: '' });
  };

  const removeSource = (id) => setSources(prev => prev.filter(s => s.id !== id));
  const toggleRelated = (id) => setRelatedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !hypothesis.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: edit?.id, title, author: author.trim(), content: content.trim(),
        hypothesis: hypothesis.trim(), supporting: supporting.trim(), counter: counter.trim(),
        status, relatedIds, sources
      });
      if (!edit) {
        setAuthor(''); setContent(''); setHypothesis(''); setSupporting(''); setCounter('');
        setStatus('needs-research'); setRelatedIds([]); setSources([]); setShowHAK(false);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { key: 'needs-research', label: 'Research', icon: '🔬' },
    { key: 'proven', label: 'Proven', icon: '✅' },
    { key: 'broken', label: 'Broken', icon: '❌' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Author */}
      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--warm-gray)' }}>
          <User className="w-3 h-3 inline mr-1" />Author
        </label>
        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Name..." />
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium" style={{ color: 'var(--warm-gray)' }}>Content</label>
          <VoiceInput onTranscript={handleVoice} />
        </div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your thoughts..." rows={5} />
      </div>

      {/* Auto Structure */}
      <button type="button" onClick={handleAutoStructure}
        className="w-full py-4 rounded-2xl border border-dashed flex items-center justify-center gap-2 text-sm font-medium"
        style={{ borderColor: 'var(--charcoal)', color: 'var(--charcoal)', background: 'var(--cream-dark)' }}>
        <Sparkles className="w-4 h-4" /> Auto Structure (H • A • K)
      </button>

      {/* H-A-K */}
      {showHAK && (
        <div className="space-y-4">
          <button type="button" onClick={() => setShowHAK(false)} className="flex items-center justify-between w-full p-4 rounded-2xl" style={{ background: 'var(--warm-white)', border: '1px solid var(--border)' }}>
            <span className="font-medium text-sm">Structure</span>
            <Minus className="w-4 h-4" />
          </button>

          <div className="space-y-4 pl-4">
            {/* H */}
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium" style={{ color: '#8B5CF6' }}>
                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center">H</span>
                Hypothesis
              </label>
              <textarea value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} placeholder="Main hypothesis..." rows={2} className="text-sm" />
            </div>
            {/* A */}
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium" style={{ color: '#22C55E' }}>
                <span className="w-6 h-6 rounded-lg bg-green-100 text-green-600 text-xs font-bold flex items-center justify-center">A</span>
                Arguments
              </label>
              <textarea value={supporting} onChange={(e) => setSupporting(e.target.value)} placeholder="Supporting..." rows={2} className="text-sm" />
            </div>
            {/* K */}
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-medium" style={{ color: '#F59E0B' }}>
                <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center">K</span>
                Counter
              </label>
              <textarea value={counter} onChange={(e) => setCounter(e.target.value)} placeholder="Counter..." rows={2} className="text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div>
        <label className="text-xs font-medium mb-3 block" style={{ color: 'var(--warm-gray)' }}>Status</label>
        <div className="grid grid-cols-3 gap-3">
          {statusOptions.map(opt => (
            <button key={opt.key} type="button" onClick={() => setStatus(opt.key)}
              className="p-4 rounded-2xl text-center transition-all"
              style={{
                background: status === opt.key ? 'var(--charcoal)' : 'var(--cream-dark)',
                color: status === opt.key ? 'var(--cream)' : 'var(--warm-gray)'
              }}>
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="text-xs font-medium">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div className="card p-5">
        <button type="button" onClick={() => setShowSources(!showSources)} className="w-full flex items-center justify-between">
          <span className="font-medium text-sm">Sources ({sources.length})</span>
          {showSources ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>

        {showSources && (
          <div className="mt-4 space-y-3">
            {sources.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--cream-dark)' }}>
                <div>
                  <p className="text-sm font-medium">{s.title}</p>
                  {s.author && <p className="text-xs" style={{ color: 'var(--light-gray)' }}>{s.author}</p>}
                </div>
                <button onClick={() => removeSource(s.id)} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#F43F5E', background: 'rgba(244,63,94,0.1)' }}>Remove</button>
              </div>
            ))}
            <div className="space-y-2 pt-2">
              <input type="text" value={newSource.title} onChange={(e) => setNewSource(p => ({...p, title: e.target.value}))} placeholder="Title..." className="text-sm" />
              <input type="text" value={newSource.author} onChange={(e) => setNewSource(p => ({...p, author: e.target.value}))} placeholder="Author" className="text-sm" />
              <button type="button" onClick={addSource} disabled={!newSource.title.trim()}
                className="w-full py-3 rounded-xl text-sm font-medium" style={{ background: 'var(--cream-dark)', color: 'var(--charcoal)' }}>
                + Add Source
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Related */}
      <div className="card p-5">
        <button type="button" onClick={() => setShowRelated(!showRelated)} className="w-full flex items-center justify-between">
          <span className="font-medium text-sm">Related ({relatedIds.length})</span>
          {showRelated ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>

        {showRelated && all.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {all.filter(h => h.id !== edit?.id).map(h => (
              <label key={h.id} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer" style={{ background: 'var(--cream-dark)' }}>
                <input type="checkbox" checked={relatedIds.includes(h.id)} onChange={() => toggleRelated(h.id)} className="w-4 h-4 rounded" />
                <span className="text-sm truncate flex-1">{h.title || 'Untitled'}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button type="submit" disabled={saving || (!content.trim() && !hypothesis.trim())}
        className="btn btn-primary w-full py-5 text-base">
        {saving ? 'Saving...' : edit ? 'Update' : '💾 Save'}
      </button>

      {/* Saved indicator */}
      {edit && saved && (
        <p className="text-center text-sm flex items-center justify-center gap-1" style={{ color: '#22C55E' }}>
          <Check className="w-4 h-4" /> Saved
        </p>
      )}
    </form>
  );
}
