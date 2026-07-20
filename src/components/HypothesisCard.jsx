import { useState } from 'react';
import { formatDate } from '../utils/helpers';
import { Clock, User, Link2, BookOpen, CircleDot, Eye, Bookmark, X, ExternalLink } from 'lucide-react';

export default function HypothesisCard({ hypothesis, onClick }) {
  const [showPreview, setShowPreview] = useState(false);

  const getStatusBadge = (status) => {
    const badges = {
      'needs-research': { label: 'Butuh Riset', class: 'badge-amber' },
      'proven': { label: 'Terbukti', class: 'badge-emerald' },
      'broken': { label: 'Terpatahkan', class: 'badge-red' }
    };
    return badges[status] || badges['needs-research'];
  };

  const badge = getStatusBadge(hypothesis.status);
  const avatarLetter = (hypothesis.title || 'J')[0].toUpperCase();

  // Estimate read time (words / 200 wpm)
  const wordCount = (hypothesis.content || '').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <>
      <div className="card card-hover p-6 animate-fade-up" onClick={onClick}>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Avatar */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-serif font-semibold text-xl"
              style={{
                background: 'linear-gradient(135deg, var(--emerald-100), var(--amber-100))',
                color: 'var(--emerald-900)'
              }}
            >
              {avatarLetter}
            </div>

            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-lg leading-snug mb-2 line-clamp-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {hypothesis.title || 'Tanpa Judul'}
              </h3>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
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
                <span className="flex items-center gap-1.5">
                  ⏱️ {readTime} min baca
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
            className="text-sm leading-relaxed line-clamp-3 mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            {hypothesis.content}
          </p>
        )}

        {/* Tags */}
        {(hypothesis.hypothesis || hypothesis.supporting || hypothesis.counter) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hypothesis.hypothesis && (
              <span className="tag">
                <span className="font-semibold" style={{ color: '#8B5CF6' }}>H</span>
                Hipotesa
              </span>
            )}
            {hypothesis.supporting && (
              <span className="tag">
                <span className="font-semibold" style={{ color: '#22C55E' }}>A</span>
                Argumen
              </span>
            )}
            {hypothesis.counter && (
              <span className="tag">
                <span className="font-semibold" style={{ color: '#F59E0B' }}>K</span>
                Kontra
              </span>
            )}
          </div>
        )}

        {/* Meta Footer */}
        <div
          className="flex items-center justify-between pt-4 border-t"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-4">
            {hypothesis.relatedIds?.length > 0 && (
              <span
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <Link2 className="w-3.5 h-3.5" />
                {hypothesis.relatedIds.length} terkait
              </span>
            )}
            {hypothesis.sources?.length > 0 && (
              <span
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                {hypothesis.sources.length} sumber
              </span>
            )}
            {hypothesis.timeline?.length > 0 && (
              <span
                className="flex items-center gap-1.5 text-xs"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <CircleDot className="w-3.5 h-3.5" />
                {hypothesis.timeline.length} update
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
              style={{ background: 'var(--bg-tertiary)' }}
              title="Bookmark"
            >
              <Bookmark className="w-3.5 h-3.5" style={{ color: 'var(--text-tertiary)' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div
            className="modal-content w-full max-w-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <span className={`badge ${badge.class} mb-3`}>{badge.label}</span>
                <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {hypothesis.title || 'Tanpa Judul'}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  {hypothesis.author && (
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      {hypothesis.author}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatDate(hypothesis.createdAt)}
                  </span>
                  <span>⏱️ {readTime} min baca</span>
                </div>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            {/* Full Content */}
            <div className="font-content" style={{ color: 'var(--text-secondary)' }}>
              {hypothesis.content || 'Tidak ada konten'}
            </div>

            {/* Sources if any */}
            {hypothesis.sources?.length > 0 && (
              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Sumber Referensi
                </h4>
                <div className="space-y-2">
                  {hypothesis.sources.map((source) => (
                    <div
                      key={source.id}
                      className="p-3 rounded-xl"
                      style={{ background: 'var(--bg-tertiary)' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                            {source.title}
                          </p>
                          {source.author && (
                            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                              {source.author}
                            </p>
                          )}
                        </div>
                        {source.url && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'var(--emerald-100)', color: 'var(--emerald-900)' }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 pt-6 border-t flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => {
                  setShowPreview(false);
                  onClick();
                }}
                className="btn btn-primary flex-1"
              >
                Buka Jurnal
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="btn btn-outline flex-1"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
