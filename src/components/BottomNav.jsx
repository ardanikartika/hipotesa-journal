import { PenLine, Archive, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, isConnected, onRefresh }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="nav-item"
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${isConnected ? '' : 'text-[var(--amber)]'}`} />
          <span className="text-[10px]">
            {isConnected ? 'Sync' : 'Offline'}
          </span>
        </button>

        {/* Input */}
        <button
          onClick={() => onTabChange('input')}
          className={`nav-item ${activeTab === 'input' ? 'active' : ''}`}
        >
          <div className={`p-2.5 rounded-xl transition-all ${activeTab === 'input' ? 'bg-[var(--accent)] text-white' : ''}`}>
            <PenLine className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Input</span>
        </button>

        {/* Archive */}
        <button
          onClick={() => onTabChange('archive')}
          className={`nav-item ${activeTab === 'archive' ? 'active' : ''}`}
        >
          <div className={`p-2.5 rounded-xl transition-all ${activeTab === 'archive' ? 'bg-[var(--accent)] text-white' : ''}`}>
            <Archive className="w-5 h-5" />
          </div>
          <span className="text-[10px]">Arsip</span>
        </button>

        {/* Status */}
        <div className="nav-item">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-[var(--green)]" />
          ) : (
            <WifiOff className="w-5 h-5 text-[var(--rose)]" />
          )}
          <span className="text-[10px]">
            {isConnected ? 'Online' : 'Cache'}
          </span>
        </div>
      </div>
    </nav>
  );
}
