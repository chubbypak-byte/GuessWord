import React from 'react';
import { GuessResult } from '../types';
import ProgressBar from './ProgressBar';

interface HistoryItemProps {
  item: GuessResult;
  isLatest: boolean;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, isLatest }) => {
  return (
    <div 
      className={`
        w-full p-4 rounded-3xl mb-3 border-2 
        ${isLatest 
          ? 'bg-white border-purple-300 shadow-lg scale-100 z-10' 
          : 'bg-white/60 border-transparent shadow-sm scale-95 opacity-90'
        }
        transition-all duration-500 ease-out
      `}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-2xl shadow-inner">
                {item.emoji}
            </div>
            <h3 className="text-xl font-bold text-slate-700 truncate whitespace-nowrap">
                {item.word}
            </h3>
        </div>
        {item.feedback && isLatest && (
             <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-lg whitespace-nowrap">
                {item.feedback}
             </span>
        )}
      </div>
      
      <ProgressBar score={item.score} />
    </div>
  );
};

export default HistoryItem;
