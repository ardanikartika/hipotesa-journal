import React, { useState, useCallback } from 'react';
import { Save, Sparkles, User, X } from 'lucide-react';
import VoiceInput from './VoiceInput';
import { STATUS_LABELS, STATUS_COLORS, VALIDATION_STATUSES } from '../types';
import { generateTitle } from '../utils/helpers';

const statusOptions = VALIDATION_STATUSES;

export default function InputForm({ onSave, existingHypotheses = [], editMode, onCancel }) {
  const [author, setAuthor] = useState(editMode?.author || '');
  const [content, setContent] = useState(editMode?.content || '');
  const [hypothesis, setHypothesis] = useState(editMode?.hypothesis || '');
  const [supporting, setSupporting] = useState(editMode?.supporting || '');
  const [counter, setCounter] = useState(editMode?.counter || '');
  const [status, setStatus] = useState(editMode?.status || 'needs-research');
  const [relatedIds, setRelatedIds] = useState(editMode?.relatedIds || []);
  const [showRelatedSelector, setShowRelatedSelector] = useState(false);
  const [showStructured, setShowStructured] = useState(!!(editMode?.hypothesis || editMode?.supporting || editMode?.counter));
  const [saving, setSaving] = useState(false);
  const [titleExplicitlySet, setTitleExplicitlySet] = useState(!!editMode?.title);

  // Auto-generate title from content
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
    // Simple heuristic to split content into H, A, K
    const lines = content.split('\n');
    let currentSection = '';
    const newHypothesis = [];
    const newSupporting = [];
    const newCounter = [];

    lines.forEach(line => {
      const upperLine = line.toUpperCase().trim();
      if (upperLine.startsWith('H:') || upperLine.startsWith('HIPOTESA') || upperLine.startsWith('HYPOTHESIS')) {
        if (currentSection === 'h') newHypothesis.push(line);
        else if (currentSection === 'a') newSupporting.push(line);
        else if (currentSection === 'k') newCounter.push(line);
        currentSection = 'h';
        newHypothesis.push(line.substring(line.indexOf(':') + 1).trim());
      } else if (upperLine.startsWith('A:') || upperLine.startsWith('ARGUMEN') || upperLine.startsWith('SUPPORTING') || upperLine.startsWith('PENDUKUNG')) {
        if (currentSection === 'h') newHypothesis.push(line);
        else if (currentSection === 'a') newSupporting.push(line);
        else if (currentSection === 'k') newCounter.push(line);
        currentSection = 'a';
        newSupporting.push(line.substring(line.indexOf(':') + 1).trim());
      } else if (upperLine.startsWith('K:') || upperLine.startsWith('KONTRA') || upperLine.startsWith('SANGGAHAN') || upperLine.startsWith('COUNTER')) {
        if (currentSection === 'h') newHypothesis.push(line);
        else if (currentSection === 'a') newSupporting.push(line);
        else if (currentSection === 'k') newCounter.push(line);
        currentSection = 'k';
        newCounter.push(line.substring(line.indexOf(':') + 1).trim());
      } else if (currentSection === 'h') {
        newHypothesis.push(line);
      } else if (currentSection === 'a') {
        newSupporting.push(line);
      } else if (currentSection === 'k') {
        newCounter.push(line);
      } else if (!currentSection && line.trim()) {
        currentSection = 'h';
        newHypothesis.push(line);
      }
    });

    setHypothesis(newHypothesis.join('\n').trim());
    setSupporting(newSupporting.join('\n').trim());
    setCounter(newCounter.join('\n').trim());
    setShowStructured(true);
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
        relatedIds
      });
      // Reset form if not in edit mode
      if (!editMode) {
        setAuthor('');
        setContent('');
        setHypothesis('');
        setSupporting('');
        setCounter('');
        setStatus('needs-research');
        setRelatedIds([]);
        setShowStructured(false);
      }
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleRelated = (id) => {
    setRelatedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-slate-100">
          {editMode ? 'Edit Hipotesa' : 'Hipotesa Baru'}
        </h1>
        {editMode && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Author Input */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <User className="w-4 h-4" />
          Pencetus Ide
        </label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Nama atau 'Diri Sendiri'"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-accent-500 transition-colors"
        />
      </div>

      {/* Content Input with Voice */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">
            Catatan Utama
          </label>
          <VoiceInput onTranscript={handleVoiceTranscript} />
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tulis hipotesa kamu di sini... atau gunakan mikrofon untuk suara ke teks"
          rows={5}
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-accent-500 transition-colors resize-none"
        />
      </div>

      {/* Auto Structure Button */}
      <button
        type="button"
        onClick={handleAutoStructure}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 transition-colors text-sm"
      >
        <Sparkles className="w-4 h-4" />
        Struktur Otomatis (H, A, K)
      </button>

      {/* Structured Input */}
      {showStructured && (
        <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-300">Struktur Hipotesa</h3>
            <button
              type="button"
              onClick={() => setShowStructured(false)}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Sembunyikan
            </button>
          </div>

          {/* Hypothesis (H) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-accent-300">
              <span className="w-6 h-6 flex items-center justify-center rounded bg-accent-500/30 text-xs font-bold">H</span>
              Hipotesa Utama
            </label>
            <textarea
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="Apa hipotesa utama kamu?"
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-accent-500/30 text-slate-100 placeholder-slate-500 focus:border-accent-500 transition-colors resize-none text-sm"
            />
          </div>

          {/* Supporting Arguments (A) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-emerald-300">
              <span className="w-6 h-6 flex items-center justify-center rounded bg-emerald-500/30 text-xs font-bold">A</span>
              Argumen Pendukung
            </label>
            <textarea
              value={supporting}
              onChange={(e) => setSupporting(e.target.value)}
              placeholder="Argumen atau bukti yang mendukung hipotesa"
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-emerald-500/30 text-slate-100 placeholder-slate-500 focus:border-emerald-500 transition-colors resize-none text-sm"
            />
          </div>

          {/* Counter Arguments (K) */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-amber-300">
              <span className="w-6 h-6 flex items-center justify-center rounded bg-amber-500/30 text-xs font-bold">K</span>
              Sanggahan / Kontra
            </label>
            <textarea
              value={counter}
              onChange={(e) => setCounter(e.target.value)}
              placeholder="Argumen atau bukti yang menentang hipotesa"
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-amber-500/30 text-slate-100 placeholder-slate-500 focus:border-amber-500 transition-colors resize-none text-sm"
            />
          </div>
        </div>
      )}

      {/* Status Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Status Validasi</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => {
            const style = STATUS_COLORS[opt];
            const isSelected = status === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setStatus(opt)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? `${style.bg} ${style.text} border ${style.border}`
                    : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                }`}
              >
                {STATUS_LABELS[opt]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Related Hypotheses */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowRelatedSelector(!showRelatedSelector)}
          className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-slate-100"
        >
          <span className="text-slate-500">🔗</span>
          Ide Terkait ({relatedIds.length})
        </button>

        {showRelatedSelector && existingHypotheses.length > 0 && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 max-h-48 overflow-y-auto hide-scrollbar animate-fade-in">
            {existingHypotheses
              .filter(h => h.id !== editMode?.id)
              .map((h) => (
                <label
                  key={h.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={relatedIds.includes(h.id)}
                    onChange={() => toggleRelated(h.id)}
                    className="w-4 h-4 rounded border-slate-500 text-accent-500 focus:ring-accent-500"
                  />
                  <span className="text-sm text-slate-300 truncate flex-1">
                    {h.title || 'Tanpa Judul'}
                  </span>
                </label>
              ))}
            {existingHypotheses.filter(h => h.id !== editMode?.id).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Belum ada hipotesa lain
              </p>
            )}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={saving || (!content.trim() && !hypothesis.trim())}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-accent-600 to-primary-600 text-white font-semibold shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            {editMode ? 'Update Hipotesa' : 'Simpan Hipotesa'}
          </>
        )}
      </button>

      {/* Preview Title */}
      <p className="text-xs text-slate-500 text-center">
        Judul: <span className="text-slate-400">{title}</span>
      </p>
    </form>
  );
}
