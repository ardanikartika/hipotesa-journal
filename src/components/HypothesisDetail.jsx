import React, { useState, useEffect, useCallback } from 'react';
import { formatDateTime } from '../utils/helpers';
import { STATUS_LABELS } from '../types';
import { Copy, Shuffle, Trash2, Edit3, Plus, Clock, Link2, Check, ArrowLeft, Share2, Eye, EyeOff } from 'lucide-react';

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
  const [zenMode, setZenMode] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineContent, setTimelineContent] = useState('');
  const [progress, setProgress] = useState(0);

  const relatedHypotheses = hypothesis.relatedIds
    ?.map(id => allHypotheses.find(h => h.id === id))
    .filter(Boolean) || [];

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const prog = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(prog);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyWhatsApp = async () => {
    const lines = [
      '📝 HIPOTESA',
      '',
      `${hypothesis.title || 'Untitled'}`,
      `Author: ${hypothesis.author || 'Anonymous'}`,
      `Status: ${STATUS_LABELS[hypothesis.status] || 'Research'}`,
      '',
      hypothesis.hypothesis && `H: ${hypothesis.hypothesis}`,
      hypothesis.supporting && `A: ${hypothesis.supporting}`,
      hypothesis.counter && `K: ${hypothesis.counter}`,
      '',
      '---',
      'Via Hipotesa App'
    ].filter(Boolean).join('\n');
    await navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => { setCopied(false); setShowShare(false); }, 2000);
  };

  const handleAddTimeline = async () => {
    if (!timelineContent.trim()) return;
    await onAddTimeline(timelineContent.trim());
    setTimelineContent('');
    setShowTimeline(false);
  };

  const handleDelete = () => {
    if (confirmDelete) onDelete();
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }
  };

  const getBadge = (status) => {
    const badges = {
      'needs-research': { label: 'Riset', class: 'badge-indigo' },
      'proven': { label: 'Benar', class: 'badge-emerald' },
      'broken': { label: 'Patah', class: 'badge-rose' }
    };
    return badges[status] || badges['needs-research'];
  };

  const badge = getBadge(hypothesis.status);

  return (
    <div className={`min-h-screen ${zenMode ? 'zen-mode' : ''}`} style={{ background: 'var(--bg)' }}>
      {/* Progress Bar */}
      {!zenMode && <div className="progress-bar" style={{ width: `${progress}%` }} />}

      {/* Header */}
      {!zenMode && (
        <header className="sticky top-0 z-30 px-5 py-4 flex items-center justify-between"
          style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => setZenMode(true)}
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--slate-100)', color: 'var(--text-secondary)' }}>
              <Eye className="w-5 h-5" />
            </button>
            <button onClick={onGetRandom}
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--slate-100)', color: 'var(--text-secondary)' }}>
              <Shuffle className="w-5 h-5" />
            </button>
            <button onClick={onEdit}
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--slate-100)', color: 'var(--text-secondary)' }}>
              <Edit3 className="w-5 h-5" />
            </button>
            <button onClick={handleDelete}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-all"
              style={{ background: confirmDelete ? 'var(--rose-100)' : 'var(--slate-100)', color: confirmDelete ? 'var(--rose-500)' : 'var(--text-secondary)' }}>
              {confirmDelete ? <Check className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
            </button>
          </div>
        </header>
      )}

      {/* Zen Exit */}
      {zenMode && (
        <button onClick={() => setZenMode(false)}
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-lg flex items-center justify-center animate-fade-in"
          style={{ background: 'var(--slate-100)', color: 'var(--text-secondary)' }}>
          <EyeOff className="w-5 h-5" />
        </button>
      )}

      {/* Content */}
      <main className="px-5 py-8 max-w-2xl mx-auto">
        {/* Title */}
        <div className="mb-6">
          <span className={`badge ${badge.class} mb-3`}>{badge.label}</span>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            {hypothesis.title || 'Untitled'}
          </h1>
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
            {hypothesis.author && <span>{hypothesis.author}</span>}
            <span>{formatDateTime(hypothesis.createdAt)}</span>
          </div>
        </div>

        {/* Content */}
        {hypothesis.content && (
          <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
            {hypothesis.content}
          </p>
        )}

        {/* H-A-K */}
        {(hypothesis.hypothesis || hypothesis.supporting || hypothesis.counter) && (
          <div className="space-y-3 mb-6">
            {hypothesis.hypothesis && (
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded bg-purple-100 text-purple-600 text-xs font-bold flex items-center justify-center">H</span>
                  <span className="text-sm font-medium" style={{ color: '#7C3AED' }}>Hypothesis</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{hypothesis.hypothesis}</p>
              </div>
            )}
            {hypothesis.supporting && (
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded bg-green-100 text-green-600 text-xs font-bold flex items-center justify-center">A</span>
                  <span className="text-sm font-medium" style={{ color: '#059669' }}>Arguments</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{hypothesis.supporting}</p>
              </div>
            )}
            {hypothesis.counter && (
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded bg-amber-100 text-amber-600 text-xs font-bold flex items-center justify-center">K</span>
                  <span className="text-sm font-medium" style={{ color: '#D97706' }}>Counter</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{hypothesis.counter}</p>
              </div>
            )}
          </div>
        )}

        {/* Sources */}
        {hypothesis.sources?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>Sources</h3>
            <div className="space-y-2">
              {hypothesis.sources.map(s => (
                <div key={s.id} className="card p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{s.title}</p>
                    {s.author && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.author}</p>}
                  </div>
                  {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs px-2 py-1 rounded" style={{ background: 'var(--indigo-50)', color: 'var(--indigo-600)' }}>
                    Open
                  </a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {relatedHypotheses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Link2 className="w-4 h-4" /> Related ({relatedHypotheses.length})
            </h3>
            <div className="space-y-2">
              {relatedHypotheses.map(r => (
                <button key={r.id} onClick={() => onNavigateToRelated(r.id)}
                  className="card card-hover p-3 w-full text-left">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>{r.title || 'Untitled'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{r.author || 'Anonymous'}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <Clock className="w-4 h-4" /> Updates ({hypothesis.timeline?.length || 0})
            </h3>
            <button onClick={() => setShowTimeline(!showTimeline)}
              className="text-xs px-3 py-1 rounded-lg" style={{ background: 'var(--indigo-50)', color: 'var(--indigo-600)' }}>
              + Add
            </button>
          </div>

          {showTimeline && (
            <div className="mb-3 p-3 rounded-lg" style={{ background: 'var(--slate-100)' }}>
              <textarea value={timelineContent} onChange={(e) => setTimelineContent(e.target.value)}
                placeholder="Add update..."
                rows={2} className="text-sm mb-2" />
              <div className="flex gap-2">
                <button onClick={handleAddTimeline} className="btn btn-primary text-sm py-2 px-4">Save</button>
                <button onClick={() => setShowTimeline(false)} className="btn btn-ghost text-sm py-2 px-4">Cancel</button>
              </div>
            </div>
          )}

          {hypothesis.timeline?.length > 0 && (
            <div className="space-y-2">
              {[...hypothesis.timeline].reverse().map(t => (
                <div key={t.id} className="p-3 rounded-lg border-l-2" style={{ background: 'var(--slate-50)', borderColor: 'var(--indigo-200)' }}>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.content}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatDateTime(t.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Share */}
      <div className="fixed bottom-0 left-0 right-0 p-4" style={{ background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto relative">
          <button onClick={() => setShowShare(!showShare)}
            className="w-full btn py-3"
            style={{ background: copied ? 'var(--emerald-500)' : 'var(--indigo-500)', color: 'white' }}>
            {copied ? <><Check className="w-5 h-5" /> Copied!</> : <><Share2 className="w-5 h-5" /> {showShare ? 'Close' : 'Share'}</>}
          </button>

          {showShare && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-3 rounded-lg animate-fade-up"
              style={{ background: 'var(--white)', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <button onClick={handleCopyWhatsApp}
                className="w-full py-3 text-sm text-left px-4 rounded-lg hover:bg-slate-50">
                📱 WhatsApp / Copy Text
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
