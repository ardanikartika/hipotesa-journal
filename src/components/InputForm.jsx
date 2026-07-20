import { useState, useCallback, useEffect, useRef } from 'react';
import { Save, Sparkles, User, Plus, Minus, BookOpen, Link2, Trash2, ExternalLink, Mic, MicOff, Check, AlertCircle } from 'lucide-react';
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
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle, saving, saved
  const [newSource, setNewSource] = useState({ title: '', author: '', url: '', type: 'article', notes: '' });

  const autoSaveTimeoutRef = useRef(null);
  const lastSavedRef = useRef('');

  const title = editMode?.title || generateTitle(content);

  // Auto-save functionality
  useEffect(() => {
    if (!editMode) return; // Only auto-save for new entries

    const currentContent = JSON.stringify({ author, content, hypothesis, supporting, counter, status });

    if (currentContent === lastSavedRef.current) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (author || content || hypothesis) {
      setAutoSaveStatus('saving');

      autoSaveTimeoutRef.current = setTimeout(() => {
        setAutoSaveStatus('saved');
        lastSavedRef.current = currentContent;

        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2000);
      }, 1500);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [author, content, hypothesis, supporting, counter, status, editMode]);

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
        lastSavedRef.current = '';
        setAutoSaveStatus('idle');
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
    { key: 'needs-research', label: 'Butuh Riset', icon: '🔬' },
    { key: 'proven', label: 'Terbukti', icon: '✅' },
    { key: 'broken', label: 'Terpatahkan', icon: '❌' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          {editMode ? 'Edit Jurnal' : 'Jurnal Baru'}
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Dokumentasikan hipotesa kamu
        </p>
      </div>

      {/* Author */}
      <div className="card p-5">
        <label className="flex items-center gap-2 text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
          <User className="w-4 h-4" />
          Pencetus Ide
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Siapa yang mencetuskan ide ini?"
          className="text-base"
        />
      </div>

      {/* Main Content */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--amber-600)' }} />
            Isi Hipotesa
          </label>
          <VoiceInput onTranscript={handleVoiceTranscript} />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis hipotesa kamu di sini..."
          rows={6}
          className="text-base"
        />
      </div>

      {/* Auto Structure Button */}
      <button
        type="button"
        onClick={handleAutoStructure}
        className="w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-medium transition-all hover:scale-[1.01]"
        style={{
          borderColor: 'var(--emerald-600)',
          color: 'var(--emerald-900)',
          background: 'var(--emerald-50)'
        }}
      >
        <Sparkles className="w-5 h-5" />
        Struktur Otomatis (H • A • K)
      </button>

      {/* H-A-K Sections */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setShowStructured(!showStructured)}
          className="w-full flex items-center justify-between card p-4"
        >
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            Struktur H-A-K
          </span>
          {showStructured ? (
            <Minus className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
          ) : (
            <Plus className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
          )}
        </button>

        {showStructured && (
          <div className="space-y-4 animate-fade-up">
            {/* Hypothesis */}
            <div className="card p-5 border-l-4" style={{ borderLeftColor: '#8B5CF6' }}>
              <label className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white" style={{ background: '#8B5CF6' }}>
                  H
                </span>
                <div>
                  <span className="font-medium" style={{ color: '#8B5CF6' }}>Hipotesa Utama</span>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Apa yang ingin kamu buktikan?</p>
                </div>
              </label>
              <textarea
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="Contoh: Matahari terbit dari timur setiap hari..."
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Supporting */}
            <div className="card p-5 border-l-4" style={{ borderLeftColor: '#22C55E' }}>
              <label className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white" style={{ background: '#22C55E' }}>
                  A
                </span>
                <div>
                  <span className="font-medium" style={{ color: '#22C55E' }}>Argumen Pendukung</span>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Bukti yang mendukung</p>
                </div>
              </label>
              <textarea
                value={supporting}
                onChange={(e) => setSupporting(e.target.value)}
                placeholder="Contoh: Terdokumentasi secara historis..."
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Counter */}
            <div className="card p-5 border-l-4" style={{ borderLeftColor: '#F59E0B' }}>
              <label className="flex items-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white" style={{ background: '#F59E0B' }}>
                  K
                </span>
                <div>
                  <span className="font-medium" style={{ color: '#F59E0B' }}>Sanggahan / Kontra</span>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Argumen yang menentang</p>
                </div>
              </label>
              <textarea
                value={counter}
                onChange={(e) => setCounter(e.target.value)}
                placeholder="Contoh: Teori bumi datar..."
                rows={2}
                className="text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="card p-5">
        <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>
          Status Validasi
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
                  ? opt.key === 'proven' ? 'var(--emerald-100)'
                    : opt.key === 'broken' ? '#FEE2E2'
                    : 'var(--amber-100)'
                  : 'var(--bg-tertiary)',
                color: status === opt.key
                  ? opt.key === 'proven' ? 'var(--emerald-900)'
                    : opt.key === 'broken' ? '#DC2626'
                    : '#996633'
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
            <BookOpen className="w-5 h-5" style={{ color: '#06B6D4' }} />
            Sumber / Referensi ({sources.length})
          </span>
          {showSources ? (
            <Minus className="w-5 h-5" style={{ color: '#06B6D4' }} />
          ) : (
            <Plus className="w-5 h-5" style={{ color: '#06B6D4' }} />
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
                      className="p-3 rounded-xl flex items-start justify-between gap-3"
                      style={{ background: 'var(--bg-tertiary)' }}
                    >
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
                            style={{ color: '#06B6D4' }}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Buka Link
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSource(source.id)}
                        className="p-2 rounded-lg transition-all hover:bg-red-100"
                        style={{ color: '#DC2626' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Tambah Sumber Baru:
              </p>
              <input
                type="text"
                value={newSource.title}
                onChange={(e) => setNewSource(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Judul sumber (wajib)"
                className="text-sm"
              />
              <input
                type="text"
                value={newSource.author}
                onChange={(e) => setNewSource(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Penulis / Pengarang"
                className="text-sm"
              />
              <input
                type="url"
                value={newSource.url}
                onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                placeholder="Link URL (opsional)"
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
                  background: 'var(--emerald-50)',
                  color: 'var(--emerald-900)'
                }}
              >
                Tambah Sumber
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
            <Link2 className="w-5 h-5" style={{ color: '#8B5CF6' }} />
            Jurnal Terkait ({relatedIds.length})
          </span>
          {showRelatedSelector ? (
            <Minus className="w-5 h-5" style={{ color: '#8B5CF6' }} />
          ) : (
            <Plus className="w-5 h-5" style={{ color: '#8B5CF6' }} />
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
                    style={{ accentColor: 'var(--emerald-900)' }}
                  />
                  <span className="text-sm truncate flex-1" style={{ color: 'var(--text-primary)' }}>
                    {h.title || 'Tanpa Judul'}
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
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {editMode ? 'Update Jurnal' : 'Simpan Jurnal'}
          </>
        )}
      </button>

      {/* Title Preview & Auto-save */}
      <div className="flex items-center justify-between">
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Judul: <span style={{ color: 'var(--text-secondary)' }}>{title}</span>
        </p>

        {/* Auto-save Indicator */}
        {editMode && (
          <div className="autosave-indicator">
            {autoSaveStatus === 'saving' && (
              <>
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--amber-500)' }} />
                <span>Menyimpan...</span>
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <Check className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                <span style={{ color: 'var(--success)' }}>Tersimpan otomatis</span>
              </>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
