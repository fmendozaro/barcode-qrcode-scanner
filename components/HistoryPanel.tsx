import React from 'react';
import { ScannedItem } from '../types';
import { ShoppingCart, Globe, FileText, Wifi, HelpCircle, Loader2, ArrowRight, ExternalLink } from 'lucide-react';

interface HistoryPanelProps {
  items: ScannedItem[];
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ items, onClear }) => {
  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-50/5 dark:bg-black/20">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
           <div className="w-8 h-8 border-2 border-dashed border-gray-400 rounded-md"></div>
        </div>
        <h3 className="text-gray-300 font-medium mb-1">Ready to Scan</h3>
        <p className="text-sm text-gray-500">Point your camera at a barcode or QR code to see Gemini analysis.</p>
      </div>
    );
  }

  const getIcon = (type?: string) => {
    switch (type) {
      case 'PRODUCT': return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
      case 'URL': return <Globe className="w-4 h-4 text-blue-400" />;
      case 'WIFI': return <Wifi className="w-4 h-4 text-purple-400" />;
      case 'TEXT': return <FileText className="w-4 h-4 text-gray-400" />;
      default: return <HelpCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50/5 dark:bg-black/20">
      <div className="p-4 border-b border-white/10 flex items-center justify-between backdrop-blur-sm bg-white/5 sticky top-0 z-10">
        <h2 className="text-sm font-semibold text-gray-200">History ({items.length})</h2>
        <button 
          onClick={onClear}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear All
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="group bg-gray-800/40 hover:bg-gray-800/60 border border-white/5 hover:border-white/20 rounded-xl p-4 transition-all duration-200 relative overflow-hidden"
          >
            {/* Loading State Overlay */}
            {item.loading && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}

            <div className="flex items-start gap-3 mb-2">
              <div className="mt-1 p-2 rounded-lg bg-black/40 border border-white/5">
                {getIcon(item.aiAnalysis?.actionableType)}
              </div>
              <div className="flex-1 min-w-0">
                 <h4 className="font-medium text-gray-200 truncate">
                   {item.aiAnalysis?.title || item.rawValue}
                 </h4>
                 <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                   {item.format.toUpperCase()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                 </p>
              </div>
            </div>

            {/* AI Analysis Content */}
            {item.aiAnalysis && (
              <div className="mt-3 pl-[3.25rem]">
                <p className="text-sm text-gray-400 leading-relaxed text-pretty">
                  {item.aiAnalysis.description}
                </p>
                
                {item.aiAnalysis.category && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-1 rounded border border-white/5">
                      {item.aiAnalysis.category}
                    </span>
                    {item.aiAnalysis.priceEstimate && (
                      <span className="text-[10px] text-emerald-400/80 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/10">
                        {item.aiAnalysis.priceEstimate}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {!item.loading && item.aiAnalysis?.actionableType === 'URL' && (
              <a 
                href={item.rawValue} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-medium transition-colors border border-blue-600/20"
              >
                Open Link <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;