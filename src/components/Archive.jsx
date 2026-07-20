import React, { useState, useMemo } from 'react';
import { Search, Filter, Shuffle, Download, Upload, X } from 'lucide-react';
import { STATUS_LABELS } from '../types';
import HypothesisCard from './HypothesisCard';
import api from '../utils/api';

export default function Archive({
  hypotheses,
  onSelectHypothesis,
  onGetRandom,
  onImport
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterAuthor, setFilterAuthor] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [importing, setImporting] = useState(false);

  // Get unique authors
  const authors = useMemo(() => {
    const authorSet = new Set(hypotheses.map(h => h.author).filter(Boolean));
    return Array.from(authorSet).sort();
  }, [hypotheses]);

  // Filter hypotheses
  const filteredHypotheses = useMemo(() => {
    return hypotheses.filter(h => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          h.title?.toLowerCase().includes(query) ||
          h.content?.toLowerCase().includes(query) ||
          h.author?.toLowerCase().includes(query) ||
          h.hypothesis?.toLowerCase().includes(query) ||
          h.supporting?.toLowerCase().includes(query) ||
          h.counter?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filterStatus !== 'all' && h.status !== filterStatus) {
        return false;
      }

      // Author filter
      if (filterAuthor !== 'all' && h.author !== filterAuthor) {
        return false;
      }

      return true;
    });
  }, [hypotheses, searchQuery, filterStatus, filterAuthor]);

  const handleExport = async () => {
    try {
      await api.exportData();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await onImport(data);
      e.target.value = '';
    } catch (error) {
      console.error('Import failed:', error);
      alert('Gagal import data. Pastikan file JSON valid.');
    } finally {
      setImporting(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setFilterAuthor('all');
  };

  const hasActiveFilters = searchQuery || filterStatus !== 'all' || filterAuthor !== 'all';

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-2xl font-bold text-slate-100">
          Arsip Hipotesa
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={onGetRandom}
            className="p-2 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-all"
            title="Buka Hipotesa Acak"
          >
            <Shuffle className="w-5 h-5" />
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
            title="Export Backup"
          >
            <Download className="w-5 h-5" />
          </button>
          <label className="p-2 rounded-lg text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all cursor-pointer">
            <Upload className="w-5 h-5" />
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari hipotesa, nama, atau isi..."
          className="w-full pl-12 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-100 placeholder-slate-500 focus:border-accent-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-accent-500/20 text-accent-400'
              : 'bg-white/5 text-slate-400 hover:text-slate-300'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filter
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-accent-400" />
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            Reset
          </button>
        )}

        <span className="text-sm text-slate-500">
          {filteredHypotheses.length} dari {hypotheses.length}
        </span>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4 animate-fade-in">
          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Status</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-white/20 text-slate-200'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Semua
              </button>
              {['needs-research', 'proven', 'broken'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-accent-500/20 text-accent-400'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          {/* Author Filter */}
          {authors.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-400">Pencetus</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterAuthor('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filterAuthor === 'all'
                      ? 'bg-white/20 text-slate-200'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  Semua
                </button>
                {authors.map((author) => (
                  <button
                    key={author}
                    onClick={() => setFilterAuthor(author)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      filterAuthor === author
                        ? 'bg-accent-500/20 text-accent-400'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    {author}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hypothesis List */}
      {filteredHypotheses.length > 0 ? (
        <div className="space-y-3">
          {filteredHypotheses.map((hypothesis, index) => (
            <div
              key={hypothesis.id}
              className={`animate-fade-in stagger-${Math.min(index + 1, 5)}`}
              style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
            >
              <HypothesisCard
                hypothesis={hypothesis}
                onClick={() => onSelectHypothesis(hypothesis.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 space-y-4">
          <div className="text-6xl opacity-30">📝</div>
          <div>
            <p className="text-slate-300 font-medium">
              {hasActiveFilters ? 'Tidak ada hasil' : 'Belum ada hipotesa'}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {hasActiveFilters
                ? 'Coba ubah filter pencarian'
                : 'Mulai dengan membuat hipotesa baru'}
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg bg-accent-500/20 text-accent-400 hover:bg-accent-500/30 transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
