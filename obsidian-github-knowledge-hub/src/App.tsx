import { useState } from 'react';
import { Folder, LayoutGrid, Link, Terminal, Plus, Settings, Search, Network } from 'lucide-react';

// Simple test version
export function App() {
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="w-14 flex flex-col items-center py-3 bg-zinc-900 border-r border-zinc-800">
        <div className="mb-4">
          <button className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            K
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center gap-1">
          <button
            onClick={() => setActiveBlock('notes')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeBlock === 'notes' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
          >
            <Folder size={18} />
          </button>
          <button
            onClick={() => setActiveBlock('cards')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeBlock === 'cards' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setActiveBlock('links')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeBlock === 'links' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
          >
            <Link size={18} />
          </button>
          <button
            onClick={() => setActiveBlock('commands')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${activeBlock === 'commands' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}
          >
            <Terminal size={18} />
          </button>
          
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors">
            <Plus size={20} />
          </button>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors">
            <Search size={18} />
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors">
            <Network size={18} />
          </button>
          <button className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors">
            <Settings size={18} />
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
          <span className="text-sm text-zinc-500">Personal {activeBlock && `/ ${activeBlock}`}</span>
        </header>
        
        <div className="flex-1 overflow-hidden">
          {activeBlock ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-zinc-500">
              <h2 className="text-xl font-semibold text-zinc-300 mb-2">{activeBlock.charAt(0).toUpperCase() + activeBlock.slice(1)}</h2>
              <p className="text-sm text-zinc-600">This is a simplified version for testing</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-zinc-500">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mb-4 border border-zinc-800">
                <Folder size={40} className="text-zinc-700" />
              </div>
              <h2 className="text-xl font-semibold text-zinc-300 mb-2">Welcome to Knowledge Hub</h2>
              <p className="text-sm text-zinc-600 mb-6">Select a block from the sidebar to get started</p>
              <button
                onClick={() => setActiveBlock('notes')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                <Plus size={16} />
                Get Started
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
