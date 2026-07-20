import { formatDate } from '../utils/helpers';
import { Clock, User, Link2, BookOpen, CircleDot } from 'lucide-react';

export default function HypothesisCard({ hypothesis, onClick }) {
  const getStatusBadge = (status) => {
    const badges = {
      'needs-research': { label: 'Research', class: 'badge-slate' },
      'proven': { label: 'Proven', class: 'badge-green' },
      'broken': { label: 'Broken', class: 'badge-rose' }
    };
    return badges[status] || badges['needs-research'];
  };

  const badge = getStatusBadge(hypothesis.status);

  // Get first letter of title for avatar
  const avatarLetter = (hypothesis.title || 'U')[0].toUpperCase();

  return (
    <button
      onClick={onClick}
      className="w-full text-left card card-hover p-5 animate-fade-up"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-serif font-semibold text-lg"
            style={{
              background: 'linear-gradient(135deg, var(--orange-200), var(--orange-100))',
              color: 'var(--orange-600)'
            }}
          >
            {avatarLetter}
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className="font-serif font-semibold text-lg leading-snug mb-1 line-clamp-2"
              style={{ color: 'var(--text-primary)' }}
            >
              {hypothesis.title || 'Untitled'}
            </h3>

            <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {hypothesis.author && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {hypothesis.author}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(hypothesis.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`badge ${badge.class} flex-shrink-0`}>
          {badge.label}
        </span>
      </div>

      {/* Content Preview */}
      {hypothesis.content && (
        <p
          className="text-sm leading-relaxed line-clamp-2 mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          {hypothesis.content}
        </p>
      )}

      {/* H-A-K Pills */}
      {(hypothesis.hypothesis || hypothesis.supporting || hypothesis.counter) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {hypothesis.hypothesis && (
            <span className="tag">
              <span className="font-semibold" style={{ color: '#8b5cf6' }}>H</span>
              {hypothesis.hypothesis.substring(0, 30)}...
            </span>
          )}
          {hypothesis.supporting && (
            <span className="tag">
              <span className="font-semibold" style={{ color: '#22c55e' }}>A</span>
              {hypothesis.supporting.substring(0, 30)}...
            </span>
          )}
          {hypothesis.counter && (
            <span className="tag">
              <span className="font-semibold" style={{ color: '#f59e0b' }}>K</span>
              {hypothesis.counter.substring(0, 30)}...
            </span>
          )}
        </div>
      )}

      {/* Meta Footer */}
      <div
        className="flex items-center gap-4 pt-3 border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {hypothesis.relatedIds?.length > 0 && (
          <span
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <Link2 className="w-3.5 h-3.5" />
            {hypothesis.relatedIds.length} linked
          </span>
        )}
        {hypothesis.sources?.length > 0 && (
          <span
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            {hypothesis.sources.length} sources
          </span>
        )}
        {hypothesis.timeline?.length > 0 && (
          <span
            className="flex items-center gap-1.5 text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <CircleDot className="w-3.5 h-3.5" />
            {hypothesis.timeline.length} updates
          </span>
        )}
      </div>
    </button>
  );
}
