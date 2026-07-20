import { useState } from 'react';
import { STATUS_LABELS } from '../types';
import { formatDateTime } from '../utils/helpers';
import { Copy, Shuffle, Trash2, Edit3, Plus, Clock, Link2, Check, ArrowLeft, BookOpen, ExternalLink, Share2, Quote, Eye, EyeOff } from 'lucide-react';

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
  const [showTimelineInput, setShowTimelineInput] = useState(false);
  const [timelineContent, setTimelineContent] = useState('');
  const [addingTimeline, setAddingTimeline] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const relatedHypotheses = hypothesis.relatedIds
    ?.map(id => allHypotheses.find(h => h.id === id))
    .filter(Boolean) || [];

  // Generate APA Citation
  const generateCitation = () => {
    const author = hypothesis.author || 'Anonim';
    const year = new Date(hypothesis.createdAt).getFullYear();
    const title = hypothesis.title || 'Tanpa Judul';
    return `${author} (${year}). ${title}. Diambil dari Hipotesa Journal.`;
  };

  // Generate MLA Citation
  const generateMLACitation = () => {
    const author = hypothesis.author || 'Anonim';
    const title = hypothesis.title || 'Tanpa Judul';
    const date = formatDateTime(hypothesis.createdAt);
    return `"${title}." Hipotesa Journal, ${date}, oleh ${author}.`;
  };

  const handleCopyCitation = async (format = 'APA') => {
    const citation = format === 'APA' ? generateCitation() : generateMLACitation();
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareMenu(false);
    }, 2000);
  };

  const handleCopyWhatsApp = async () => {
    const lines = [
      '📝 HIPOTESA',
      '',
      `${hypothesis.title || 'Tanpa Judul'}`,
      `👤 Pencetus: ${hypothesis.author || 'Anonim'}`,
      `🔍 Status: ${STATUS_LABELS[hypothesis.status] || 'Butuh Riset'}`,
      '',
      hypothesis.hypothesis && '📌 Hipotesa Utama:',
      hypothesis.hypothesis && hypothesis.hypothesis,
      '',
      hypothesis.supporting && '👍 Argumen Pendukung:',
      hypothesis.supporting && hypothesis.supporting,
      '',
      hypothesis.counter && '📌 Sanggahan / Kontra:',
      hypothesis.counter && hypothesis.counter,
      '',
      '---',
      'Dicatat via Hipotesa Journal'
    ].filter(Boolean).join('\n');

    await navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareMenu(false);
    }, 2000);
  };

  const handleAddTimeline = async () => {
    if (!timelineContent.trim()) return;
    setAddingTimeline(true);
    try {
      await onAddTimeline(timelineContent.trim());
      setTimelineContent('');
      setShowTimelineInput(false);
    } catch (error) {
      console.error('Failed to add timeline:', error);
    } finally {
      setAddingTimeline(false);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div className={`min-h-screen animate-fade-in ${zenMode ? 'zen-mode' : ''}`} style={{ background: 'var(--bg-primary)' }}>
      {/* Header - Hidden in Zen Mode */}
      {!zenMode && (
        <header
          className="sticky top-0 z-10 border-b px-5 py-4"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm font-medium transition-all hover:scale-105"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>

            <div className="flex items-center gap-2">
              {/* Zen Mode Toggle */}
              <button
                onClick={() => setZenMode(true)}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'var(--bg-tertiary)' }}
                title="Mode Zen"
              >
                <Eye className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>

              <button
                onClick={onGetRandom}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'var(--bg-tertiary)' }}
                title="Jurnal Acak"
              >
                <Shuffle className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>

              <button
                onClick={onEdit}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                style={{ background: 'var(--bg-tertiary)' }}
                title="Edit"
              >
                <Edit3 className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </button>

              <button
                onClick={handleDelete}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  confirmDelete ? 'scale-110' : 'hover:scale-105'
                }`}
                style={{
                  background: confirmDelete ? '#FEE2E2' : 'var(--bg-tertiary)',
                  color: confirmDelete ? '#DC2626' : 'var(--text-secondary)'
                }}
                title={confirmDelete ? 'Klik lagi untuk konfirmasi' : 'Hapus'}
              >
                {confirmDelete ? <Check className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Zen Mode Exit Button */}
      {zenMode && (
        <button
          onClick={() => setZenMode(false)}
          className="fixed top-4 right-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 animate-fade-in"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <EyeOff className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
        </button>
      )}

      {/* Content */}
      <main className={`max-w-3xl mx-auto px-5 py-8 ${zenMode ? 'pt-16' : ''}`}>
        {/* Title & Meta */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
            {hypothesis.title || 'Tanpa Judul'}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {hypothesis.author && (
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ background: 'var(--emerald-100)', color: 'var(--emerald-900)' }}>
                  👤
                </span>
                {hypothesis.author}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDateTime(hypothesis.createdAt)}
            </span>
          </div>

          <span
            className={`badge mt-4 ${
              hypothesis.status === 'proven' ? 'badge-emerald'
                : hypothesis.status === 'broken' ? 'badge-red'
                : 'badge-amber'
            }`}
          >
            {STATUS_LABELS[hypothesis.status] || 'Butuh Riset'}
          </span>
        </div>

        {/* Content */}
        {hypothesis.content && (
          <div className="mb-8">
            <p className="font-content" style={{ color: 'var(--text-secondary)' }}>
              {hypothesis.content}
            </p>
          </div>
        )}

        {/* Structured Content */}
        {(hypothesis.hypothesis || hypothesis.supporting || hypothesis.counter) && (
          <div className="space-y-4 mb-8">
            {hypothesis.hypothesis && (
              <div className="card p-6 border-l-4" style={{ borderLeftColor: '#8B5CF6' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white" style={{ background: '#8B5CF6' }}>
                    H
                  </span>
                  <span className="font-medium" style={{ color: '#8B5CF6' }}>Hipotesa Utama</span>
                </div>
                <p className="font-content" style={{ color: 'var(--text-secondary)' }}>
                  {hypothesis.hypothesis}
                </p>
              </div>
            )}

            {hypothesis.supporting && (
              <div className="card p-6 border-l-4" style={{ borderLeftColor: '#22C55E' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white" style={{ background: '#22C55E' }}>
                    A
                  </span>
                  <span className="font-medium" style={{ color: '#22C55E' }}>Argumen Pendukung</span>
                </div>
                <p className="font-content" style={{ color: 'var(--text-secondary)' }}>
                  {hypothesis.supporting}
                </p>
              </div>
            )}

            {hypothesis.counter && (
              <div className="card p-6 border-l-4" style={{ borderLeftColor: '#F59E0B' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white" style={{ background: '#F59E0B' }}>
                    K
                  </span>
                  <span className="font-medium" style={{ color: '#F59E0B' }}>Sanggahan / Kontra</span>
                </div>
                <p className="font-content" style={{ color: 'var(--text-secondary)' }}>
                  {hypothesis.counter}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Sources */}
        {hypothesis.sources?.length > 0 && (
          <div className="mb-8">
            <h3 className="flex items-center gap-2 font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              <BookOpen className="w-5 h-5" style={{ color: '#06B6D4' }} />
              Sumber Referensi
            </h3>
            <div className="space-y-3">
              {hypothesis.sources.map((source) => (
                <div
                  key={source.id}
                  className="card p-4"
                  style={{ borderLeftColor: '#06B6D4', borderLeftWidth: '3px' }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {source.title}
                      </p>
                      {source.author && (
                        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                          {source.author}
                        </p>
                      )}
                      {source.notes && (
                        <p className="text-sm mt-2 italic" style={{ color: 'var(--text-tertiary)' }}>
                          "{source.notes}"
                        </p>
                      )}
                    </div>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                        style={{ background: 'var(--emerald-50)', color: 'var(--emerald-900)' }}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Hypotheses */}
        {relatedHypotheses.length > 0 && (
          <div className="mb-8">
            <h3 className="flex items-center gap-2 font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              <Link2 className="w-5 h-5" style={{ color: '#8B5CF6' }} />
              Berkaitan dengan ({relatedHypotheses.length})
            </h3>
            <div className="space-y-2">
              {relatedHypotheses.map((related) => (
                <button
                  key={related.id}
                  onClick={() => onNavigateToRelated(related.id)}
                  className="w-full card card-hover p-4 text-left"
                >
                  <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {related.title || 'Tanpa Judul'}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    oleh {related.author || 'Anonim'} • {formatDateTime(related.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 font-semibold" style={{ color: 'var(--text-primary)' }}>
              <Clock className="w-5 h-5" style={{ color: 'var(--emerald-600)' }} />
              Perkembangan / Log Update
            </h3>
            <button
              onClick={() => setShowTimelineInput(!showTimelineInput)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{ background: 'var(--emerald-50)', color: 'var(--emerald-900)' }}
            >
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>

          {showTimelineInput && (
            <div
              className="p-4 rounded-xl mb-4 animate-fade-up"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              <textarea
                value={timelineContent}
                onChange={(e) => setTimelineContent(e.target.value)}
                placeholder="Catat perkembangan atau temuan baru..."
                rows={3}
                className="text-sm mb-3"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddTimeline}
                  disabled={addingTimeline || !timelineContent.trim()}
                  className="btn btn-primary text-sm py-2 px-4"
                >
                  {addingTimeline ? 'Menyimpan...' : '💾 Simpan'}
                </button>
                <button
                  onClick={() => {
                    setShowTimelineInput(false);
                    setTimelineContent('');
                  }}
                  className="btn btn-outline text-sm py-2 px-4"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {hypothesis.timeline?.length > 0 ? (
            <div className="space-y-3">
              {[...hypothesis.timeline].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl border-l-4"
                  style={{
                    background: 'var(--bg-secondary)',
                    borderLeftColor: 'var(--emerald-600)'
                  }}
                >
                  <p className="font-content" style={{ color: 'var(--text-secondary)' }}>
                    {entry.content}
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                    📅 {formatDateTime(entry.date)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
              Belum ada perkembangan tercatat
            </p>
          )}
        </div>
      </main>

      {/* Bottom Share Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 border-t p-4"
        style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-3xl mx-auto relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              showShareMenu ? 'scale-100' : 'hover:scale-[1.01]'
            }`}
            style={{
              background: copied ? 'var(--success)' : 'var(--emerald-900)',
              color: 'white'
            }}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" />
                Tersalin!
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                {showShareMenu ? 'Tutup' : 'Bagikan'}
              </>
            )}
          </button>

          {showShareMenu && (
            <div
              className="absolute bottom-full left-0 right-0 mb-2 p-3 rounded-xl animate-fade-up space-y-2"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--card-shadow-hover)'
              }}
            >
              <button
                onClick={handleCopyWhatsApp}
                className="w-full py-3 rounded-xl font-medium text-left px-4 transition-all hover:scale-[1.01]"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                📱 Salin untuk WhatsApp
              </button>
              <button
                onClick={() => handleCopyCitation('APA')}
                className="w-full py-3 rounded-xl font-medium text-left px-4 transition-all hover:scale-[1.01]"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                📚 Salin Sitasi APA
              </button>
              <button
                onClick={() => handleCopyCitation('MLA')}
                className="w-full py-3 rounded-xl font-medium text-left px-4 transition-all hover:scale-[1.01]"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                📖 Salin Sitasi MLA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
