import { useState } from 'react';
import { formatDate } from '../utils/helpers';
import { Clock, User, Eye } from 'lucide-react';

export default function HypothesisCard({ hypothesis, onClick }) {
  const [showPreview, setShowPreview] = useState(false);

  const getBadge = (status) => {
    const badges = {
      'needs-research': { label: 'Riset', class: 'badge-indigo' },
      'proven': { label: 'Benar', class: 'badge-emerald' },
      'broken': { label: 'Patah', class: 'badge-rose' }
    };
    return badges[status] || badges['needs-research'];
  };

  const badge = getBadge(hypothesis.status);
  const avatar = (hypothesis.title || 'U')[0].toUpperCase();

  // Read time
  const words = (hypothesis.content || '').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <>
      <div className="card p-4 cursor-pointer" onClick={onClick}>
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold text-sm"
            style={{ background: 'var(--indigo-100)', color: 'var(--indigo-600)' }}
          >
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-snug mb-1 line-clamp-2" style={{ color: 'var(--text)' }}>
              {hypothesis.title || 'Untitled'}
            </h3>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              {hypothesis.author && <span className="flex items-center gap-1"><User className="w-3 h-3" />{hypothesis.author}</span>}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(hypothesis.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        {hypothesis.content && (
          <p className="text-sm line-clamp-2 leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
            {hypothesis.content}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={`badge ${badge.class}`}>{badge.label}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowPreview(true); }}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
              style={{ background: 'var(--slate-100)', color: 'var(--text-secondary)' }}
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <>
          <div className="modal-overlay" onClick={() => setShowPreview(false)} />
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <span className={`badge ${badge.class} mb-2`}>{badge.label}</span>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                {hypothesis.title || 'Untitled'}
              </h2>
              <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                {hypothesis.author && <span>{hypothesis.author}</span>}
                <span>{formatDate(hypothesis.createdAt)}</span>
                <span>{readTime} min read</span>
              </div>
            </div>

            {hypothesis.content && (
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {hypothesis.content}
              </p>
            )}

            <button
              onClick={() => { setShowPreview(false); onClick(); }}
              className="w-full btn btn-primary mt-6"
            >
              Open Item
            </button>
          </div>
        </>
      )}
    </>
  );
}
