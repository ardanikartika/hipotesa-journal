import { useState, useMemo } from 'react';
import HypothesisCard from './HypothesisCard';
import { Search, Shuffle, Download, Upload, X, FileText, Filter } from 'lucide-react';
import api from '../utils/api';

export default function Archive({ hypotheses, onSelectHypothesis, onGetRandom, searchQuery = '' }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [importing, setImporting] = useState(false);

  const filteredHypotheses = useMemo(() => {
    return hypotheses.filter(h => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query ||
        h.title?.toLowerCase().includes(query) ||
        h.content?.toLowerCase().includes(query) ||
        h.author?.toLowerCase().includes(query) ||
        h.hypothesis?.toLowerCase().includes(query);

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

  const filterTabs = [
    { key: 'all', label: 'Semua', count: statusCounts.all },
    { key: 'needs-research', label: 'Butuh Riset', count: statusCounts['needs-research'] },
    { key: 'proven', label: 'Terbukti', count: statusCounts['proven'] },
    { key: 'broken', label: 'Terpatahkan', count: statusCounts['broken'] },
  ];

  const getFilterStyle = (key, isActive) => {
    if (!isActive) {
      return {
        background: 'var(--bg-tertiary)',
        color: 'var(--text-secondary)'
      };
    }
    if (key === 'proven') return { background: 'var(--emerald-100)', color: 'var(--emerald-900)' };
    if (key === 'broken') return { background: '#FEE2E2', color: '#DC2626' };
    return { background: 'var(--amber-100)', color: '#996633' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Arsip Jurnal
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            {filteredHypotheses.length} dari {hypotheses.length} jurnal
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onGetRandom}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--bg-tertiary)' }}
            title="Jurnal Acak"
          >
            <Shuffle className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button
            onClick={handleExport}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--bg-tertiary)' }}
            title="Export"
          >
            <Download className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
          <label
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105 cursor-pointer"
            style={{ background: 'var(--bg-tertiary)' }}
            title="Import"
          >
            <Upload className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
          </label>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
        {filterTabs.map((filter) => {
          const isActive = filterStatus === filter.key;
          const style = getFilterStyle(filter.key, isActive);
          return (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2"
              style={style}
            >
              {filter.label}
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: isActive ? 'rgba(0,0,0,0.1)' : 'var(--border)',
                  color: 'inherit'
                }}
              >
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredHypotheses.length === 0 && (
        <div className="empty-state animate-fade-up">
          <div className="empty-state-icon">
            <FileText className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {searchQuery || filterStatus !== 'all' ? 'Tidak ditemukan' : 'Belum ada jurnal'}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {searchQuery || filterStatus !== 'all'
              ? 'Coba kata kunci atau filter lain'
              : 'Mulai dengan membuat jurnal baru'}
          </p>
        </div>
      )}

      {/* Journal List */}
      <div className="space-y-4">
        {filteredHypotheses.map((hypothesis, index) => (
          <div
            key={hypothesis.id}
            className="animate-fade-up"
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
