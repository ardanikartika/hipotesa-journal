import { formatDate } from '../utils/helpers';
import { Clock, User, Link2, BookOpen } from 'lucide-react';

export default function HypothesisCard({ hypothesis, onClick }) {
  const getStatusBadge = (status) => {
    const badges = {
      'needs-research': { label: 'Riset', class: 'badge-purple' },
      'proven': { label: 'Benar', class: 'badge-green' },
      'broken': { label: 'Patah', class: 'badge-rose' }
    };
    return badges[status] || badges['needs-research'];
  };

  const badge = getStatusBadge(hypothesis.status);

  return (
    <button
      onClick={onClick}
      className="w-full text-left card p-4 card-hover"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[var(--text-primary)] line-clamp-2 mb-1">
            {hypothesis.title || 'Tanpa Judul'}
          </h3>
          <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
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
          </div>
        </div>
        <span className={`badge ${badge.class}`}>
          {badge.label}
        </span>
      </div>

      {/* Preview */}
      {hypothesis.content && (
        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
          {hypothesis.content}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {hypothesis.hypothesis && (
          <span className="badge badge-purple text-xs">
            H: {hypothesis.hypothesis.substring(0, 20)}...
          </span>
        )}
        {hypothesis.supporting && (
          <span className="badge badge-green text-xs">
            A: {hypothesis.supporting.substring(0, 20)}...
          </span>
        )}
        {hypothesis.counter && (
          <span className="badge badge-amber text-xs">
            K: {hypothesis.counter.substring(0, 20)}...
          </span>
        )}
        {hypothesis.relatedIds?.length > 0 && (
          <span className="badge badge-cyan text-xs">
            <Link2 className="w-3 h-3" />
            {hypothesis.relatedIds.length}
          </span>
        )}
        {hypothesis.sources?.length > 0 && (
          <span className="badge badge-cyan text-xs">
            <BookOpen className="w-3 h-3" />
            {hypothesis.sources.length}
          </span>
        )}
      </div>
    </button>
  );
}
