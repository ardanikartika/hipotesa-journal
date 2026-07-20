import { PenLine, Archive, RefreshCw } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, isConnected, onRefresh }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 safe-bottom border-t"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-4">
        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-[10px] font-medium">Sync</span>
        </button>

        {/* Input */}
        <button
          onClick={() => onTabChange('input')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
            activeTab === 'input' ? 'scale-110' : ''
          }`}
          style={{
            background: activeTab === 'input' ? 'var(--accent-soft)' : 'transparent',
            color: activeTab === 'input' ? 'var(--accent)' : 'var(--text-tertiary)'
          }}
        >
          <div
            className="p-2.5 rounded-xl transition-all"
            style={{
              background: activeTab === 'input' ? 'var(--accent)' : 'var(--bg-tertiary)'
            }}
          >
            <PenLine
              className="w-5 h-5"
              style={{ color: activeTab === 'input' ? 'white' : 'var(--text-secondary)' }}
            />
          </div>
          <span className="text-[10px] font-semibold" style={{ color: 'inherit' }}>
            New
          </span>
        </button>

        {/* Archive */}
        <button
          onClick={() => onTabChange('archive')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            activeTab === 'archive' ? 'scale-110' : ''
          }`}
          style={{
            background: activeTab === 'archive' ? 'var(--accent-soft)' : 'transparent',
            color: activeTab === 'archive' ? 'var(--accent)' : 'var(--text-tertiary)'
          }}
        >
          <div
            className="p-2.5 rounded-xl transition-all"
            style={{
              background: activeTab === 'archive' ? 'var(--accent)' : 'var(--bg-tertiary)'
            }}
          >
            <Archive
              className="w-5 h-5"
              style={{ color: activeTab === 'archive' ? 'white' : 'var(--text-secondary)' }}
            />
          </div>
          <span className="text-[10px] font-semibold" style={{ color: 'inherit' }}>
            Archive
          </span>
        </button>

        {/* Status */}
        <div className="flex flex-col items-center gap-1 p-2">
          <div className="relative">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: isConnected ? '#22c55e' : 'var(--slate-400)' }}
            />
            {isConnected && (
              <div
                className="absolute inset-0 rounded-full pulse-ring"
                style={{ background: '#22c55e' }}
              />
            )}
          </div>
          <span
            className="text-[10px] font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {isConnected ? 'Live' : 'Cache'}
          </span>
        </div>
      </div>
    </nav>
  );
}
