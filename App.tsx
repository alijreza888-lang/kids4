import React, { useState, useEffect } from 'react';
import { CATEGORIES as INITIAL_CATEGORIES } from './constants';
import { Category, GameType, GameState } from './types';
import { GameEngine } from './components/Games';
import { generateSpeech, expandCategoryItems, generateItemImage } from './services/geminiService';
import { playTTSSound, playLocalSpeech } from './services/audioPlayer';
import { imageStorage } from './services/storage';

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kids_joy_v5_data');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [state, setState] = useState<GameState>({
    view: 'main',
    selectedCategory: categories[0],
    selectedGame: null,
    score: 0,
  });

  const [learningIndex, setLearningIndex] = useState(0);
  const [showPersian, setShowPersian] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [itemImage, setItemImage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('kids_joy_v5_data', JSON.stringify(categories));
  }, [categories]);

  const ensureApiKey = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        return true; // فرض بر موفقیت بعد از باز شدن دیالوگ طبق قوانین
      }
    }
    return true;
  };

  const handleApiError = async (error: any) => {
    console.error("Magic Error:", error);
    const msg = error?.message || "";
    
    if (msg.includes("401") || msg.includes("403") || msg.includes("key")) {
      if (window.aistudio) await window.aistudio.openSelectKey();
      else alert("Please check your API Key configuration.");
    } else if (msg.includes("Safety") || msg.includes("blocked")) {
      alert("The Magic thinks this might be a bit too sensitive to draw. Let's try another word!");
    } else {
      alert("The Magic is taking a break (Connection error). Please try again in a moment!");
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      if (state.view === 'learning_detail' && state.selectedCategory) {
        const item = state.selectedCategory.items[learningIndex];
        if (item) {
          const cached = await imageStorage.get(`img_v5_${item.id}`);
          setItemImage(cached);
        }
      }
    };
    loadImage();
  }, [learningIndex, state.view, state.selectedCategory]);

  const handleSpeech = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      let played = false;
      try {
        const audio = await generateSpeech(text);
        if (audio) { 
          await playTTSSound(audio, text); 
          played = true; 
        }
      } catch (e) { console.warn("TTS Fallback"); }
      if (!played) await playLocalSpeech(text);
    } catch (e) { console.error(e); }
    finally { setIsSpeaking(false); }
  };

  const handleImageGen = async () => {
    const item = state.selectedCategory?.items[learningIndex];
    if (isGeneratingImg || !item) return;
    
    await ensureApiKey();
    setIsGeneratingImg(true);
    try {
      const url = await generateItemImage(item.name, state.selectedCategory!.name);
      if (url) {
        await imageStorage.set(`img_v5_${item.id}`, url);
        setItemImage(url);
      }
    } catch (e) { 
      await handleApiError(e);
    } finally { 
      setIsGeneratingImg(false); 
    }
  };

  const handleExpand = async () => {
    if (isExpanding || !state.selectedCategory) return;
    
    await ensureApiKey();
    setIsExpanding(true);
    try {
      const newItems = await expandCategoryItems(state.selectedCategory.name, state.selectedCategory.items);
      if (newItems && newItems.length > 0) {
        const updated = categories.map(c => 
          c.id === state.selectedCategory!.id ? { ...c, items: [...c.items, ...newItems] } : c
        );
        setCategories(updated);
        setState(s => ({ 
          ...s, 
          selectedCategory: updated.find(cat => cat.id === s.selectedCategory?.id) || s.selectedCategory 
        }));
      }
    } catch (e) { 
      await handleApiError(e);
    } finally { 
      setIsExpanding(false); 
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-white overflow-hidden relative">
      {state.view === 'main' && (
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden pb-[var(--safe-bottom)]">
          <div className="bg-[#FFD233] pt-[calc(var(--safe-top)+2rem)] pb-10 px-6 rounded-b-[3.5rem] shadow-xl flex flex-col items-center flex-shrink-0">
            <h1 className="text-4xl font-kids text-white uppercase tracking-tighter drop-shadow-md">KIDS JOY</h1>
            <div className="mt-2 bg-white/20 px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest">Adventure Learning</div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
            <button onClick={() => setState({ ...state, view: 'alphabet' })} className="w-full bg-[#22C55E] p-8 rounded-[2.5rem] shadow-2xl flex items-center space-x-6 active:scale-95 transition-all border-b-8 border-green-600">
              <span className="text-5xl">🔤</span>
              <span className="text-2xl font-kids text-white">ABC ROOM</span>
            </button>
            <button onClick={() => setState({ ...state, view: 'learning_detail', selectedCategory: categories[0] })} className="w-full bg-[#6366F1] p-8 rounded-[2.5rem] shadow-2xl flex items-center space-x-6 active:scale-95 transition-all border-b-8 border-indigo-700">
              <span className="text-5xl">🍎</span>
              <span className="text-2xl font-kids text-white">NEW WORDS</span>
            </button>
            <button onClick={() => setState({ ...state, view: 'game_types' })} className="w-full bg-[#FF7043] p-8 rounded-[2.5rem] shadow-2xl flex items-center space-x-6 active:scale-95 transition-all border-b-8 border-orange-600">
              <span className="text-5xl">🎮</span>
              <span className="text-2xl font-kids text-white">PLAY GAMES</span>
            </button>
            
            <div className="pt-4 text-center">
              <button 
                onClick={() => window.aistudio?.openSelectKey()} 
                className="px-6 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200"
              >
                Settings & API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {state.view === 'learning_detail' && state.selectedCategory && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white pb-[var(--safe-bottom)]">
          <div className="bg-[#FFD233] pt-[calc(var(--safe-top)+0.5rem)] pb-4 px-6 rounded-b-[2rem] shadow-sm flex items-center justify-between flex-shrink-0">
            <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 w-12 h-12 rounded-full text-white flex items-center justify-center text-xl shadow-inner">🏠</button>
            <h1 className="text-2xl font-kids text-white uppercase">{state.selectedCategory.name}</h1>
            <div className="w-12"></div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex overflow-x-auto hide-scrollbar px-6 py-5 space-x-4 bg-white border-b-2 border-slate-50">
              {categories.map((c) => (
                <button key={c.id} onClick={() => { setState({ ...state, selectedCategory: c }); setLearningIndex(0); }} 
                  className={`w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center text-3xl transition-all shadow-md ${state.selectedCategory?.id === c.id ? 'bg-[#FF9F1C] text-white scale-110' : 'bg-slate-50 opacity-40'}`}>{c.icon}</button>
              ))}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="w-full max-w-[340px]">
                <div onClick={() => setShowPersian(!showPersian)} className={`w-full aspect-square rounded-[4rem] shadow-2xl flex flex-col items-center justify-center relative border-[8px] transition-all duration-500 ${showPersian ? 'bg-indigo-600 border-indigo-400' : 'bg-white border-slate-100'}`}>
                  {!showPersian ? (
                    <>
                      <div className="flex-1 w-full p-8 flex items-center justify-center overflow-hidden">
                        {itemImage ? (
                          <img src={itemImage} alt="item" className="max-w-full max-h-full object-contain rounded-3xl animate-in zoom-in duration-700" />
                        ) : (
                          <span className="text-[140px] drop-shadow-2xl">{state.selectedCategory.items[learningIndex]?.emoji}</span>
                        )}
                      </div>
                      <div className="mb-10 bg-indigo-50 px-10 py-4 rounded-full border-2 border-indigo-100 shadow-sm">
                        <span className="text-3xl font-kids text-indigo-700 uppercase tracking-wider">{state.selectedCategory.items[learningIndex]?.name}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-10 animate-in zoom-in duration-300">
                      <h2 className="text-6xl font-kids text-white mb-4" dir="rtl">{state.selectedCategory.items[learningIndex]?.persianName}</h2>
                      <p className="text-sm text-white/40 mt-10 uppercase font-black tracking-widest">Tap to reveal emoji</p>
                    </div>
                  )}
                  
                  <button onClick={(e) => { e.stopPropagation(); handleSpeech(state.selectedCategory?.items[learningIndex]?.name || ""); }} className="absolute -top-5 -right-5 w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center text-3xl text-white shadow-2xl border-[8px] border-white active:scale-75 z-20">🔊</button>
                  <button onClick={(e) => { e.stopPropagation(); handleImageGen(); }} className={`absolute -top-5 -left-5 w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center text-3xl text-white shadow-2xl border-[8px] border-white active:scale-75 z-20 ${isGeneratingImg ? 'animate-spin' : ''}`}>
                    {isGeneratingImg ? '⏳' : '🎨'}
                  </button>
                </div>

                <div className="flex w-full space-x-6 mt-12">
                  <button onClick={() => { setLearningIndex(p => (p > 0 ? p - 1 : state.selectedCategory!.items.length - 1)); setShowPersian(false); }} className="flex-1 bg-slate-100 py-6 rounded-[2.5rem] font-black text-slate-400 text-lg shadow-inner active:bg-slate-200">PREV</button>
                  <button onClick={() => { setLearningIndex(p => (p < state.selectedCategory!.items.length - 1 ? p + 1 : 0)); setShowPersian(false); }} className="flex-1 bg-indigo-600 py-6 rounded-[2.5rem] font-black text-white shadow-2xl text-lg active:bg-indigo-700">NEXT</button>
                </div>
              </div>
            </div>

            <div className="px-8 pb-12">
              <button onClick={handleExpand} disabled={isExpanding} className={`w-full py-6 rounded-[3rem] font-black text-white shadow-2xl transition-all flex items-center justify-center space-x-4 text-lg tracking-widest ${isExpanding ? 'bg-slate-300' : 'bg-magic magic-active'}`}>
                <span className="text-2xl">🪄</span>
                <span>{isExpanding ? 'CASTING SPELL...' : `GET 10 MORE ${state.selectedCategory.name.toUpperCase()}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {state.view === 'alphabet' && (
        <div className="flex-1 flex flex-col overflow-hidden pb-[var(--safe-bottom)] bg-slate-50">
          <div className="bg-[#22C55E] pt-[calc(var(--safe-top)+0.5rem)] pb-4 px-6 rounded-b-[2rem] shadow-sm flex items-center justify-between flex-shrink-0">
            <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 w-12 h-12 rounded-full text-white flex items-center justify-center text-xl shadow-inner">🏠</button>
            <h1 className="text-2xl font-kids text-white uppercase">ABC Room</h1>
            <div className="w-12"></div>
          </div>
          <div className="flex-1 p-5 grid grid-cols-3 gap-4 overflow-y-auto hide-scrollbar">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
              <button key={letter} onClick={() => handleSpeech(letter)} className="aspect-square bg-white rounded-[2rem] shadow-xl border-b-[8px] border-slate-200 flex items-center justify-center text-5xl font-kids text-slate-700 active:translate-y-2 active:border-b-0 transition-all">
                {letter}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.view === 'game_active' && state.selectedCategory && state.selectedGame && (
        <GameEngine category={state.selectedCategory} gameType={state.selectedGame} onBack={() => setState({ ...state, view: 'game_types' })} />
      )}

      {(state.view === 'game_types' || state.view === 'game_cats') && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 pb-[var(--safe-bottom)]">
          <div className="bg-[#FFD233] pt-[calc(var(--safe-top)+0.5rem)] pb-4 px-6 rounded-b-[2rem] shadow-sm flex items-center justify-between flex-shrink-0">
             <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 w-12 h-12 rounded-full text-white flex items-center justify-center text-xl shadow-inner">🏠</button>
             <h1 className="text-2xl font-kids text-white uppercase">Arcade</h1>
             <div className="w-12"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-5 hide-scrollbar">
            {state.view === 'game_types' ? (
              Object.values(GameType).map(type => (
                <button key={type} onClick={() => setState({ ...state, selectedGame: type, view: 'game_cats' })} className="w-full flex items-center p-8 bg-white rounded-[3rem] border-4 border-slate-50 shadow-2xl active:border-indigo-400 group transition-all">
                  <span className="text-6xl mr-8 group-active:scale-125 transition-transform">{type === GameType.FLASHCARDS ? '🗂️' : '🎮'}</span>
                  <span className="text-2xl font-kids text-indigo-700 uppercase">{type}</span>
                </button>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-5">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setState({ ...state, selectedCategory: cat, view: 'game_active' })} className={`${cat.color} p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col items-center active:scale-90 transition-all border-b-8 border-black/10`}>
                    <span className="text-5xl">{cat.icon}</span>
                    <span className="text-xs font-black mt-4 uppercase tracking-tighter">{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
