import React, { useState } from 'react';
import { STATUS_LABELS, STATUS_COLORS } from '../types';
import { formatDateTime, copyToClipboard, formatForWhatsApp } from '../utils/helpers';
import { Copy, Shuffle, Trash2, Edit3, Plus, Clock, Link2, Check, ArrowLeft } from 'lucide-react';

export default function HypothesisDetail({
  hypothesis,
  allHypotheses,
  onEdit,
  onDelete,
  onAddTimeline,
  onNavigateToRelated,
  onGetRandom,
  onBack
}) {
  const [showTimelineInput, setShowTimelineInput] = useState(false);
  const [timelineContent, setTimelineContent] = useState('');
  const [addingTimeline, setAddingTimeline] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statusStyle = STATUS_COLORS[hypothesis.status];

  const relatedHypotheses = hypothesis.relatedIds
    ?.map(id => allHypotheses.find(h => h.id === id))
    .filter(Boolean) || [];

  const handleCopy = async () => {
    const text = formatForWhatsApp(hypothesis);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddTimeline = async () => {
    if (!timelineContent.trim()) return;
    setAddingTimeline(true);
    try {
      await onAddTimeline(timelineContent.trim());
      setTimelineContent('');
      setShowTimelineInput(false);
    } catch (error) {
      console.error('Failed to add timeline:', error);
    } finally {
      setAddingTimeline(false);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-dark p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Kembali</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onGetRandom}
            className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
            title="Buka Hipotesa Acak"
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-slate-400 hover:text-accent-400 hover:bg-accent-500/10 transition-all"
            title="Edit"
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-all ${
              confirmDelete
                ? 'bg-rose-500/20 text-rose-400'
                : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
            }`}
            title={confirmDelete ? 'Klik lagi untuk konfirmasi hapus' : 'Hapus'}
          >
            {confirmDelete ? <Check className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Title & Meta */}
        <div>
          <h1 className="font-serif text-2xl font-bold text-slate-100 mb-3">
            {hypothesis.title || 'Tanpa Judul'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
            {hypothesis.author && (
              <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 text-xs">
                  👤
                </span>
                {hypothesis.author}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDateTime(hypothesis.createdAt)}
            </span>
          </div>
          <span className={`inline-block mt-3 px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
            {STATUS_LABELS[hypothesis.status]}
          </span>
        </div>

        {/* Content */}
        {hypothesis.content && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-slate-200 whitespace-pre-wrap">{hypothesis.content}</p>
          </div>
        )}

        {/* Structured Content */}
        {(hypothesis.hypothesis || hypothesis.supporting || hypothesis.counter) && (
          <div className="space-y-4">
            {/* Hypothesis */}
            {hypothesis.hypothesis && (
              <div className="p-4 rounded-xl bg-accent-500/10 border border-accent-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 flex items-center justify-center rounded bg-accent-500 text-white text-xs font-bold">H</span>
                  <span className="text-sm font-medium text-accent-300">Hipotesa Utama</span>
                </div>
                <p className="text-slate-200 whitespace-pre-wrap">{hypothesis.hypothesis}</p>
              </div>
            )}

            {/* Supporting */}
            {hypothesis.supporting && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 flex items-center justify-center rounded bg-emerald-500 text-white text-xs font-bold">A</span>
                  <span className="text-sm font-medium text-emerald-300">Argumen Pendukung</span>
                </div>
                <p className="text-slate-200 whitespace-pre-wrap">{hypothesis.supporting}</p>
              </div>
            )}

            {/* Counter */}
            {hypothesis.counter && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 flex items-center justify-center rounded bg-amber-500 text-white text-xs font-bold">K</span>
                  <span className="text-sm font-medium text-amber-300">Sanggahan</span>
                </div>
                <p className="text-slate-200 whitespace-pre-wrap">{hypothesis.counter}</p>
              </div>
            )}
          </div>
        )}

        {/* Related Hypotheses */}
        {relatedHypotheses.length > 0 && (
          <div className="space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Link2 className="w-4 h-4" />
              Berkaitan dengan:
            </h3>
            <div className="space-y-2">
              {relatedHypotheses.map((related) => (
                <button
                  key={related.id}
                  onClick={() => onNavigateToRelated(related.id)}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
                >
                  <p className="text-sm text-slate-200 font-medium truncate">
                    {related.title || 'Tanpa Judul'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    oleh {related.author || 'Anonim'} • {formatDateTime(related.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Clock className="w-4 h-4" />
              Perkembangan / Log Update
            </h3>
            <button
              onClick={() => setShowTimelineInput(!showTimelineInput)}
              className="flex items-center gap-1 text-xs text-accent-400 hover:text-accent-300"
            >
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>

          {showTimelineInput && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 animate-fade-in space-y-2">
              <textarea
                value={timelineContent}
                onChange={(e) => setTimelineContent(e.target.value)}
                placeholder="Catat perkembangan atau temuan baru..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 text-sm resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddTimeline}
                  disabled={addingTimeline || !timelineContent.trim()}
                  className="px-3 py-1.5 rounded-lg bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 transition-colors disabled:opacity-50"
                >
                  {addingTimeline ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  onClick={() => {
                    setShowTimelineInput(false);
                    setTimelineContent('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 text-slate-400 text-sm hover:bg-white/20 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Timeline Entries */}
          {hypothesis.timeline && hypothesis.timeline.length > 0 ? (
            <div className="space-y-2">
              {[...hypothesis.timeline].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-xl bg-white/5 border-l-2 border-accent-500"
                >
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{entry.content}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {formatDateTime(entry.date)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic py-4 text-center">
              Belum ada perkembangan tercatat
            </p>
          )}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-16 left-0 right-0 p-4 glass-dark">
        <button
          onClick={handleCopy}
          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
            copied
              ? 'bg-emerald-500 text-white'
              : 'bg-accent-500 hover:bg-accent-600 text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              Tersalin ke Clipboard!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              Salin untuk WhatsApp
            </>
          )}
        </button>
      </div>
    </div>
  );
}
