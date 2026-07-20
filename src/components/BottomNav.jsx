import React from 'react';
import { PenLine, Archive, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, isConnected, onRefresh }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bottom-nav safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-95"
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span className="text-[10px] mt-1 text-slate-400 font-medium">
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </button>

        {/* Input Tab */}
        <button
          onClick={() => onTabChange('input')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 ${
            activeTab === 'input'
              ? 'text-white'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className={`p-3 rounded-2xl transition-all ${
            activeTab === 'input'
              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-lg glow-purple'
              : 'bg-white/5'
          }`}>
            <PenLine className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 font-semibold">Input Baru</span>
        </button>

        {/* Archive Tab */}
        <button
          onClick={() => onTabChange('archive')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 active:scale-95 ${
            activeTab === 'archive'
              ? 'text-white'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <div className={`p-3 rounded-2xl transition-all ${
            activeTab === 'archive'
              ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg'
              : 'bg-white/5'
          }`}>
            <Archive className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-1 font-semibold">Arsip</span>
        </button>

        {/* Connection Status */}
        <div className="flex flex-col items-center justify-center p-2">
          {isConnected ? (
            <Wifi className="w-5 h-5 text-emerald-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-[10px] mt-1 text-slate-400 font-medium">
            {isConnected ? 'Sync' : 'Cache'}
          </span>
        </div>
      </div>
    </nav>
  );
}
