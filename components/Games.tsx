
import React, { useState, useEffect } from 'react';
import { Category, Item, GameType } from '../types';
import { getFunFact, generateSpeech } from '../services/geminiService';
import { playTTSSound, playLocalSpeech } from '../services/audioPlayer';
import { imageStorage } from '../services/storage';

interface GameProps {
  category: Category;
  gameType: GameType;
  onBack: () => void;
}

export const GameEngine: React.FC<GameProps> = ({ category, gameType, onBack }) => {
  const [score, setScore] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [funFact, setFunFact] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imageCache, setImageCache] = useState<Record<string, string>>({});
  
  // Game state
  const [spellingLetters, setSpellingLetters] = useState<string[]>([]);
  const [userSpelling, setUserSpelling] = useState<string[]>([]);
  const [spellingStatus, setSpellingStatus] = useState<'neutral' | 'correct' | 'error'>('neutral');

  useEffect(() => {
    const loadImages = async () => {
      const allItems = [...category.items];
      const results = await Promise.all(
        allItems.map(async it => {
          const data = await imageStorage.get(`kids_joy_img_${it.id}`);
          return { id: it.id, data };
        })
      );
      const map: Record<string, string> = {};
      results.forEach(res => { if (res.data) map[res.id] = res.data; });
      setImageCache(map);
    };
    loadImages();
  }, [category]);

  const handleSpeech = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      let speechPlayed = false;
      try {
        const base64 = await generateSpeech(text);
        if (base64) { 
          await playTTSSound(base64); 
          speechPlayed = true; 
        }
      } catch (e) {
        console.warn("AI Speech in game failed, using fallback.");
      }
      if (!speechPlayed) await playLocalSpeech(text);
    } catch (e) { console.error(e); }
    setIsSpeaking(false);
  };

  useEffect(() => {
    initGame();
  }, [currentIndex, gameType, category]);

  const initGame = () => {
    if (!category.items || category.items.length === 0) return;
    const current = category.items[currentIndex] || category.items[0];

    if (gameType === GameType.FLASHCARDS) {
      updateFunFact(current.name);
      handleSpeech(current.name);
    } 
    else if (gameType === GameType.SPELLING) {
      const letters = current.name.toUpperCase().split('');
      setSpellingLetters([...letters].sort(() => Math.random() - 0.5));
      setUserSpelling([]);
      setSpellingStatus('neutral');
    }
  };

  const updateFunFact = async (name: string) => {
    try {
      const fact = await getFunFact(name, category.name);
      setFunFact(fact);
    } catch (e) {
      setFunFact("Let's learn more about this!");
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % category.items.length);
    setSpellingStatus('neutral');
  };

  const celebrate = () => {
    setScore(s => s + 10);
    handleSpeech("Awesome!");
    setTimeout(handleNext, 1500);
  };

  const renderItemVisual = (item: Item, className: string = "text-5xl") => {
    if (!item) return null;
    const img = imageCache[item.id];
    if (img) return <img src={img} alt={item.name} className="w-full h-full object-contain rounded-2xl animate-in fade-in" />;
    return <span className={className}>{item.emoji}</span>;
  };

  const renderSpelling = () => {
    const item = category.items[currentIndex] || category.items[0];
    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in w-full px-4">
        <div className="w-32 h-32 p-4 bg-white rounded-[2.5rem] shadow-card flex items-center justify-center flex-shrink-0">
          {renderItemVisual(item, "text-7xl")}
        </div>
        
        <div className={`flex flex-wrap justify-center gap-2 min-h-[60px] w-full border-b-4 border-dashed ${spellingStatus === 'error' ? 'border-red-200' : 'border-indigo-100'} pb-4`}>
          {item.name.toUpperCase().split('').map((char, i) => {
            const isFilled = userSpelling.length > i;
            return (
              <div key={i} className={`w-10 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg transition-all ${isFilled ? 'bg-indigo-600 text-white scale-110' : 'bg-white border-2 border-gray-100 text-transparent'}`}>
                {isFilled ? userSpelling[i] : ''}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-sm">
          {spellingLetters.map((char, i) => (
            <button key={i} onClick={() => {
              if (spellingStatus === 'correct') return;
              const next = [...userSpelling, char];
              const target = item.name.toUpperCase();
              if (target.startsWith(next.join(''))) {
                setUserSpelling(next);
                if (next.join('') === target) {
                  setSpellingStatus('correct');
                  celebrate();
                }
              } else {
                setSpellingStatus('error');
                if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
                setTimeout(() => { setUserSpelling([]); setSpellingStatus('neutral'); }, 800);
              }
            }}
            className="w-12 h-14 bg-white rounded-2xl shadow-xl border-b-4 border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xl active:bg-indigo-50">
              {char}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
       <div className="bg-[#FFD233] pt-10 pb-3 px-6 rounded-b-[2rem] shadow-md flex flex-col items-center relative z-20 flex-shrink-0">
          <h1 className="text-sm font-kids text-white uppercase tracking-tighter">{gameType}</h1>
          <button onClick={onBack} className="absolute left-6 bottom-2.5 bg-white p-2.5 rounded-full shadow-md text-gray-600">🔙</button>
          <div className="absolute right-6 bottom-2.5 bg-white px-4 py-1.5 rounded-full shadow-md font-black text-indigo-600 text-xs">⭐ {score}</div>
        </div>
      <div className="flex-1 flex flex-col justify-center p-6 bg-slate-50 overflow-hidden">
        {gameType === GameType.SPELLING ? renderSpelling() : (
          <div className="text-center">
            {currentIndex < category.items.length && (
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 mb-8">
                  {renderItemVisual(category.items[currentIndex], "text-9xl")}
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-xl mb-8">
                  <p className="text-2xl font-kids text-indigo-700 uppercase mb-2">{category.items[currentIndex].name}</p>
                  <p className="text-sm text-slate-500 italic">"{funFact}"</p>
                </div>
                <button onClick={handleNext} className="bg-indigo-600 text-white px-10 py-4 rounded-3xl font-bold active:scale-95 transition-all">NEXT ONE!</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
