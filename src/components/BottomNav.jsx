import { Archive, RefreshCw, Plus } from 'lucide-react';

export default function BottomNav({ tab, onTab, connected, onRefresh }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 py-3" style={{ background: 'var(--warm-white)', borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button className="nav-item" onClick={onRefresh}>
          <RefreshCw className="w-5 h-5" style={{ color: connected ? '#22C55E' : 'var(--light-gray)' }} />
          <span>{connected ? 'Online' : 'Offline'}</span>
        </button>

        <button className={`nav-item ${tab === 'input' ? 'active' : ''}`} onClick={() => onTab('input')}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all" style={{ background: tab === 'input' ? 'var(--charcoal)' : 'var(--cream-dark)' }}>
            <Plus className="w-6 h-6" style={{ color: tab === 'input' ? 'var(--cream)' : 'var(--warm-gray)' }} />
          </div>
          <span>New</span>
        </button>

        <button className={`nav-item ${tab === 'archive' ? 'active' : ''}`} onClick={() => onTab('archive')}>
          <Archive className="w-5 h-5" />
          <span>Archive</span>
        </button>
      </div>
    </nav>
  );
}
