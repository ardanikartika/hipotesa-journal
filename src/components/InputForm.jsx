import React, { useState, useCallback } from 'react';
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
  const [titleExplicitlySet, setTitleExplicitlySet] = useState(!!editMode?.title);
  const [newSource, setNewSource] = useState({ title: '', author: '', url: '', type: 'article', notes: '' });

  const title = titleExplicitlySet
    ? (editMode?.title || generateTitle(content))
    : generateTitle(content);

  const handleVoiceTranscript = useCallback((text) => {
    setContent(prev => {
      const newContent = prev ? `${prev} ${text}` : text;
      return newContent;
    });
  }, []);

  const handleAutoStructure = () => {
    const lines = content.split('\n');
    let currentSection = '';
    const newHypothesis = [];
    const newSupporting = [];
    const newCounter = [];

    lines.forEach(line => {
      const upperLine = line.toUpperCase().trim();
      if (upperLine.startsWith('H:') || upperLine.startsWith('HIPOTESA')) {
        currentSection = 'h';
        const colonIndex = line.indexOf(':');
        if (colonIndex >= 0) newHypothesis.push(line.substring(colonIndex + 1).trim());
      } else if (upperLine.startsWith('A:') || upperLine.startsWith('ARGUMEN') || upperLine.startsWith('PENDUKUNG')) {
        currentSection = 'a';
        const colonIndex = line.indexOf(':');
        if (colonIndex >= 0) newSupporting.push(line.substring(colonIndex + 1).trim());
      } else if (upperLine.startsWith('K:') || upperLine.startsWith('KONTRA') || upperLine.startsWith('SANGGAHAN')) {
        currentSection = 'k';
        const colonIndex = line.indexOf(':');
        if (colonIndex >= 0) newCounter.push(line.substring(colonIndex + 1).trim());
      } else if (currentSection === 'h' && line.trim()) {
        newHypothesis.push(line);
      } else if (currentSection === 'a' && line.trim()) {
        newSupporting.push(line);
      } else if (currentSection === 'k' && line.trim()) {
        newCounter.push(line);
      } else if (!currentSection && line.trim()) {
        currentSection = 'h';
        newHypothesis.push(line);
      }
    });

    const hypText = newHypothesis.join('\n').trim();
    const supText = newSupporting.join('\n').trim();
    const cntText = newCounter.join('\n').trim();

    setHypothesis(hypText);
    setSupporting(supText);
    setCounter(cntText);
    setShowStructured(true);
  };

  const handleAddSource = () => {
    if (!newSource.title.trim()) return;
    setSources(prev => [...prev, {
      id: uuidv4(),
      ...newSource,
      dateAdded: new Date().toISOString()
    }]);
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
        titleExplicitlySet,
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
    setRelatedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-28">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">
          {editMode ? 'Edit Hipotesa' : 'Hipotesa Baru'}
        </h1>
        <p className="text-slate-500 text-sm">Catat ide, argumen, dan sanggahanmu</p>
      </div>

      {/* Author Input */}
      <div className="glass-card rounded-2xl p-5">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          Pencetus Ide
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Nama atau 'Diri Sendiri'"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-purple-500 transition-all"
        />
      </div>

      {/* Content Input */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Catatan Utama
          </label>
          <VoiceInput onTranscript={handleVoiceTranscript} />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis hipotesa kamu di sini..."
          rows={6}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:border-purple-500 transition-all resize-none"
        />
      </div>

      {/* Auto Structure Button */}
      <button
        type="button"
        onClick={handleAutoStructure}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 text-purple-300 hover:from-purple-600/30 hover:to-indigo-600/30 transition-all flex items-center justify-center gap-2 font-semibold"
      >
        <Sparkles className="w-5 h-5" />
        Struktur Otomatis (H • A • K)
      </button>

      {/* Structured H-A-K Input */}
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setShowStructured(!showStructured)}
          className="w-full flex items-center justify-between p-4 rounded-2xl glass-card hover:border-purple-500/30 transition-all"
        >
          <span className="font-semibold text-slate-200">Struktur Hipotesa</span>
          {showStructured ? (
            <Minus className="w-5 h-5 text-purple-400" />
          ) : (
            <Plus className="w-5 h-5 text-purple-400" />
          )}
        </button>

        {showStructured && (
          <div className="space-y-4 animate-fade-in">
            {/* Hypothesis (H) */}
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-purple-500">
              <label className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-lg">H</span>
                <div>
                  <span className="font-bold text-purple-300">Hipotesa Utama</span>
                  <p className="text-xs text-slate-500">Apa yang ingin kamu buktikan?</p>
                </div>
              </label>
              <textarea
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="Contoh: Matahari terbit dari timur setiap hari..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-purple-500/30 text-white placeholder-slate-600 focus:border-purple-500 transition-all resize-none"
              />
            </div>

            {/* Supporting Arguments (A) */}
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-green-500">
              <label className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold text-lg">A</span>
                <div>
                  <span className="font-bold text-green-300">Argumen Pendukung</span>
                  <p className="text-xs text-slate-500">Bukti yang mendukung hipotesa</p>
                </div>
              </label>
              <textarea
                value={supporting}
                onChange={(e) => setSupporting(e.target.value)}
                placeholder="Contoh: Historically recorded, scientific consensus..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-green-500/30 text-white placeholder-slate-600 focus:border-green-500 transition-all resize-none"
              />
            </div>

            {/* Counter Arguments (K) */}
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-amber-500">
              <label className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold text-lg">K</span>
                <div>
                  <span className="font-bold text-amber-300">Sanggahan / Kontra</span>
                  <p className="text-xs text-slate-500">Argumen yang menentang</p>
                </div>
              </label>
              <textarea
                value={counter}
                onChange={(e) => setCounter(e.target.value)}
                placeholder="Contoh: Flat earther arguments, conspiracy theories..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-amber-500/30 text-white placeholder-slate-600 focus:border-amber-500 transition-all resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Selection */}
      <div className="glass-card rounded-2xl p-5">
        <label className="text-sm font-semibold text-slate-300 mb-3 block">Status Validasi</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'needs-research', label: 'Butuh Riset', icon: '🔍', style: 'status-research' },
            { key: 'proven', label: 'Terbukti', icon: '✅', style: 'status-proven' },
            { key: 'broken', label: 'Terpatahkan', icon: '❌', style: 'status-broken' }
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setStatus(opt.key)}
              className={`p-4 rounded-xl text-center transition-all ${
                status === opt.key
                  ? `${opt.style} glow-purple`
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-2xl mb-1">{opt.icon}</div>
              <div className="text-xs font-semibold">{opt.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Sources / Referensi */}
      <div className="glass-card rounded-2xl p-5">
        <button
          type="button"
          onClick={() => setShowSources(!showSources)}
          className="w-full flex items-center justify-between"
        >
          <span className="font-semibold text-slate-200 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            📚 Sumber / Referensi ({sources.length})
          </span>
          {showSources ? (
            <Minus className="w-5 h-5 text-cyan-400" />
          ) : (
            <Plus className="w-5 h-5 text-cyan-400" />
          )}
        </button>

        {showSources && (
          <div className="mt-4 space-y-4 animate-fade-in">
            {/* Existing Sources */}
            {sources.length > 0 && (
              <div className="space-y-2">
                {sources.map((source) => {
                  const sourceType = SOURCE_TYPES.find(t => t.key === source.type) || SOURCE_TYPES[0];
                  return (
                    <div key={source.id} className="p-3 rounded-xl bg-white/5 border border-cyan-500/20">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{sourceType.icon}</span>
                            <span className="font-semibold text-white text-sm truncate">{source.title}</span>
                          </div>
                          {source.author && (
                            <p className="text-xs text-slate-400">{source.author}</p>
                          )}
                          {source.url && (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Buka Link
                            </a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSource(source.id)}
                          className="p-2 rounded-lg hover:bg-rose-500/20 text-rose-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add New Source */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <p className="text-xs text-slate-500 font-semibold">Tambah Sumber Baru:</p>

              <input
                type="text"
                value={newSource.title}
                onChange={(e) => setNewSource(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Judul sumber (wajib)"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-cyan-500 transition-all"
              />

              <input
                type="text"
                value={newSource.author}
                onChange={(e) => setNewSource(prev => ({ ...prev, author: e.target.value }))}
                placeholder="Penulis / Pengarang"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-cyan-500 transition-all"
              />

              <input
                type="url"
                value={newSource.url}
                onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                placeholder="Link URL (opsional)"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:border-cyan-500 transition-all"
              />

              <select
                value={newSource.type}
                onChange={(e) => setNewSource(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:border-cyan-500 transition-all"
              >
                {SOURCE_TYPES.map((type) => (
                  <option key={type.key} value={type.key} className="bg-slate-900">
                    {type.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAddSource}
                disabled={!newSource.title.trim()}
                className="w-full py-3 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/30 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Sumber
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Related Hypotheses */}
      <div className="glass-card rounded-2xl p-5">
        <button
          type="button"
          onClick={() => setShowRelatedSelector(!showRelatedSelector)}
          className="w-full flex items-center justify-between"
        >
          <span className="font-semibold text-slate-200 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-purple-400" />
            🔗 Hipotesa Terkait ({relatedIds.length})
          </span>
          {showRelatedSelector ? (
            <Minus className="w-5 h-5 text-purple-400" />
          ) : (
            <Plus className="w-5 h-5 text-purple-400" />
          )}
        </button>

        {showRelatedSelector && existingHypotheses.length > 0 && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto hide-scrollbar">
            {existingHypotheses
              .filter(h => h.id !== editMode?.id)
              .map((h) => (
                <label
                  key={h.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    checked={relatedIds.includes(h.id)}
                    onChange={() => toggleRelated(h.id)}
                    className="w-5 h-5 rounded border-purple-500/50 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-300 truncate flex-1">
                    {h.title || 'Tanpa Judul'}
                  </span>
                </label>
              ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={saving || (!content.trim() && !hypothesis.trim())}
        className="w-full py-5 rounded-2xl gradient-btn text-white font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
      >
        {saving ? (
          <>
            <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="w-6 h-6" />
            {editMode ? 'Update Hipotesa' : 'Simpan Hipotesa'}
          </>
        )}
      </button>

      {/* Title Preview */}
      <div className="text-center">
        <p className="text-xs text-slate-600">
          Judul: <span className="text-slate-400">{title}</span>
        </p>
      </div>
    </form>
  );
}
