import React from 'react';
import { STATUS_LABELS, STATUS_COLORS } from '../types';
import { formatDate } from '../utils/helpers';
import { Clock, Link2, User } from 'lucide-react';

export default function HypothesisCard({ hypothesis, onClick, compact = false }) {
  const statusStyle = STATUS_COLORS[hypothesis.status];

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-4 rounded-xl glass transition-all duration-200 hover:bg-white/10 active:scale-[0.98] animate-fade-in"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-serif font-semibold text-slate-100 truncate">
              {hypothesis.title || 'Tanpa Judul'}
            </h3>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
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
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusStyle.bg} ${statusStyle.text} whitespace-nowrap`}>
            {STATUS_LABELS[hypothesis.status]}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-5 rounded-2xl glass transition-all duration-200 hover:bg-white/10 active:scale-[0.99] animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-slate-100 line-clamp-2">
            {hypothesis.title || 'Tanpa Judul'}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
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
            {hypothesis.relatedIds && hypothesis.relatedIds.length > 0 && (
              <span className="flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                {hypothesis.relatedIds.length}
              </span>
            )}
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
          {STATUS_LABELS[hypothesis.status]}
        </span>
      </div>

      {/* Content Preview */}
      {hypothesis.content && (
        <p className="text-sm text-slate-300 line-clamp-2 mb-3">
          {hypothesis.content}
        </p>
      )}

      {/* Structure Preview */}
      <div className="flex flex-wrap gap-2">
        {hypothesis.hypothesis && (
          <span className="px-2 py-0.5 rounded bg-accent-500/20 text-accent-300 text-xs">
            H: {hypothesis.hypothesis.substring(0, 30)}...
          </span>
        )}
        {hypothesis.supporting && (
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs">
            A: {hypothesis.supporting.substring(0, 30)}...
          </span>
        )}
        {hypothesis.counter && (
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-xs">
            K: {hypothesis.counter.substring(0, 30)}...
          </span>
        )}
      </div>

      {/* Timeline indicator */}
      {hypothesis.timeline && hypothesis.timeline.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <span className="text-xs text-slate-500">
            {hypothesis.timeline.length} perkembangan tercatat
          </span>
        </div>
      )}
    </button>
  );
}
