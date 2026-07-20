import { useState, useMemo } from 'react';
import HypothesisCard from './HypothesisCard';
import { Search, Shuffle, Download, Upload, X } from 'lucide-react';
import api from '../utils/api';

export default function Archive({ items, onSelect, onRandom }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return items.filter(h => {
      const q = search.toLowerCase();
      const matchSearch = !q || h.title?.toLowerCase().includes(q) || h.content?.toLowerCase().includes(q) || h.author?.toLowerCase().includes(q);
      const matchFilter = filter === 'all' || h.status === filter;
      return matchSearch && matchFilter;
    });
  }, [items, search, filter]);

  const counts = useMemo(() => ({
    all: items.length,
    'needs-research': items.filter(h => h.status === 'needs-research').length,
    'proven': items.filter(h => h.status === 'proven').length,
    'broken': items.filter(h => h.status === 'broken').length,
  }), [items]);

  const filters = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'needs-research', label: 'Research', count: counts['needs-research'] },
    { key: 'proven', label: 'Proven', count: counts['proven'] },
    { key: 'broken', label: 'Broken', count: counts['broken'] },
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
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await api.importData(data);
      window.location.reload();
    } catch (err) {
      console.error('Import failed:', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--light-gray)' }} />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-14 pr-12"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2">
            <X className="w-5 h-5" style={{ color: 'var(--light-gray)' }} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-6 px-6">
        {filters.map(f => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: active ? 'var(--charcoal)' : 'var(--cream-dark)',
                color: active ? 'var(--cream)' : 'var(--warm-gray)'
              }}
            >
              {f.label} ({f.count})
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onRandom} className="btn btn-ghost flex-1 py-3">
          <Shuffle className="w-4 h-4" /> Random
        </button>
        <button onClick={handleExport} className="btn btn-ghost py-3 px-5">
          <Download className="w-4 h-4" />
        </button>
        <label className="btn btn-ghost py-3 px-5 cursor-pointer">
          <Upload className="w-4 h-4" />
          <input type="file" accept=".json" onChange={handleImport} className="hidden" />
        </label>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center text-4xl" style={{ background: 'var(--cream-dark)' }}>
            📝
          </div>
          <h3 className="font-semibold text-lg mb-2">{search || filter !== 'all' ? 'No results' : 'No items yet'}</h3>
          <p className="text-sm" style={{ color: 'var(--warm-gray)' }}>
            {search || filter !== 'all' ? 'Try different keywords' : 'Create your first item'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((item, i) => (
            <div key={item.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <HypothesisCard item={item} onClick={() => onSelect(item.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
