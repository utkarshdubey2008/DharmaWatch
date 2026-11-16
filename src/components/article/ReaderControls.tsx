import React from 'react';
import { Printer } from 'lucide-react';

interface ReaderControlsProps {
  fontSize: 'sm' | 'md' | 'lg';
  setFontSize: (size: 'sm' | 'md' | 'lg') => void;
  fontFamily: 'serif' | 'sans';
  setFontFamily: (family: 'serif' | 'sans') => void;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
}) => {
  return (
    <div className="no-print flex items-center justify-between text-xs text-gray-500 py-2 border-b border-gray-100 font-sans">
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-gray-400 uppercase font-semibold">Typography:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFontFamily(fontFamily === 'sans' ? 'serif' : 'sans')}
            className="hover:text-amber-600 transition-colors uppercase text-[11px] font-medium"
          >
            {fontFamily === 'sans' ? 'Sans (Modern)' : 'Serif (Classic)'}
          </button>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFontSize('sm')}
              className={`hover:text-amber-600 px-1.5 py-0.5 rounded text-xs ${fontSize === 'sm' ? 'text-amber-600 font-bold bg-amber-50' : ''}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`hover:text-amber-600 px-1.5 py-0.5 rounded text-xs ${fontSize === 'md' ? 'text-amber-600 font-bold bg-amber-50' : ''}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`hover:text-amber-600 px-1.5 py-0.5 rounded text-xs ${fontSize === 'lg' ? 'text-amber-600 font-bold bg-amber-50' : ''}`}
            >
              A+
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="flex items-center gap-1 hover:text-amber-600 transition-colors uppercase text-[11px] font-semibold"
        title="Print article"
      >
        <Printer className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Print Article</span>
      </button>
    </div>
  );
};
