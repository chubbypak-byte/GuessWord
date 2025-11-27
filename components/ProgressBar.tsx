import React from 'react';

interface ProgressBarProps {
  score: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ score }) => {
  // Calculate color based on score
  // 0 -> Red, 50 -> Yellow, 100 -> Green
  const getColor = (val: number) => {
    if (val < 20) return 'bg-red-500';
    if (val < 40) return 'bg-orange-500';
    if (val < 60) return 'bg-yellow-400';
    if (val < 80) return 'bg-lime-400';
    return 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]';
  };

  const getEmoji = (val: number) => {
    if (val === 100) return '🎉';
    if (val > 80) return '🔥';
    if (val > 50) return '🤔';
    if (val > 20) return '❄️';
    return '🥶';
  };

  return (
    <div className="w-full flex items-center gap-3">
      <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner border border-white/50">
        <div
          className={`h-full transition-all duration-1000 ease-out rounded-full ${getColor(score)} relative`}
          style={{ width: `${score}%` }}
        >
          <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse rounded-full"></div>
        </div>
      </div>
      <div className="font-bold text-xl min-w-[3.5rem] text-right flex items-center justify-end gap-1">
        <span className="text-2xl drop-shadow-sm">{getEmoji(score)}</span>
        <span className={`${score === 100 ? 'text-green-600 animate-bounce' : 'text-gray-600'}`}>
            {score}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
