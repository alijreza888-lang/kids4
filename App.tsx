import React, { useState, useEffect } from 'react';
import { CATEGORIES as INITIAL_CATEGORIES } from './constants';
import { Category, GameType, GameState } from './types';
import { GameEngine } from './components/Games';
import { generateSpeech, expandCategoryItems, generateItemImage } from './services/geminiService';
import { playTTSSound, playLocalSpeech } from './services/audioPlayer';
import { imageStorage } from './services/storage';

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kids_joy_v7_data');
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
    localStorage.setItem('kids_joy_v7_data', JSON.stringify(categories));
  }, [categories]);

  const ensureApiKey = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        return false;
      }
    }
    return !!process.env.API_KEY;
  };

  const handleApiError = async (error: any) => {
    console.error("Magic Tool Error:", error);
    const msg = error?.message || "";
    if (msg.includes("API Key must be set") || msg.includes("401") || msg.includes("403")) {
      if (window.aistudio) await window.aistudio.openSelectKey();
    } else if (msg.includes("Safety")) {
      alert("Oops! The magic brush couldn't draw this one. Let's try another!");
    } else {
      alert("Magic is a bit slow today. Please try again!");
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      if (state.view === 'learning_detail' && state.selectedCategory) {
        const item = state.selectedCategory.items[learningIndex];
        if (item) {
          const cached = await imageStorage.get(`img_v7_${item.id}`);
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
      if (process.env.API_KEY) {
        try {
          const audio = await generateSpeech(text);
          if (audio) { await playTTSSound(audio, text); played = true; }
        } catch (e) {}
      }
      if (!played) await playLocalSpeech(text);
    } catch (e) {}
    finally { setIsSpeaking(false); }
  };

  const handleImageGen = async () => {
    const item = state.selectedCategory?.items[learningIndex];
    if (isGeneratingImg || !item) return;
    const keyReady = await ensureApiKey();
    if (!keyReady && !process.env.API_KEY) return;

    setIsGeneratingImg(true);
    try {
      const url = await generateItemImage(item.name, state.selectedCategory!.name);
      if (url) {
        await imageStorage.set(`img_v7_${item.id}`, url);
        setItemImage(url);
      }
    } catch (e) { await handleApiError(e); }
    finally { setIsGeneratingImg(false); }
  };

  const handleExpand = async () => {
    if (isExpanding || !state.selectedCategory) return;
    const keyReady = await ensureApiKey();
    if (!keyReady && !process.env.API_KEY) return;

    setIsExpanding(true);
    try {
      const newItems = await expandCategoryItems(state.selectedCategory.name, state.selectedCategory.items);
      if (newItems && newItems.length > 0) {
        const updated = categories.map(c => 
          c.id === state.selectedCategory!.id ? { ...c, items: [...c.items, ...newItems] } : c
        );
        setCategories(updated);
        const refreshed = updated.find(cat => cat.id === state.selectedCategory?.id);
        if (refreshed) setState(s => ({ ...s, selectedCategory: refreshed }));
      }
    } catch (e) { await handleApiError(e); }
    finally { setIsExpanding(false); }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full bg-white overflow-hidden relative">
      {state.view === 'main' && (
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden pb-[var(--safe-bottom)]">
          <div className="bg-[#FFD233] pt-[calc(var(--safe-top)+1.5rem)] pb-8 px-6 rounded-b-[3.5rem] shadow-xl flex flex-col items-center flex-shrink-0 z-10">
            <h1 className="text-4xl font-kids text-white uppercase tracking-tighter drop-shadow-md">KIDS JOY</h1>
            <p className="text-white/80 font-bold text-[10px] mt-1 tracking-[0.2em] uppercase">Ready for Adventure?</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-container hide-scrollbar">
            {/* Main Navigation */}
            <div className="grid grid-cols-1 gap-4">
              <button onClick={() => setState({ ...state, view: 'alphabet' })} className="w-full bg-[#22C55E] p-6 rounded-[2.5rem] shadow-xl flex items-center space-x-6 active:translate-y-1 transition-all border-b-8 border-green-600">
                <span className="text-4xl">🔤</span>
                <span className="text-xl font-kids text-white">ABC ROOM</span>
              </button>
              <button onClick={() => setState({ ...state, view: 'game_types' })} className="w-full bg-[#FF7043] p-6 rounded-[2.5rem] shadow-xl flex items-center space-x-6 active:translate-y-1 transition-all border-b-8 border-orange-600">
                <span className="text-4xl">🎮</span>
                <span className="text-xl font-kids text-white">PLAY GAMES</span>
              </button>
            </div>

            {/* Quick Access Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Explore Topics</h2>
                <div className="h-[2px] flex-1 bg-slate-200 ml-4 rounded-full opacity-50"></div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setState({ ...state, view: 'learning_detail', selectedCategory: cat })} className={`${cat.color} aspect-square rounded-[1.8rem] shadow-lg text-white flex flex-col items-center justify-center active:scale-90 transition-all border-b-4 border-black/10`}>
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="text-[8px] font-black mt-1 uppercase tracking-tighter overflow-hidden text-ellipsis whitespace-nowrap w-full px-1">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-4 text-center">
              <button onClick={() => window.aistudio?.openSelectKey()} className="px-6 py-2 bg-white rounded-full text-[9px] font-black text-slate-300 uppercase tracking-widest border border-slate-100">
                AI Magic Settings 🪄
              </button>
            </div>
          </div>
        </div>
      )}

      {state.view === 'learning_detail' && state.selectedCategory && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white pb-[var(--safe-bottom)]">
          <div className="bg-[#FFD233] pt-[calc(var(--safe-top)+0.5rem)] pb-3 px-6 rounded-b-[2rem] shadow-sm flex items-center justify-between flex-shrink-0 z-10">
            <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 w-11 h-11 rounded-full text-white flex items-center justify-center text-xl shadow-inner active:scale-90">🏠</button>
            <h1 className="text-xl font-kids text-white uppercase">{state.selectedCategory.name}</h1>
            <div className="w-11"></div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Updated Horizontal Scroll for Categories */}
            <div className="flex overflow-x-auto horizontal-scroll hide-scrollbar px-6 py-4 space-x-4 bg-white border-b border-slate-100 flex-shrink-0">
              {categories.map((c) => (
                <button key={c.id} onClick={() => { setState({ ...state, selectedCategory: c }); setLearningIndex(0); setShowPersian(false); }} 
                  className={`w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center text-3xl transition-all shadow-md active:scale-90 ${state.selectedCategory?.id === c.id ? 'bg-[#FF9F1C] text-white ring-4 ring-orange-100' : 'bg-slate-50 opacity-40'}`}>{c.icon}</button>
              ))}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 scroll-container overflow-y-auto hide-scrollbar">
              <div className="learning-card-container">
                <div onClick={() => setShowPersian(!showPersian)} className={`w-full aspect-square rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center relative border-[8px] transition-all duration-500 ${showPersian ? 'bg-indigo-600 border-indigo-400' : 'bg-white border-slate-50'}`}>
                  {!showPersian ? (
                    <>
                      <div className="flex-1 w-full p-8 flex items-center justify-center overflow-hidden">
                        {itemImage ? (
                          <img src={itemImage} alt="item" className="max-w-full max-h-full object-contain rounded-3xl animate-in zoom-in duration-500" />
                        ) : (
                          <span className="text-[120px] drop-shadow-2xl">{state.selectedCategory.items[learningIndex]?.emoji}</span>
                        )}
                      </div>
                      <div className="mb-10 bg-indigo-50 px-8 py-3 rounded-full border-2 border-indigo-100 shadow-sm">
                        <span className="text-2xl font-kids text-indigo-700 uppercase tracking-wider">{state.selectedCategory.items[learningIndex]?.name}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8 animate-in zoom-in duration-300">
                      <h2 className="text-5xl font-kids text-white mb-4" dir="rtl">{state.selectedCategory.items[learningIndex]?.persianName}</h2>
                      <p className="text-xs text-white/40 mt-10 uppercase font-black tracking-widest">Tap to reveal word</p>
                    </div>
                  )}
                  
                  <button onClick={(e) => { e.stopPropagation(); handleSpeech(state.selectedCategory?.items[learningIndex]?.name || ""); }} className="absolute -top-4 -right-4 w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center text-3xl text-white shadow-2xl border-[6px] border-white active:scale-75 z-20 transition-all">🔊</button>
                  <button onClick={(e) => { e.stopPropagation(); handleImageGen(); }} className={`absolute -top-4 -left-4 w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center text-3xl text-white shadow-2xl border-[6px] border-white active:scale-75 z-20 transition-all ${isGeneratingImg ? 'animate-spin' : ''}`}>
                    {isGeneratingImg ? '⏳' : '🎨'}
                  </button>
                </div>

                <div className="flex w-full space-x-4 mt-8">
                  <button onClick={() => { setLearningIndex(p => (p > 0 ? p - 1 : state.selectedCategory!.items.length - 1)); setShowPersian(false); }} className="flex-1 bg-slate-100 py-6 rounded-[2.5rem] font-black text-slate-400 text-lg shadow-inner active:bg-slate-200 transition-all">PREV</button>
                  <button onClick={() => { setLearningIndex(p => (p < state.selectedCategory!.items.length - 1 ? p + 1 : 0)); setShowPersian(false); }} className="flex-1 bg-indigo-600 py-6 rounded-[2.5rem] font-black text-white shadow-2xl text-lg active:bg-indigo-700 transition-all">NEXT</button>
                </div>
              </div>
            </div>

            <div className="px-8 pb-10 flex-shrink-0">
              <button onClick={handleExpand} disabled={isExpanding} className={`w-full py-5 rounded-[2.8rem] font-black text-white shadow-2xl transition-all flex items-center justify-center space-x-3 text-sm tracking-widest active:scale-95 ${isExpanding ? 'bg-slate-300' : 'bg-magic magic-active'}`}>
                <span className="text-2xl">🪄</span>
                <span>{isExpanding ? 'WORKING MAGIC...' : `GET 10 MORE ${state.selectedCategory.name.toUpperCase()}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {state.view === 'alphabet' && (
        <div className="flex-1 flex flex-col overflow-hidden pb-[var(--safe-bottom)] bg-slate-50">
          <div className="bg-[#22C55E] pt-[calc(var(--safe-top)+0.5rem)] pb-4 px-6 rounded-b-[2rem] shadow-sm flex items-center justify-between flex-shrink-0">
            <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 w-11 h-11 rounded-full text-white flex items-center justify-center text-xl shadow-inner active:scale-90">🏠</button>
            <h1 className="text-xl font-kids text-white uppercase">ABC Room</h1>
            <div className="w-11"></div>
          </div>
          <div className="flex-1 p-5 grid grid-cols-2 gap-4 overflow-y-auto scroll-container hide-scrollbar">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
              <button key={letter} onClick={() => handleSpeech(letter)} className="aspect-square bg-white rounded-[2.5rem] shadow-xl border-b-[10px] border-slate-200 flex items-center justify-center text-6xl font-kids text-slate-700 active:translate-y-2 active:border-b-0 transition-all">
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
             <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 w-11 h-11 rounded-full text-white flex items-center justify-center text-xl shadow-inner active:scale-90">🏠</button>
             <h1 className="text-xl font-kids text-white uppercase">Arcade</h1>
             <div className="w-11"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-container hide-scrollbar">
            {state.view === 'game_types' ? (
              Object.values(GameType).map(type => (
                <button key={type} onClick={() => setState({ ...state, selectedGame: type, view: 'game_cats' })} className="w-full flex items-center p-7 bg-white rounded-[3.5rem] border-4 border-slate-50 shadow-2xl active:border-indigo-400 group active:scale-95 transition-all">
                  <span className="text-6xl mr-6 group-active:scale-125 transition-transform">{type === GameType.FLASHCARDS ? '🗂️' : '🎮'}</span>
                  <span className="text-xl font-kids text-indigo-700 uppercase">{type}</span>
                </button>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-5">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setState({ ...state, selectedCategory: cat, view: 'game_active' })} className={`${cat.color} p-8 rounded-[2.5rem] shadow-2xl text-white flex flex-col items-center active:scale-90 transition-all border-b-[10px] border-black/10`}>
                    <span className="text-5xl">{cat.icon}</span>
                    <span className="text-[10px] font-black mt-3 uppercase tracking-tighter">{cat.name}</span>
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
