import React, { useState, useEffect, useRef } from 'react';
import { generateTargetWord, evaluateGuess, generateHint } from './services/gemini';
import { Language, GuessResult } from './types';
import HistoryItem from './components/HistoryItem';

const App: React.FC = () => {
  // Game State
  const [language, setLanguage] = useState<Language>('TH');
  const [targetWord, setTargetWord] = useState<string>('');
  const [history, setHistory] = useState<GuessResult[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [latestHint, setLatestHint] = useState<string>('');
  const [gameState, setGameState] = useState<'LOADING' | 'PLAYING' | 'WON' | 'LOST'>('LOADING');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>(''); // For error/info messages
  
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize Game
  const startNewGame = async (lang: Language = language) => {
    setGameState('LOADING');
    setHistory([]);
    setHintsUsed(0);
    setLatestHint('');
    setMessage('');
    setCurrentInput('');
    
    try {
      const word = await generateTargetWord(lang);
      console.log("Target (Debug):", word); // Keep for debugging, remove in strict prod if needed
      setTargetWord(word);
      setGameState('PLAYING');
    } catch (e) {
      setMessage("Failed to load game. Please try again.");
    }
  };

  useEffect(() => {
    startNewGame(language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  const handleGuess = async () => {
    if (!currentInput.trim() || isSubmitting || gameState !== 'PLAYING') return;

    setIsSubmitting(true);
    setMessage('');
    
    try {
        const result = await evaluateGuess(targetWord, currentInput, language);

        if (!result.isValid) {
            setMessage(language === 'TH' ? 'โปรดพิมพ์คำที่มีความหมาย' : 'Please enter a meaningful word');
            setIsSubmitting(false);
            return;
        }

        // Add to history (Newest first)
        const newHistory = [result, ...history];
        setHistory(newHistory);

        if (result.score === 100) {
            setGameState('WON');
        }

        setCurrentInput('');
    } catch (error) {
        setMessage('Error checking word.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleGiveUp = () => {
    setGameState('LOST');
    // Create a fake "perfect" result to show the answer
    const answerResult: GuessResult = {
        word: targetWord,
        score: 100,
        isValid: true,
        emoji: '🔓',
        feedback: language === 'TH' ? 'เฉลยครับ!' : 'The Answer!'
    };
    setHistory([answerResult, ...history]);
  };

  const handleHint = async () => {
    if (hintsUsed >= 3) return;
    const nextLevel = hintsUsed + 1;
    setHintsUsed(nextLevel);
    const hint = await generateHint(targetWord, language, nextLevel);
    setLatestHint(hint);
  };

  const handleLanguageToggle = () => {
    const newLang = language === 'TH' ? 'EN' : 'TH';
    setLanguage(newLang);
    // Game resets via useEffect
  };

  return (
    // Layer 1: Background Dots & Centering
    <div className="min-h-[100dvh] bg-dots flex items-center justify-center p-3 sm:p-6 font-sans">
        
        {/* Layer 2: App Frame (Card) */}
        <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-[6px] border-white overflow-hidden flex flex-col h-[calc(100dvh-2rem)] sm:h-[85vh] relative ring-1 ring-purple-100">
            
            {/* Header - Fixed at top of card */}
            <header className="shrink-0 bg-white/50 backdrop-blur-sm z-30 px-5 py-4 flex justify-between items-center border-b border-purple-50">
                <div className="flex items-center gap-3">
                    <div className="text-3xl animate-bounce drop-shadow-sm">🔮</div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                            ทายคำ ทายใจ
                        </h1>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                            {language === 'TH' ? 'EMOJI MATCH' : 'SEMANTIC GUESS'}
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={handleLanguageToggle}
                    className="bg-white hover:bg-indigo-50 text-indigo-500 font-bold py-1.5 px-3 rounded-2xl text-xs transition-colors border-2 border-indigo-100 shadow-sm"
                >
                    {language === 'TH' ? '🇹🇭 TH' : '🇺🇸 EN'}
                </button>
            </header>

            {/* Main Content Area - Scrollable */}
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 relative scroll-smooth">
                
                {/* Status Messages / Hints */}
                <div className="flex flex-col items-center justify-center mb-6 space-y-2">
                    {gameState === 'LOADING' && (
                        <div className="flex items-center gap-2 text-purple-600 animate-pulse my-4">
                            <span className="text-2xl">⚡</span>
                            <span className="font-bold">Generating Word...</span>
                        </div>
                    )}
                    
                    {gameState === 'WON' && (
                        <div className="text-center animate-[bounce_1s_infinite] my-4">
                            <h2 className="text-3xl font-extrabold text-green-500 mb-2 drop-shadow-sm">
                                {language === 'TH' ? 'ยินดีด้วย! 🎉' : 'You Won! 🎉'}
                            </h2>
                            <button 
                                onClick={() => startNewGame()}
                                className="bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-green-600 transform transition hover:scale-105"
                            >
                                {language === 'TH' ? 'เล่นอีกครั้ง' : 'Play Again'}
                            </button>
                        </div>
                    )}

                    {gameState === 'LOST' && (
                        <div className="text-center my-4">
                            <h2 className="text-2xl font-bold text-slate-600 mb-2">
                                {language === 'TH' ? 'เฉลย: ' : 'Answer: '} 
                                <span className="text-pink-600 underline decoration-wavy">{targetWord}</span>
                            </h2>
                            <button 
                                onClick={() => startNewGame()}
                                className="bg-purple-500 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-purple-600 transform transition hover:scale-105"
                            >
                                {language === 'TH' ? 'ข้ามไปคำต่อไป' : 'Next Word'}
                            </button>
                        </div>
                    )}

                    {message && (
                        <div className="bg-red-100 text-red-500 px-4 py-2 rounded-xl font-bold text-sm shadow-sm animate-shake">
                            ⚠️ {message}
                        </div>
                    )}
                    
                    {latestHint && gameState === 'PLAYING' && (
                        <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-2xl text-sm font-medium shadow-sm border border-yellow-200 w-full text-center">
                            💡 {latestHint}
                        </div>
                    )}
                </div>

                {/* History List */}
                <div className="space-y-4 pb-2">
                    {history.length === 0 && gameState === 'PLAYING' && (
                        <div className="text-center text-slate-400 py-10 opacity-70">
                            <div className="text-6xl mb-4 grayscale hover:grayscale-0 transition-all duration-500">🧐</div>
                            <p className="text-lg font-medium text-slate-500">
                                {language === 'TH' ? 'ลองทายคำดูสิ!' : 'Start guessing!'}
                            </p>
                        </div>
                    )}
                    
                    {history.map((item, index) => (
                        <HistoryItem 
                            key={`${item.word}-${index}`} 
                            item={item} 
                            isLatest={index === 0} 
                        />
                    ))}
                    <div ref={bottomRef} />
                </div>
            </main>

            {/* Bottom Controls - Fixed at bottom of card */}
            <div className="shrink-0 bg-white/80 backdrop-blur-md p-4 pt-2 z-40 border-t border-purple-50">
                <div className="space-y-3">
                    {/* Action Buttons Row */}
                    <div className="flex justify-between gap-2">
                        <button 
                            onClick={handleHint}
                            disabled={gameState !== 'PLAYING' || hintsUsed >= 3}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm
                                ${hintsUsed >= 3 
                                    ? 'bg-gray-100 text-gray-400' 
                                    : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                }`}
                        >
                            💡 {language === 'TH' ? 'ใบ้คำ' : 'Hint'} ({3 - hintsUsed})
                        </button>
                        
                        <button 
                            onClick={handleGiveUp}
                            disabled={gameState !== 'PLAYING'}
                            className="flex-1 bg-rose-100 text-rose-600 hover:bg-rose-200 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                        >
                            🏳️ {language === 'TH' ? 'ยอมแพ้' : 'Give Up'}
                        </button>

                        <button 
                            onClick={() => startNewGame()}
                            className="flex-1 bg-sky-100 text-sky-600 hover:bg-sky-200 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                            ⏭️ {language === 'TH' ? 'เปลี่ยนคำ' : 'Skip'}
                        </button>
                    </div>

                    {/* Input Area */}
                    <div className="relative group">
                        <input
                            type="text"
                            value={currentInput}
                            onChange={(e) => setCurrentInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                            disabled={gameState !== 'PLAYING' || isSubmitting}
                            placeholder={language === 'TH' ? 'พิมพ์คำทายที่นี่...' : 'Type your guess...'}
                            className="w-full bg-slate-50 border-2 border-slate-100 focus:bg-white focus:border-purple-300 rounded-2xl py-3.5 pl-5 pr-14 text-lg outline-none transition-all disabled:opacity-70 text-slate-700 placeholder-slate-400 shadow-inner"
                        />
                        <button 
                            onClick={handleGuess}
                            disabled={!currentInput.trim() || isSubmitting || gameState !== 'PLAYING'}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-gradient-to-tr from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl flex items-center justify-center shadow-md transition-all transform active:scale-95"
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <span className="text-xl">🚀</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default App;