import { useState, useEffect, useCallback } from 'react';
import { formatDateTime } from '../utils/helpers';
import { STATUS_LABELS } from '../types';
import { Shuffle, Trash2, Edit3, Clock, Link2, Check, ArrowLeft, Share2, Eye, EyeOff } from 'lucide-react';

export default function HypothesisDetail({ hypothesis, all, onEdit, onDelete, onTimeline, onRelated, onRandom, onBack }) {
  const [zen, setZen] = useState(false);
  const [share, setShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [timelineContent, setTimelineContent] = useState('');
  const [progress, setProgress] = useState(0);

  const relatedItems = hypothesis.relatedIds?.map(id => all.find(h => h.id === id)).filter(Boolean) || [];

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

  const handleShare = async () => {
    const text = [
      `📝 ${hypothesis.title || 'Untitled'}`,
      `Author: ${hypothesis.author || 'Anonymous'}`,
      `Status: ${STATUS_LABELS[hypothesis.status] || 'Research'}`,
      '',
      hypothesis.content,
      '',
      '---',
      'Via Hipotesa App'
    ].filter(Boolean).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setShare(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddTimeline = useCallback(async () => {
    if (!timelineContent.trim()) return;
    await onTimeline(timelineContent.trim());
    setTimelineContent('');
    setShowTimeline(false);
  }, [timelineContent, onTimeline]);

  const handleDelete = () => {
    if (confirmDelete) onDelete();
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 3000); }
  };

  const getBadge = (status) => {
    const badges = {
      'needs-research': { label: 'Research', class: 'badge-outline' },
      'proven': { label: 'Proven', class: 'badge-dark' },
      'broken': { label: 'Broken', class: 'badge-outline' }
    };
    return badges[status] || badges['needs-research'];
  };

  const badge = getBadge(hypothesis.status);

  return (
    <div className="min-h-screen" style={{ background: 'var(--cream)' }}>
      {/* Progress */}
      {!zen && <div className="fixed top-0 left-0 h-0.5 bg-black z-50 transition-all duration-100" style={{ width: `${progress}%` }} />}

      {/* Header */}
      {!zen && (
        <header className="sticky top-0 z-30 px-6 py-5 flex items-center justify-between" style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border)' }}>
          <button onClick={onBack} className="flex items-center gap-2 text-sm" style={{ color: 'var(--warm-gray)' }}>
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setZen(true)} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--cream-dark)' }}>
              <Eye className="w-5 h-5" />
            </button>
            <button onClick={onRandom} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--cream-dark)' }}>
              <Shuffle className="w-5 h-5" />
            </button>
            <button onClick={onEdit} className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--cream-dark)' }}>
              <Edit3 className="w-5 h-5" />
            </button>
            <button onClick={handleDelete} className="w-11 h-11 rounded-full flex items-center justify-center transition-all" style={{ background: confirmDelete ? 'rgba(244,63,94,0.1)' : 'var(--cream-dark)', color: confirmDelete ? '#F43F5E' : 'var(--warm-gray)' }}>
              {confirmDelete ? <Check className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
            </button>
          </div>
        </header>
      )}

      {/* Zen Exit */}
      {zen && (
        <button onClick={() => setZen(false)} className="fixed top-5 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--cream-dark)' }}>
          <EyeOff className="w-5 h-5" />
        </button>
      )}

      {/* Content */}
      <main className="px-6 py-8 max-w-xl mx-auto">
        {/* Title */}
        <div className="mb-8">
          <span className={`badge ${badge.class} mb-4`}>{badge.label}</span>
          <h1 className="text-3xl font-semibold mb-3">{hypothesis.title || 'Untitled'}</h1>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--light-gray)' }}>
            {hypothesis.author && <span>{hypothesis.author}</span>}
            <span>{formatDateTime(hypothesis.createdAt)}</span>
          </div>
        </div>

        {/* Content */}
        {hypothesis.content && (
          <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--warm-gray)' }}>
            {hypothesis.content}
          </p>
        )}

        {/* H-A-K */}
        {(hypothesis.hypothesis || hypothesis.supporting || hypothesis.counter) && (
          <div className="space-y-4 mb-8">
            {hypothesis.hypothesis && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-lg text-white text-xs font-bold flex items-center justify-center" style={{ background: '#8B5CF6' }}>H</span>
                  <span className="text-sm font-medium" style={{ color: '#8B5CF6' }}>Hypothesis</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--warm-gray)' }}>{hypothesis.hypothesis}</p>
              </div>
            )}
            {hypothesis.supporting && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-lg text-white text-xs font-bold flex items-center justify-center" style={{ background: '#22C55E' }}>A</span>
                  <span className="text-sm font-medium" style={{ color: '#22C55E' }}>Arguments</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--warm-gray)' }}>{hypothesis.supporting}</p>
              </div>
            )}
            {hypothesis.counter && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-lg text-white text-xs font-bold flex items-center justify-center" style={{ background: '#F59E0B' }}>K</span>
                  <span className="text-sm font-medium" style={{ color: '#F59E0B' }}>Counter</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--warm-gray)' }}>{hypothesis.counter}</p>
              </div>
            )}
          </div>
        )}

        {/* Sources */}
        {hypothesis.sources?.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-4">Sources</h3>
            <div className="space-y-2">
              {hypothesis.sources.map(s => (
                <div key={s.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{s.title}</p>
                    {s.author && <p className="text-xs" style={{ color: 'var(--light-gray)' }}>{s.author}</p>}
                  </div>
                  {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost py-2 px-4 text-xs">Open</a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {relatedItems.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2"><Link2 className="w-4 h-4" /> Related ({relatedItems.length})</h3>
            <div className="space-y-2">
              {relatedItems.map(r => (
                <button key={r.id} onClick={() => onRelated(r.id)} className="card card-hover p-4 w-full text-left">
                  <p className="text-sm font-medium truncate">{r.title || 'Untitled'}</p>
                  <p className="text-xs" style={{ color: 'var(--light-gray)' }}>{r.author || 'Anonymous'}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Updates ({hypothesis.timeline?.length || 0})</h3>
            <button onClick={() => setShowTimeline(!showTimeline)} className="text-xs px-4 py-2 rounded-full" style={{ background: 'var(--cream-dark)', color: 'var(--charcoal)' }}>
              + Add
            </button>
          </div>

          {showTimeline && (
            <div className="mb-4 p-4 rounded-2xl" style={{ background: 'var(--cream-dark)' }}>
              <textarea value={timelineContent} onChange={(e) => setTimelineContent(e.target.value)} placeholder="Add update..." rows={2} className="text-sm mb-3" />
              <div className="flex gap-2">
                <button onClick={handleAddTimeline} className="btn btn-primary py-2 px-4 text-sm">Save</button>
                <button onClick={() => setShowTimeline(false)} className="btn btn-ghost py-2 px-4 text-sm">Cancel</button>
              </div>
            </div>
          )}

          {hypothesis.timeline?.length > 0 && (
            <div className="space-y-3">
              {[...hypothesis.timeline].reverse().map(t => (
                <div key={t.id} className="pl-4 border-l-2" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-sm" style={{ color: 'var(--warm-gray)' }}>{t.content}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--light-gray)' }}>{formatDateTime(t.date)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Share */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4" style={{ background: 'var(--warm-white)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-xl mx-auto relative">
          <button onClick={() => setShare(!share)} className="btn btn-primary w-full py-4" style={{ background: copied ? '#22C55E' : 'var(--charcoal)' }}>
            {copied ? <><Check className="w-5 h-5" /> Copied!</> : <><Share2 className="w-5 h-5" /> {share ? 'Close' : 'Share'}</>}
          </button>
          {share && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-3 rounded-2xl animate-fade-up" style={{ background: 'var(--warm-white)', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <button onClick={handleShare} className="w-full py-3 text-sm text-left px-4 rounded-xl hover:bg-slate-50">
                📱 Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
