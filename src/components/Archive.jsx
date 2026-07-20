import { useState, useMemo } from 'react';
import HypothesisCard from './HypothesisCard';
import { Search, Shuffle, Download, Upload, X } from 'lucide-react';
import api from '../utils/api';

export default function Archive({ hypotheses, onSelectHypothesis, onGetRandom }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [importing, setImporting] = useState(false);

  const filtered = useMemo(() => {
    return hypotheses.filter(h => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        h.title?.toLowerCase().includes(q) ||
        h.content?.toLowerCase().includes(q) ||
        h.author?.toLowerCase().includes(q);
      const matchFilter = filter === 'all' || h.status === filter;
      return matchSearch && matchFilter;
    });
  }, [hypotheses, search, filter]);

  const counts = useMemo(() => ({
    all: hypotheses.length,
    'needs-research': hypotheses.filter(h => h.status === 'needs-research').length,
    'proven': hypotheses.filter(h => h.status === 'proven').length,
    'broken': hypotheses.filter(h => h.status === 'broken').length,
  }), [hypotheses]);

  const filters = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'needs-research', label: 'Riset', count: counts['needs-research'] },
    { key: 'proven', label: 'Benar', count: counts['proven'] },
    { key: 'broken', label: 'Patah', count: counts['broken'] },
  ];

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

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
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

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 pr-10"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-5 px-5">
        {filters.map(f => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: active ? 'var(--indigo-500)' : 'var(--slate-100)',
                color: active ? 'white' : 'var(--text-secondary)'
              }}
            >
              {f.label} ({f.count})
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onGetRandom} className="btn btn-ghost flex-1 py-3 text-sm">
          <Shuffle className="w-4 h-4" /> Random
        </button>
        <button onClick={handleExport} className="btn btn-ghost py-3 px-4">
          <Download className="w-4 h-4" />
        </button>
        <label className="btn btn-ghost py-3 px-4 cursor-pointer">
          <Upload className="w-4 h-4" />
          <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
        </label>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--slate-100)' }}>
            <span className="text-3xl">📝</span>
          </div>
          <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
            {search || filter !== 'all' ? 'No results' : 'No items yet'}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {search || filter !== 'all' ? 'Try different keywords' : 'Create your first item'}
          </p>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map((h, i) => (
            <div key={h.id} className="animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
              <HypothesisCard hypothesis={h} onClick={() => onSelectHypothesis(h.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
