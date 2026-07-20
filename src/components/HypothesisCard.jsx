import { useState } from 'react';
import { formatDate } from '../utils/helpers';
import { Clock, User, Eye, ChevronRight } from 'lucide-react';

export default function HypothesisCard({ hypothesis, onClick }) {
  const [showPreview, setShowPreview] = useState(false);

  const getStatusBadge = (status) => {
    const badges = {
      'needs-research': { label: 'Riset', class: 'badge-amber' },
      'proven': { label: 'Terbukti', class: 'badge-green' },
      'broken': { label: 'Patah', class: 'badge-rose' }
    };
    return badges[status] || badges['needs-research'];
  };

  const badge = getStatusBadge(hypothesis.status);
  const avatarLetter = (hypothesis.title || 'J')[0].toUpperCase();

  // Read time
  const words = (hypothesis.content || '').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <>
      <div className="card card-hover p-4" onClick={onClick}>
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-semibold text-base"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--accent)' }}
          >
            {avatarLetter}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="font-medium text-base leading-snug mb-1 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
              {hypothesis.title || 'Tanpa Judul'}
            </h3>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
              {hypothesis.author && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {hypothesis.author}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(hypothesis.createdAt)}
              </span>
              <span>⏱️ {readTime}m</span>
            </div>

            {/* Preview */}
            {hypothesis.content && (
              <p className="text-sm line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {hypothesis.content}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-3">
              <span className={`badge ${badge.class}`}>{badge.label}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(true);
                }}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                style={{ color: 'var(--text-tertiary)', background: 'var(--bg-tertiary)' }}
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal" onClick={() => setShowPreview(false)}>
          <div className="modal-overlay" />
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <span className={`badge ${badge.class} mb-2`}>{badge.label}</span>
                <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {hypothesis.title || 'Tanpa Judul'}
                </h2>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {hypothesis.author && <span>{hypothesis.author}</span>}
                  <span>{formatDate(hypothesis.createdAt)}</span>
                  <span>⏱️ {readTime} min baca</span>
                </div>
              </div>
            </div>

            {hypothesis.content && (
              <p className="font-content" style={{ color: 'var(--text-secondary)' }}>
                {hypothesis.content}
              </p>
            )}

            <button
              onClick={() => {
                setShowPreview(false);
                onClick();
              }}
              className="w-full btn btn-primary mt-6"
            >
              Buka Jurnal
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
