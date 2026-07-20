import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, User, Plus, Minus, Check } from 'lucide-react';
import VoiceInput from './VoiceInput';
import { generateTitle } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';

export default function InputForm({ onSave, existingHypotheses = [], editMode }) {
  const [author, setAuthor] = useState(editMode?.author || '');
  const [content, setContent] = useState(editMode?.content || '');
  const [hypothesis, setHypothesis] = useState(editMode?.hypothesis || '');
  const [supporting, setSupporting] = useState(editMode?.supporting || '');
  const [counter, setCounter] = useState(editMode?.counter || '');
  const [status, setStatus] = useState(editMode?.status || 'needs-research');
  const [relatedIds, setRelatedIds] = useState(editMode?.relatedIds || []);
  const [sources, setSources] = useState(editMode?.sources || []);
  const [showStructured, setShowStructured] = useState(!!(editMode?.hypothesis || editMode?.supporting || editMode?.counter));
  const [showSources, setShowSources] = useState(false);
  const [showRelated, setShowRelated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [newSource, setNewSource] = useState({ title: '', author: '', url: '', type: 'article' });

  const autoSaveRef = useRef(null);
  const title = editMode?.title || generateTitle(content);

  // Auto-save indicator
  useEffect(() => {
    if (!editMode || (!author && !content)) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    setAutoSave(true);
    autoSaveRef.current = setTimeout(() => setAutoSave(false), 2000);
    return () => clearTimeout(autoSaveRef.current);
  }, [author, content, hypothesis, supporting, counter, status, editMode]);

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
    setShowStructured(true);
  };

  const addSource = () => {
    if (!newSource.title.trim()) return;
    setSources(prev => [...prev, { id: uuidv4(), ...newSource, dateAdded: new Date().toISOString() }]);
    setNewSource({ title: '', author: '', url: '', type: 'article' });
  };

  const removeSource = (id) => setSources(prev => prev.filter(s => s.id !== id));

  const toggleRelated = (id) => {
    setRelatedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !hypothesis.trim()) return;
    setSaving(true);
    try {
      await onSave({
        id: editMode?.id, title, author: author.trim(), content: content.trim(),
        hypothesis: hypothesis.trim(), supporting: supporting.trim(), counter: counter.trim(),
        status, relatedIds, sources
      });
      if (!editMode) {
        setAuthor(''); setContent(''); setHypothesis(''); setSupporting(''); setCounter('');
        setStatus('needs-research'); setRelatedIds([]); setSources([]); setShowStructured(false);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { key: 'needs-research', label: 'Riset', icon: '🔬' },
    { key: 'proven', label: 'Benar', icon: '✅' },
    { key: 'broken', label: 'Patah', icon: '❌' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Author */}
      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>
          <User className="w-3 h-3 inline mr-1" />Author
        </label>
        <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Name..." />
      </div>

      {/* Content */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Content</label>
          <VoiceInput onTranscript={handleVoice} />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts..."
          rows={5}
        />
      </div>

      {/* Auto Structure */}
      <button type="button" onClick={handleAutoStructure}
        className="w-full py-3 rounded-lg border border-dashed flex items-center justify-center gap-2 text-sm font-medium"
        style={{ borderColor: 'var(--indigo-500)', color: 'var(--indigo-600)', background: 'var(--indigo-50)' }}>
        <Sparkles className="w-4 h-4" /> Auto Structure (H • A • K)
      </button>

      {/* H-A-K */}
      <div className="space-y-2">
        <button type="button" onClick={() => setShowStructured(!showStructured)}
          className="w-full flex items-center justify-between p-3 rounded-lg"
          style={{ background: 'var(--white)', border: '1px solid var(--border)' }}>
          <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>Structure</span>
          {showStructured ? <Minus className="w-4 h-4" style={{ color: 'var(--indigo-500)' }} /> : <Plus className="w-4 h-4" style={{ color: 'var(--indigo-500)' }} />}
        </button>

        {showStructured && (
          <div className="space-y-2 pl-2">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#8B5CF6' }}>
                <span className="inline-block w-5 h-5 rounded text-white bg-purple-500 text-center text-xs mr-1">H</span>
                Hypothesis
              </label>
              <textarea value={hypothesis} onChange={(e) => setHypothesis(e.target.value)} placeholder="Main hypothesis..." rows={2} className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#22C55E' }}>
                <span className="inline-block w-5 h-5 rounded text-white bg-green-500 text-center text-xs mr-1">A</span>
                Arguments
              </label>
              <textarea value={supporting} onChange={(e) => setSupporting(e.target.value)} placeholder="Supporting..." rows={2} className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: '#F59E0B' }}>
                <span className="inline-block w-5 h-5 rounded text-white bg-amber-500 text-center text-xs mr-1">K</span>
                Counter
              </label>
              <textarea value={counter} onChange={(e) => setCounter(e.target.value)} placeholder="Counter arguments..." rows={2} className="text-sm" />
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="text-xs font-medium mb-2 block" style={{ color: 'var(--text-muted)' }}>Status</label>
        <div className="grid grid-cols-3 gap-2">
          {statusOptions.map(opt => (
            <button key={opt.key} type="button" onClick={() => setStatus(opt.key)}
              className="p-3 rounded-lg text-center transition-all"
              style={{
                background: status === opt.key ? (opt.key === 'proven' ? 'var(--indigo-500)' : opt.key === 'broken' ? 'var(--rose-500)' : 'var(--indigo-500)') : 'var(--slate-100)',
                color: status === opt.key ? 'white' : 'var(--text-secondary)'
              }}>
              <div className="text-xl mb-1">{opt.icon}</div>
              <div className="text-xs font-medium">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div className="card p-4">
        <button type="button" onClick={() => setShowSources(!showSources)} className="w-full flex items-center justify-between">
          <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>Sources ({sources.length})</span>
          {showSources ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>

        {showSources && (
          <div className="mt-3 space-y-2">
            {sources.map(s => (
              <div key={s.id} className="flex items-center justify-between p-2 rounded-lg" style={{ background: 'var(--slate-100)' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: 'var(--text)' }}>{s.title}</p>
                  {s.author && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.author}</p>}
                </div>
                <button onClick={() => removeSource(s.id)} className="p-1" style={{ color: 'var(--rose-500)' }}>✕</button>
              </div>
            ))}
            <div className="space-y-2 pt-2">
              <input type="text" value={newSource.title} onChange={(e) => setNewSource(p => ({...p, title: e.target.value}))} placeholder="Title..." className="text-sm" />
              <input type="text" value={newSource.author} onChange={(e) => setNewSource(p => ({...p, author: e.target.value}))} placeholder="Author" className="text-sm" />
              <button type="button" onClick={addSource} disabled={!newSource.title.trim()}
                className="w-full py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--indigo-50)', color: 'var(--indigo-600)' }}>
                + Add Source
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Related */}
      <div className="card p-4">
        <button type="button" onClick={() => setShowRelated(!showRelated)} className="w-full flex items-center justify-between">
          <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>Related ({relatedIds.length})</span>
          {showRelated ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>

        {showRelated && existingHypotheses.length > 0 && (
          <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
            {existingHypotheses.filter(h => h.id !== editMode?.id).map(h => (
              <label key={h.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer" style={{ background: 'var(--slate-100)' }}>
                <input type="checkbox" checked={relatedIds.includes(h.id)} onChange={() => toggleRelated(h.id)}
                  className="w-4 h-4 rounded" style={{ accentColor: 'var(--indigo-500)' }} />
                <span className="text-sm truncate flex-1" style={{ color: 'var(--text)' }}>{h.title || 'Untitled'}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button type="submit" disabled={saving || (!content.trim() && !hypothesis.trim())}
        className="w-full btn btn-primary py-4">
        {saving ? 'Saving...' : editMode ? 'Update' : '💾 Save'}
      </button>

      {/* Auto-save */}
      {editMode && autoSave && (
        <p className="text-center text-xs" style={{ color: 'var(--emerald-500)' }}>
          <Check className="w-3 h-3 inline mr-1" />Saved
        </p>
      )}
    </form>
  );
}
