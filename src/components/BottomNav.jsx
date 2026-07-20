import { Archive, RefreshCw, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, isConnected, onRefresh }) {
  return (
    <nav className="nav-bottom" style={{ background: 'var(--white)', borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center justify-around">
        <button className="nav-item" onClick={onRefresh}>
          <RefreshCw className="w-5 h-5" style={{ color: isConnected ? 'var(--emerald-500)' : 'var(--text-muted)' }} />
          <span>{isConnected ? 'Online' : 'Offline'}</span>
        </button>

        <button className={`nav-item ${activeTab === 'input' ? 'active' : ''}`} onClick={() => onTabChange('input')}>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
            style={{ background: activeTab === 'input' ? 'var(--indigo-500)' : 'var(--slate-100)' }}>
            <Plus className="w-6 h-6" style={{ color: activeTab === 'input' ? 'white' : 'var(--text-secondary)' }} />
          </div>
          <span>New</span>
        </button>

        <button className={`nav-item ${activeTab === 'archive' ? 'active' : ''}`} onClick={() => onTabChange('archive')}>
          <Archive className="w-5 h-5" />
          <span>Archive</span>
        </button>
      </div>
    </nav>
  );
}
