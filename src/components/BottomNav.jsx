import React from 'react';
import { PenLine, Archive, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, isConnected, onRefresh }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-dark safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-white/10 active:scale-95"
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 ${isConnected ? 'text-primary-400' : 'text-amber-400'}`} />
          <span className="text-[10px] mt-1 text-slate-400">
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </button>

        {/* Input Tab */}
        <button
          onClick={() => onTabChange('input')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 active:scale-95 ${
            activeTab === 'input'
              ? 'text-accent-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-2 rounded-full ${activeTab === 'input' ? 'bg-accent-500/20' : ''}`}>
            <PenLine className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 font-medium">Input Baru</span>
        </button>

        {/* Archive Tab */}
        <button
          onClick={() => onTabChange('archive')}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 active:scale-95 ${
            activeTab === 'archive'
              ? 'text-primary-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-2 rounded-full ${activeTab === 'archive' ? 'bg-primary-500/20' : ''}`}>
            <Archive className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 font-medium">Arsip</span>
        </button>

        {/* Connection Status */}
        <div className="flex flex-col items-center justify-center p-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-emerald-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-[10px] mt-1 text-slate-400">
            {isConnected ? 'Sync' : 'Cache'}
          </span>
        </div>
      </div>
    </nav>
  );
}
