import { PenLine, Archive, RefreshCw, BookOpen } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, isConnected, onRefresh }) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom border-t"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="flex items-center justify-around h-16 px-4">
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
            background: activeTab === 'input' ? 'var(--emerald-100)' : 'transparent',
            color: activeTab === 'input' ? 'var(--emerald-900)' : 'var(--text-tertiary)'
          }}
        >
          <div
            className="p-2.5 rounded-xl transition-all"
            style={{
              background: activeTab === 'input' ? 'var(--emerald-900)' : 'var(--bg-tertiary)'
            }}
          >
            <PenLine
              className="w-5 h-5"
              style={{ color: activeTab === 'input' ? 'white' : 'var(--text-secondary)' }}
            />
          </div>
          <span className="text-[10px] font-semibold">Baru</span>
        </button>

        {/* Archive */}
        <button
          onClick={() => onTabChange('archive')}
          className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
            activeTab === 'archive' ? 'scale-110' : ''
          }`}
          style={{
            background: activeTab === 'archive' ? 'var(--emerald-100)' : 'transparent',
            color: activeTab === 'archive' ? 'var(--emerald-900)' : 'var(--text-tertiary)'
          }}
        >
          <div
            className="p-2.5 rounded-xl transition-all"
            style={{
              background: activeTab === 'archive' ? 'var(--emerald-900)' : 'var(--bg-tertiary)'
            }}
          >
            <Archive
              className="w-5 h-5"
              style={{ color: activeTab === 'archive' ? 'white' : 'var(--text-secondary)' }}
            />
          </div>
          <span className="text-[10px] font-semibold">Arsip</span>
        </button>

        {/* Status */}
        <div className="flex flex-col items-center gap-1 p-2">
          <div className="relative">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: isConnected ? 'var(--success)' : 'var(--slate-400)' }}
            />
            {isConnected && (
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: 'var(--success)', opacity: 0.5 }}
              />
            )}
          </div>
          <span
            className="text-[10px] font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {isConnected ? 'Online' : 'Cache'}
          </span>
        </div>
      </div>
    </nav>
  );
}
