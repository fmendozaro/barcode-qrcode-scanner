import React, { useState, useEffect } from 'react';
import MacOSWindow from './components/MacOSWindow';
import Scanner from './components/Scanner';
import HistoryPanel from './components/HistoryPanel';
import { ScannedItem } from './types';
import { Wifi, Battery, Search, Command } from 'lucide-react';

const App: React.FC = () => {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock for menu bar
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const handleScan = (item: ScannedItem) => {
    setScannedItems(prev => {
      // If updating an existing item (e.g. loading -> loaded)
      const existingIndex = prev.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        const newItems = [...prev];
        newItems[existingIndex] = item;
        return newItems;
      }
      // Add new item to top
      return [item, ...prev];
    });
  };

  const clearHistory = () => setScannedItems([]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className="w-full h-screen bg-cover bg-center overflow-hidden flex flex-col relative"
      style={{ 
        backgroundImage: 'url("https://picsum.photos/3840/2160?blur=4")', // Abstract wallpaper style
      }}
    >
      {/* Dynamic Background Overlay for mood */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 pointer-events-none"></div>

      {/* Menu Bar */}
      <div className="h-8 bg-white/20 backdrop-blur-xl flex items-center justify-between px-4 text-white text-xs font-medium shadow-sm z-50 relative">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm"></span>
          <span className="hidden sm:inline font-semibold">OmniScanner</span>
          <span className="hidden sm:inline opacity-80 hover:opacity-100 cursor-default">File</span>
          <span className="hidden sm:inline opacity-80 hover:opacity-100 cursor-default">Edit</span>
          <span className="hidden sm:inline opacity-80 hover:opacity-100 cursor-default">View</span>
          <span className="hidden sm:inline opacity-80 hover:opacity-100 cursor-default">Window</span>
          <span className="hidden sm:inline opacity-80 hover:opacity-100 cursor-default">Help</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden sm:flex items-center gap-1 opacity-80">
             <Battery className="w-4 h-4" />
             <span>100%</span>
           </div>
           <Wifi className="w-4 h-4 opacity-80" />
           <Search className="w-4 h-4 opacity-80" />
           <div className="flex gap-2">
             <span>{formatDate(currentTime)}</span>
             <span>{formatTime(currentTime)}</span>
           </div>
        </div>
      </div>

      {/* Desktop Area */}
      <div className="flex-1 relative p-4 sm:p-8 flex items-center justify-center">
        
        {/* The "App" Window */}
        <MacOSWindow 
          title="OmniScanner - AI Powered" 
          className="w-full max-w-5xl h-[85vh] sm:h-[80vh] flex flex-col md:flex-row"
        >
          {/* Sidebar / Camera Area */}
          <div className="flex-1 md:w-2/3 border-b md:border-b-0 md:border-r border-white/10 relative flex flex-col min-h-[50%] md:min-h-full">
            <Scanner onScan={handleScan} />
          </div>

          {/* Right Panel / Details */}
          <div className="flex-1 md:w-1/3 min-h-[50%] md:min-h-full bg-gray-900/50 backdrop-blur-xl">
             <HistoryPanel items={scannedItems} onClear={clearHistory} />
          </div>
        </MacOSWindow>

      </div>

      {/* Dock (Visual only) */}
      <div className="h-20 mb-2 flex items-end justify-center z-40 pointer-events-none">
        <div className="h-16 bg-white/20 backdrop-blur-2xl border border-white/20 rounded-2xl flex items-center px-4 gap-4 pointer-events-auto pb-2 shadow-2xl scale-75 sm:scale-100 origin-bottom">
           {/* Fake App Icons */}
           {[
             'bg-blue-500', 'bg-green-500', 'bg-gray-800', 'bg-indigo-500', 'bg-yellow-500'
           ].map((color, i) => (
             <div key={i} className={`w-12 h-12 rounded-xl ${color} shadow-lg hover:-translate-y-4 transition-transform duration-200 cursor-pointer flex items-center justify-center border border-white/10`}>
                {i === 2 && <Command className="text-white w-6 h-6" />} {/* Current App Active */}
             </div>
           ))}
           <div className="w-[1px] h-10 bg-white/20 mx-1"></div>
           <div className="w-12 h-12 rounded-full bg-gray-400/20 flex items-center justify-center backdrop-blur-md border border-white/10">
              <span className="text-xs">Trash</span>
           </div>
        </div>
      </div>

    </div>
  );
};

export default App;