import React from 'react';
import { STATUS_LABELS } from '../types';
import { formatDate } from '../utils/helpers';
import { Clock, Link2, User, Sparkles } from 'lucide-react';

export default function HypothesisCard({ hypothesis, onClick, compact = false }) {
  const getStatusBadge = (status) => {
    const badges = {
      'needs-research': { class: 'status-research', icon: '🔍', label: 'Riset' },
      'proven': { class: 'status-proven', icon: '✅', label: 'Benar' },
      'broken': { class: 'status-broken', icon: '❌', label: 'Patah' }
    };
    return badges[status] || badges['needs-research'];
  };

  const badge = getStatusBadge(hypothesis.status);

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left glass-card rounded-2xl p-4 transition-all duration-300 card-hover animate-fade-in"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate mb-2">
              {hypothesis.title || 'Tanpa Judul'}
            </h3>
            <div className="flex items-center gap-4 text-xs text-slate-500">
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
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.class}`}>
            {badge.icon} {badge.label}
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left glass-card rounded-2xl p-5 transition-all duration-300 card-hover animate-fade-in"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-white line-clamp-2 mb-2">
            {hypothesis.title || 'Tanpa Judul'}
          </h3>
          <div className="flex items-center gap-4 text-xs text-slate-500">
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
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${badge.class}`}>
          {badge.icon} {badge.label}
        </span>
      </div>

      {/* Content Preview */}
      {hypothesis.content && (
        <p className="text-sm text-slate-400 line-clamp-2 mb-4">
          {hypothesis.content}
        </p>
      )}

      {/* H-A-K Badges */}
      <div className="flex flex-wrap gap-2">
        {hypothesis.hypothesis && (
          <span className="badge-h px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <span className="font-bold">H</span>
            {hypothesis.hypothesis.substring(0, 25)}...
          </span>
        )}
        {hypothesis.supporting && (
          <span className="badge-a px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <span className="font-bold">A</span>
            {hypothesis.supporting.substring(0, 25)}...
          </span>
        )}
        {hypothesis.counter && (
          <span className="badge-k px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <span className="font-bold">K</span>
            {hypothesis.counter.substring(0, 25)}...
          </span>
        )}
        {!hypothesis.hypothesis && !hypothesis.supporting && !hypothesis.counter && hypothesis.content && (
          <span className="px-3 py-1 rounded-lg text-xs text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Tanpa struktur
          </span>
        )}
      </div>

      {/* Timeline indicator */}
      {hypothesis.timeline && hypothesis.timeline.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <span className="text-xs text-slate-600">
            📅 {hypothesis.timeline.length} perkembangan tercatat
          </span>
        </div>
      )}
    </button>
  );
}
