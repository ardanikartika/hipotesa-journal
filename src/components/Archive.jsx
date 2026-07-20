import { useState, useMemo } from 'react';
import HypothesisCard from './HypothesisCard';
import { Search, Shuffle, Download, Upload, X } from 'lucide-react';
import api from '../utils/api';

export default function Archive({ hypotheses, onSelectHypothesis, onGetRandom, searchQuery = '' }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [localSearch, setLocalSearch] = useState('');
  const [importing, setImporting] = useState(false);

  const search = searchQuery || localSearch;

  const filteredHypotheses = useMemo(() => {
    return hypotheses.filter(h => {
      const query = search.toLowerCase();
      const matchesSearch = !query ||
        h.title?.toLowerCase().includes(query) ||
        h.content?.toLowerCase().includes(query) ||
        h.author?.toLowerCase().includes(query);

      const matchesStatus = filterStatus === 'all' || h.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [hypotheses, search, filterStatus]);

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

  const filters = [
    { key: 'all', label: 'Semua', count: statusCounts.all },
    { key: 'needs-research', label: 'Riset', count: statusCounts['needs-research'] },
    { key: 'proven', label: 'Terbukti', count: statusCounts['proven'] },
    { key: 'broken', label: 'Patah', count: statusCounts['broken'] },
  ];

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          placeholder="Cari jurnal..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-12 pr-4"
        />
        {localSearch && (
          <button
            onClick={() => setLocalSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <X className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-5 px-5">
        {filters.map((filter) => {
          const isActive = filterStatus === filter.key;
          let style = {};
          if (isActive) {
            if (filter.key === 'proven') style = { background: 'var(--accent)', color: 'white' };
            else if (filter.key === 'broken') style = { background: 'var(--rose)', color: 'white' };
            else style = { background: 'var(--accent)', color: 'white' };
          } else {
            style = { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' };
          }
          return (
            <button
              key={filter.key}
              onClick={() => setFilterStatus(filter.key)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap"
              style={style}
            >
              {filter.label} ({filter.count})
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onGetRandom} className="btn btn-ghost flex-1 py-3">
          <Shuffle className="w-4 h-4" />
          Acak
        </button>
        <button onClick={handleExport} className="btn btn-ghost py-3 px-4">
          <Download className="w-4 h-4" />
        </button>
        <label className="btn btn-ghost py-3 px-4 cursor-pointer">
          <Upload className="w-4 h-4" />
          <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
        </label>
      </div>

      {/* List */}
      {filteredHypotheses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {search || filterStatus !== 'all' ? 'Tidak ditemukan' : 'Belum ada jurnal'}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {search || filterStatus !== 'all' ? 'Coba kata kunci lain' : 'Tekan + untuk membuat jurnal baru'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHypotheses.map((h, i) => (
            <div key={h.id} className="animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
              <HypothesisCard hypothesis={h} onClick={() => onSelectHypothesis(h.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
