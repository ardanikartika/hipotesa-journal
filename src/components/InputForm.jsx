import { useState, useCallback } from 'react';
import { Save, Sparkles, User, Plus, Minus, BookOpen, Link2, Trash2, ExternalLink } from 'lucide-react';
import VoiceInput from './VoiceInput';
import { SOURCE_TYPES } from '../types';
import { generateTitle } from '../utils/helpers';
import { v4 as uuidv4 } from 'uuid';

export default function InputForm({ onSave, existingHypotheses = [], editMode, onCancel }) {
  const [author, setAuthor] = useState(editMode?.author || '');
  const [content, setContent] = useState(editMode?.content || '');
  const [hypothesis, setHypothesis] = useState(editMode?.hypothesis || '');
  const [supporting, setSupporting] = useState(editMode?.supporting || '');
  const [counter, setCounter] = useState(editMode?.counter || '');
  const [status, setStatus] = useState(editMode?.status || 'needs-research');
  const [relatedIds, setRelatedIds] = useState(editMode?.relatedIds || []);
  const [sources, setSources] = useState(editMode?.sources || []);
  const [showRelatedSelector, setShowRelatedSelector] = useState(false);
  const [showStructured, setShowStructured] = useState(!!(editMode?.hypothesis || editMode?.supporting || editMode?.counter));
  const [showSources, setShowSources] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSource, setNewSource] = useState({ title: '', author: '', url: '', type: 'article', notes: '' });

  const title = editMode?.title || generateTitle(content);

  const handleVoiceTranscript = useCallback((text) => {
    setContent(prev => prev ? `${prev} ${text}` : text);
  }, []);

  const handleAutoStructure = () => {
    const lines = content.split('\n');
    let currentSection = '';
    const newH = [], newS = [], newC = [];

    lines.forEach(line => {
      const upper = line.toUpperCase().trim();
      if (upper.startsWith('H:') || upper.startsWith('HIPOTESA')) {
        currentSection = 'h';
        const idx = line.indexOf(':');
        if (idx >= 0) newH.push(line.substring(idx + 1).trim());
      } else if (upper.startsWith('A:') || upper.startsWith('ARGUMEN')) {
        currentSection = 'a';
        const idx = line.indexOf(':');
        if (idx >= 0) newS.push(line.substring(idx + 1).trim());
      } else if (upper.startsWith('K:') || upper.startsWith('KONTRA')) {
        currentSection = 'k';
        const idx = line.indexOf(':');
        if (idx >= 0) newC.push(line.substring(idx + 1).trim());
      } else if (currentSection === 'h' && line.trim()) newH.push(line);
      else if (currentSection === 'a' && line.trim()) newS.push(line);
      else if (currentSection === 'k' && line.trim()) newC.push(line);
      else if (!currentSection && line.trim()) {
        currentSection = 'h';
        newH.push(line);
      }
    });

    setHypothesis(newH.join('\n').trim());
    setSupporting(newS.join('\n').trim());
    setCounter(newC.join('\n').trim());
    setShowStructured(true);
  };

  const handleAddSource = () => {
    if (!newSource.title.trim()) return;
    setSources(prev => [...prev, { id: uuidv4(), ...newSource, dateAdded: new Date().toISOString() }]);
    setNewSource({ title: '', author: '', url: '', type: 'article', notes: '' });
  };

  const handleRemoveSource = (id) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !hypothesis.trim()) return;

    setSaving(true);
    try {
      await onSave({
        id: editMode?.id,
        title,
        author: author.trim(),
        content: content.trim(),
        hypothesis: hypothesis.trim(),
        supporting: supporting.trim(),
        counter: counter.trim(),
        status,
        relatedIds,
        sources
      });
      if (!editMode) {
        setAuthor('');
        setContent('');
        setHypothesis('');
        setSupporting('');
        setCounter('');
        setStatus('needs-research');
        setRelatedIds([]);
        setSources([]);
        setShowStructured(false);
        setShowSources(false);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleRelated = (id) => {
    setRelatedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const statusOptions = [
    { key: 'needs-research', label: 'Research', icon: '🔬' },
    { key: 'proven', label: 'Proven', icon: '✅' },
    { key: 'broken', label: 'Broken', icon: '❌' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-serif font-semibold text-2xl mb-1" style={{ color: 'var(--text-primary)' }}>
          {editMode ? 'Edit Journal' : 'New Journal'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Document your hypothesis
        </p>
      </div>

      {/* Author */}
      <div className="card p-5">
        <label
          className="flex items-center gap-2 text-sm font-medium mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          <User className="w-4 h-4" />
          Author
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Who's thinking this?"
          className="text-base"
        />
      </div>

      {/* Main Content */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <label
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            Content
          </label>
          <VoiceInput onTranscript={handleVoiceTranscript} />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your hypothesis here..."
          rows={5}
          className="text-base"
        />
      </div>

      {/* Auto Structure Button */}
      <button
        type="button"
        onClick={handleAutoStructure}
        className="w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-medium transition-all hover:scale-[1.01]"
        style={{
          borderColor: 'var(--accent)',
          color: 'var(--accent)',
          background: 'var(--accent-soft)'
        }}
      >
        <Sparkles className="w-5 h-5" />
        Auto Structure (H • A • K)
      </button>

      {/* H-A-K Sections */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setShowStructured(!showStructured)}
          className="w-full flex items-center justify-between card p-4"
        >
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            Structure
          </span>
          {showStructured ? (
            <Minus className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          ) : (
            <Plus className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          )}
        </button>

        {showStructured && (
          <div className="space-y-4 animate-fade-up">
            {/* Hypothesis */}
            <div className="card p-5 border-l-4" style={{ borderLeftColor: '#8b5cf6' }}>
              <label className="flex items-center gap-2 mb-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
                  style={{ background: '#8b5cf6' }}
                >
                  H
                </span>
                <div>
                  <span className="font-medium" style={{ color: '#8b5cf6' }}>Hypothesis</span>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>What are you proving?</p>
                </div>
              </label>
              <textarea
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="Main hypothesis..."
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Supporting */}
            <div className="card p-5 border-l-4" style={{ borderLeftColor: '#22c55e' }}>
              <label className="flex items-center gap-2 mb-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
                  style={{ background: '#22c55e' }}
                >
                  A
                </span>
                <div>
                  <span className="font-medium" style={{ color: '#22c55e' }}>Arguments</span>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Evidence supporting</p>
                </div>
              </label>
              <textarea
                value={supporting}
                onChange={(e) => setSupporting(e.target.value)}
                placeholder="Supporting arguments..."
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Counter */}
            <div className="card p-5 border-l-4" style={{ borderLeftColor: '#f59e0b' }}>
              <label className="flex items-center gap-2 mb-3">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white"
                  style={{ background: '#f59e0b' }}
                >
                  K
                </span>
                <div>
                  <span className="font-medium" style={{ color: '#f59e0b' }}>Counter</span>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Arguments against</p>
                </div>
              </label>
              <textarea
                value={counter}
                onChange={(e) => setCounter(e.target.value)}
                placeholder="Counter arguments..."
                rows={2}
                className="text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="card p-5">
        <label
          className="text-sm font-medium mb-3 block"
          style={{ color: 'var(--text-secondary)' }}
        >
          Status
        </label>
        <div className="grid grid-cols-3 gap-3">
          {statusOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setStatus(opt.key)}
              className="p-4 rounded-xl text-center transition-all"
              style={{
                background: status === opt.key
                  ? opt.key === 'proven' ? 'rgba(34, 197, 94, 0.12)'
                    : opt.key === 'broken' ? 'rgba(244, 63, 94, 0.12)'
                    : 'var(--accent-soft)'
                  : 'var(--bg-tertiary)',
                color: status === opt.key
                  ? opt.key === 'proven' ? '#22c55e'
                    : opt.key === 'broken' ? '#f43f5e'
                    : 'var(--accent)'
                  : 'var(--text-secondary)'
              }}
            >
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="text-xs font-semibold">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div className="card p-5">
        <button
          type="button"
          onClick={() => setShowSources(!showSources)}
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
            <BookOpen className="w-5 h-5" style={{ color: '#06b6d4' }} />
            Sources ({sources.length})
          </span>
          {showSources ? (
            <Minus className="w-5 h-5" style={{ color: '#06b6d4' }} />
          ) : (
            <Plus className="w-5 h-5" style={{ color: '#06b6d4' }} />
          )}
        </button>

        {showSources && (
          <div className="mt-4 space-y-4 animate-fade-up">
            {sources.length > 0 && (
              <div className="space-y-2">
                {sources.map((source) => {
                  const type = SOURCE_TYPES.find(t => t.key === source.type) || SOURCE_TYPES[0];
                  return (
                    <div
                      key={source.id}
                      className="p-3 rounded-xl border"
                      style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border)' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span>{type.icon}</span>
                            <span className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                              {source.title}
                            </span>
                          </div>
                          {source.author && (
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              {source.author}
                            </p>
                          )}
                          {source.url && (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs flex items-center gap-1 mt-1"
                              style={{ color: '#06b6d4' }}
                            >
                              <ExternalLink className="w-3 h-3" />
                              Open link
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSource(source.id)}
                          className="p-1.5 rounded-lg transition-all hover:bg-red-100"
                          style={{ color: '#f43f5e' }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <input
                type="text"
                value={newSource.title}
                onChange={(e) => setNewSource(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Source title"
                className="text-sm"
              />
              <input
                type="text"
                value={newSource.author}
                onChange={(e) => setNewSource(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Author"
                className="text-sm"
              />
              <input
                type="url"
                value={newSource.url}
                onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                placeholder="URL (optional)"
                className="text-sm"
              />
              <select
                value={newSource.type}
                onChange={(e) => setNewSource(prev => ({ ...prev, type: e.target.value }))}
                className="text-sm"
              >
                {SOURCE_TYPES.map((type) => (
                  <option key={type.key} value={type.key}>{type.label}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSource}
                disabled={!newSource.title.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)'
                }}
              >
                Add Source
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Related */}
      <div className="card p-5">
        <button
          type="button"
          onClick={() => setShowRelatedSelector(!showRelatedSelector)}
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-primary)' }}>
            <Link2 className="w-5 h-5" style={{ color: '#8b5cf6' }} />
            Related ({relatedIds.length})
          </span>
          {showRelatedSelector ? (
            <Minus className="w-5 h-5" style={{ color: '#8b5cf6' }} />
          ) : (
            <Plus className="w-5 h-5" style={{ color: '#8b5cf6' }} />
          )}
        </button>

        {showRelatedSelector && existingHypotheses.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
            {existingHypotheses
              .filter(h => h.id !== editMode?.id)
              .map((h) => (
                <label
                  key={h.id}
                  className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                  style={{ background: 'var(--bg-tertiary)' }}
                >
                  <input
                    type="checkbox"
                    checked={relatedIds.includes(h.id)}
                    onChange={() => toggleRelated(h.id)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: 'var(--accent)' }}
                  />
                  <span className="text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                    {h.title || 'Untitled'}
                  </span>
                </label>
              ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={saving || (!content.trim() && !hypothesis.trim())}
        className="btn btn-primary w-full py-4 text-base"
      >
        {saving ? (
          <>
            <span
              className="w-5 h-5 rounded-full animate-spin"
              style={{ borderWidth: '2px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }}
            />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {editMode ? 'Update Journal' : 'Save Journal'}
          </>
        )}
      </button>

      {/* Title Preview */}
      <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
        Title: <span style={{ color: 'var(--text-secondary)' }}>{title}</span>
      </p>
    </form>
  );
}
