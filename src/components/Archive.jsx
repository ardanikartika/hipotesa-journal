import { useState, useMemo } from 'react';
import HypothesisCard from './HypothesisCard';
import { Search, Shuffle, Download, Upload, X, FileText } from 'lucide-react';
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
        h.author?.toLowerCase().includes(searchQuery.toLowerCase());

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
      alert('Import failed');
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
    { key: 'all', label: 'All', count: statusCounts.all },
    { key: 'needs-research', label: 'Research', count: statusCounts['needs-research'] },
    { key: 'proven', label: 'Proven', count: statusCounts['proven'] },
    { key: 'broken', label: 'Broken', count: statusCounts['broken'] },
  ];

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif font-semibold text-2xl" style={{ color: 'var(--text-primary)' }}>
            Archive
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
            {filteredHypotheses.length} of {hypotheses.length} journals
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onGetRandom}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ background: 'var(--bg-tertiary)' }}
            title="Random"
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

      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
          style={{ color: 'var(--text-tertiary)' }}
        />
        <input
          type="text"
          placeholder="Search journals..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 pr-10"
          style={{ background: 'var(--bg-tertiary)' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full transition-all hover:scale-110"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
        {filterTabs.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setFilterStatus(filter.key)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
            style={{
              background: filterStatus === filter.key ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: filterStatus === filter.key ? 'white' : 'var(--text-secondary)'
            }}
          >
            {filter.label}
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-xs"
              style={{
                background: filterStatus === filter.key ? 'rgba(255,255,255,0.2)' : 'var(--border)',
                color: 'inherit'
              }}
            >
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredHypotheses.length === 0 && (
        <div className="empty-state animate-fade-up">
          <div className="empty-state-icon">
            <FileText className="w-7 h-7" style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <h3 className="font-serif font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
            {searchQuery || filterStatus !== 'all' ? 'No results found' : 'No journals yet'}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {searchQuery || filterStatus !== 'all'
              ? 'Try different keywords or filters'
              : 'Start documenting your hypotheses'}
          </p>
        </div>
      )}

      {/* Journal List */}
      <div className="space-y-4">
        {filteredHypotheses.map((hypothesis, index) => (
          <div
            key={hypothesis.id}
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
