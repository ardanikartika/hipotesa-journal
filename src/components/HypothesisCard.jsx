import { useState } from 'react';
import { formatDate } from '../utils/helpers';
import { Clock, User, Eye } from 'lucide-react';

export default function HypothesisCard({ item, onClick }) {
  const [preview, setPreview] = useState(false);

  const getBadge = (status) => {
    const badges = {
      'needs-research': { label: 'Research', class: 'badge-outline' },
      'proven': { label: 'Proven', class: 'badge-dark' },
      'broken': { label: 'Broken', class: 'badge-outline' }
    };
    return badges[status] || badges['needs-research'];
  };

  const badge = getBadge(item.status);
  const avatar = (item.title || 'U')[0].toUpperCase();

  const words = (item.content || '').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(words / 200));

  return (
    <>
      <div className="card p-5 cursor-pointer" onClick={onClick}>
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-semibold text-lg" style={{ background: 'var(--cream-dark)', color: 'var(--charcoal)' }}>
            {avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-snug mb-2 line-clamp-2">{item.title || 'Untitled'}</h3>
            <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--light-gray)' }}>
              {item.author && <span className="flex items-center gap-1"><User className="w-3 h-3" />{item.author}</span>}
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(item.createdAt)}</span>
              <span>{readTime}m</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        {item.content && (
          <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: 'var(--warm-gray)' }}>
            {item.content}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={`badge ${badge.class}`}>{badge.label}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setPreview(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: 'var(--cream-dark)', color: 'var(--warm-gray)' }}
          >
            <Eye className="w-3 h-3" /> Preview
          </button>
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <>
          <div className="modal-overlay" onClick={() => setPreview(false)} />
          <div className="modal-content p-8" onClick={(e) => e.stopPropagation()}>
            <span className={`badge ${badge.class} mb-4`}>{badge.label}</span>
            <h2 className="text-2xl font-semibold mb-3">{item.title || 'Untitled'}</h2>
            <div className="flex items-center gap-4 text-sm mb-6" style={{ color: 'var(--light-gray)' }}>
              {item.author && <span>{item.author}</span>}
              <span>{formatDate(item.createdAt)}</span>
              <span>{readTime} min read</span>
            </div>
            {item.content && (
              <p className="text-base leading-relaxed" style={{ color: 'var(--warm-gray)' }}>
                {item.content}
              </p>
            )}
            <button onClick={() => { setPreview(false); onClick(); }} className="btn btn-primary w-full mt-8">
              Open Item
            </button>
          </div>
        </>
      )}
    </>
  );
}
