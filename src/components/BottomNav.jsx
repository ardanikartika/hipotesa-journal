import { Archive, RefreshCw, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, isConnected, onRefresh }) {
  return (
    <nav className="nav-bottom">
      <div className="flex items-center justify-around">
        {/* Refresh */}
        <button className="nav-item" onClick={onRefresh}>
          <RefreshCw className="w-5 h-5" style={{ color: isConnected ? 'var(--success)' : 'var(--text-tertiary)' }} />
          <span>{isConnected ? 'Online' : 'Offline'}</span>
        </button>

        {/* New */}
        <button
          className={`nav-item ${activeTab === 'input' ? 'active' : ''}`}
          onClick={() => onTabChange('input')}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: activeTab === 'input' ? 'var(--accent)' : 'var(--bg-tertiary)' }}
          >
            <Plus className="w-6 h-6" style={{ color: activeTab === 'input' ? 'white' : 'var(--text-secondary)' }} />
          </div>
          <span>Baru</span>
        </button>

        {/* Archive */}
        <button
          className={`nav-item ${activeTab === 'archive' ? 'active' : ''}`}
          onClick={() => onTabChange('archive')}
        >
          <Archive className="w-5 h-5" />
          <span>Arsip</span>
        </button>
      </div>
    </nav>
  );
}
