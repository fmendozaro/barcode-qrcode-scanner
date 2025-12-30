import React from 'react';

interface MacOSWindowProps {
  title: string;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const MacOSWindow: React.FC<MacOSWindowProps> = ({
  title,
  children,
  isActive = true,
  className = "",
  onClose,
  onMinimize,
  onMaximize
}) => {
  return (
    <div 
      className={`
        relative flex flex-col rounded-xl overflow-hidden shadow-2xl transition-all duration-300
        ${isActive ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/10' : 'shadow-lg opacity-95 grayscale-[0.2]'}
        bg-gray-900/80 backdrop-blur-xl border border-white/10
        ${className}
      `}
      style={{ minHeight: '400px' }}
    >
      {/* Title Bar */}
      <div className="h-10 bg-gradient-to-b from-white/10 to-white/5 border-b border-black/20 flex items-center justify-between px-4 shrink-0 drag-handle cursor-default select-none">
        <div className="flex items-center gap-2 group">
          <button 
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 border border-[#E0443E] flex items-center justify-center text-[8px] text-black/50 opacity-100 transition-all"
            aria-label="Close"
          >
          </button>
          <button 
            onClick={onMinimize}
            className="w-3 h-3 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 border border-[#D89E24]"
            aria-label="Minimize"
          ></button>
          <button 
            onClick={onMaximize}
            className="w-3 h-3 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 border border-[#1AAB29]"
            aria-label="Maximize"
          ></button>
        </div>
        
        <div className="absolute left-1/2 -translate-x-1/2 text-sm font-medium text-gray-300 flex items-center gap-2">
           {/* Simple Icon placeholder */}
           <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-md"></div>
           {title}
        </div>
        
        <div className="w-14"></div> {/* Spacer for balance */}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden text-gray-200">
        {children}
      </div>
    </div>
  );
};

export default MacOSWindow;