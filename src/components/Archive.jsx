import { useState, useMemo } from 'react';
import HypothesisCard from './HypothesisCard';
import { Search, Shuffle, Download, Upload, X } from 'lucide-react';
import api from '../utils/api';

export default function Archive({ hypotheses, onSelectHypothesis, onGetRandom }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [importing, setImporting] = useState(false);

  const filteredHypotheses = useMemo(() => {
    return hypotheses.filter(h => {
      const matchesSearch = searchQuery === '' ||
        h.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.hypothesis?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || h.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [hypotheses, searchQuery, filterStatus]);

  const handleExport = async () => {
    try {
      const data = await api.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hipotesa-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await api.importData(data);
      window.location.reload();
    } catch (err) {
      console.error('Import failed:', err);
      alert('Gagal import data');
    } finally {
      setImporting(false);
    }
  };

  const statusCounts = useMemo(() => ({
    all: hypotheses.length,
    'needs-research': hypotheses.filter(h => h.status === 'needs-research').length,
    'proven': hypotheses.filter(h => h.status === 'proven').length,
    'broken': hypotheses.filter(h => h.status === 'broken').length,
  }), [hypotheses]);

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-xl text-[var(--text-primary)]">
            Arsip
          </h2>
          <p className="text-sm text-[var(--text-tertiary)]">
            {filteredHypotheses.length} dari {hypotheses.length} catatan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onGetRandom}
            className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--amber)] transition-all"
            title="Catatan acak"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--green)] transition-all"
            title="Export"
          >
            <Download className="w-4 h-4" />
          </button>
          <label className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all cursor-pointer">
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
          </label>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
        <input
          type="text"
          placeholder="Cari hipotesa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
        {[
          { key: 'all', label: 'Semua', count: statusCounts.all },
          { key: 'needs-research', label: 'Riset', icon: '🔍', count: statusCounts['needs-research'] },
          { key: 'proven', label: 'Benar', icon: '✅', count: statusCounts['proven'] },
          { key: 'broken', label: 'Patah', icon: '❌', count: statusCounts['broken'] },
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterStatus === filter.key
                ? filter.key === 'proven' ? 'bg-[var(--green)] text-white'
                  : filter.key === 'broken' ? 'bg-[var(--rose)] text-white'
                  : 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
            }`}
          >
            {filter.icon} {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredHypotheses.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-tertiary)] mx-auto mb-4 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-[var(--text-tertiary)]">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="font-semibold text-[var(--text-primary)] mb-1">
            {searchQuery || filterStatus !== 'all' ? 'Tidak ditemukan' : 'Belum ada hipotesa'}
          </h3>
          <p className="text-sm text-[var(--text-tertiary)]">
            {searchQuery || filterStatus !== 'all' ? 'Coba kata kunci lain' : 'Mulai catat hipotesa pertamamu'}
          </p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filteredHypotheses.map((hypothesis, index) => (
          <div
            key={hypothesis.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <HypothesisCard
              hypothesis={hypothesis}
              onClick={() => onSelectHypothesis(hypothesis.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
