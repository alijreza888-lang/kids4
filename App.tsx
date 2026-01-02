
import React, { useState, useEffect } from 'react';
import { CATEGORIES as INITIAL_CATEGORIES } from './constants';
import { Category, GameType, GameState } from './types';
import { GameEngine } from './components/Games';
import { generateSpeech, expandCategoryItems, generateItemImage } from './services/geminiService';
import { playTTSSound, playLocalSpeech } from './services/audioPlayer';
import { imageStorage } from './services/storage';

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kids_joy_categories_v4');
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

  // Persistence
  useEffect(() => {
    localStorage.setItem('kids_joy_categories_v4', JSON.stringify(categories));
  }, [categories]);

  /**
   * Enhanced API error handler
   */
  const handleApiError = async (error: any) => {
    console.error("API Call failed:", error);
    const errorMsg = error?.message || "";
    
    // Safety filters
    if (errorMsg.includes("Safety") || errorMsg.includes("blocked")) {
      alert("Magic failed: This word might be too hard for the magic to draw. Try another one!");
      return;
    }

    // Auth errors or generic failures - prompt for key
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
      } catch (e) {
        alert("Please select a valid API key to use Magic features.");
      }
    } else {
      alert("API Key missing. Please check your environment variables.");
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      if (state.view === 'learning_detail' && state.selectedCategory) {
        const item = state.selectedCategory.items[learningIndex];
        if (item) {
          const cached = await imageStorage.get(`kids_joy_img_${item.id}`);
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
      } catch (e) {
        console.warn("AI Speech failed, using local fallback");
      }
      if (!played) await playLocalSpeech(text);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsSpeaking(false); 
    }
  };

  const handleImageGen = async () => {
    const item = state.selectedCategory?.items[learningIndex];
    if (isGeneratingImg || !item) return;
    setIsGeneratingImg(true);
    try {
      const url = await generateItemImage(item.name, state.selectedCategory!.name);
      if (url) {
        await imageStorage.set(`kids_joy_img_${item.id}`, url);
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
    setIsExpanding(true);
    try {
      const newItems = await expandCategoryItems(state.selectedCategory.name, state.selectedCategory.items);
      if (newItems && newItems.length > 0) {
        const updated = categories.map(c => 
          c.id === state.selectedCategory!.id ? { ...c, items: [...c.items, ...newItems] } : c
        );
        setCategories(updated);
        setState(s => ({ ...s, selectedCategory: updated.find(cat => cat.id === s.selectedCategory?.id) || s.selectedCategory }));
      }
    } catch (e) { 
      await handleApiError(e);
    } finally { 
      setIsExpanding(false); 
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full max-w-2xl mx-auto bg-white overflow-hidden relative sm:shadow-2xl">
      {state.view === 'main' && (
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden pb-[var(--safe-bottom)]">
          <div className="bg-[#FFD233] pt-[calc(var(--safe-top)+2.5rem)] pb-8 px-6 rounded-b-[3rem] shadow-lg flex flex-col items-center flex-shrink-0">
            <h1 className="text-3xl font-kids text-white uppercase tracking-tighter drop-shadow-md">KidsJoy Learning</h1>
            <p className="text-white/80 font-bold text-xs mt-1">FUN ADVENTURE AWAITS!</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-5 hide-scrollbar">
            <button onClick={() => setState({ ...state, view: 'alphabet' })} className="w-full bg-[#22C55E] p-6 rounded-[2.5rem] shadow-xl flex items-center space-x-5 active:scale-95 transition-all">
              <span className="text-4xl">🔤</span>
              <span className="text-xl font-kids text-white">ABC ROOM</span>
            </button>
            <button onClick={() => setState({ ...state, view: 'learning_detail', selectedCategory: categories[0] })} className="w-full bg-[#6366F1] p-6 rounded-[2.5rem] shadow-xl flex items-center space-x-5 active:scale-95 transition-all">
              <span className="text-4xl">🍎</span>
              <span className="text-xl font-kids text-white">NEW WORDS</span>
            </button>
            <button onClick={() => setState({ ...state, view: 'game_types' })} className="w-full bg-[#FF7043] p-6 rounded-[2.5rem] shadow-xl flex items-center space-x-5 active:scale-95 transition-all">
              <span className="text-4xl">🎮</span>
              <span className="text-xl font-kids text-white">PLAY GAMES</span>
            </button>
            
            <div className="p-6 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">AI SETTINGS</p>
              <button 
                onClick={() => window.aistudio?.openSelectKey()} 
                className="text-xs font-black text-indigo-600 underline"
              >
                UPDATE MAGIC KEY
              </button>
            </div>
          </div>
        </div>
      )}

      {state.view === 'learning_detail' && state.selectedCategory && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white pb-[var(--safe-bottom)]">
          <div className="bg-[#FFD233] pt-[calc(var(--safe-top)+1rem)] pb-4 px-6 rounded-b-[2rem] shadow-sm flex items-center justify-between relative flex-shrink-0">
            <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 w-10 h-10 rounded-full text-white flex items-center justify-center text-lg">🏠</button>
            <h1 className="text-xl font-kids text-white uppercase">{state.selectedCategory.name}</h1>
            <div className="w-10"></div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex overflow-x-auto hide-scrollbar px-6 py-4 space-x-3 bg-white border-b">
              {categories.map((c) => (
                <button key={c.id} onClick={() => { setState({ ...state, selectedCategory: c }); setLearningIndex(0); }} 
                  className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-2xl transition-all ${state.selectedCategory?.id === c.id ? 'bg-[#FF9F1C] text-white shadow-lg scale-110' : 'bg-slate-50 opacity-40'}`}>{c.icon}</button>
              ))}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="learning-card">
                <div onClick={() => setShowPersian(!showPersian)} className={`w-full aspect-square rounded-[3.5rem] shadow-2xl flex flex-col items-center justify-center relative border-[6px] transition-all duration-300 ${showPersian ? 'bg-indigo-600 border-indigo-400' : 'bg-white border-slate-50'}`}>
                  {!showPersian ? (
                    <>
                      <div className="flex-1 w-full p-8 flex items-center justify-center overflow-hidden">
                        {itemImage ? (
                          <img src={itemImage} alt="item" className="max-w-full max-h-full object-contain rounded-3xl animate-in zoom-in duration-500" />
                        ) : (
                          <span className="text-[120px] drop-shadow-xl">{state.selectedCategory.items[learningIndex]?.emoji}</span>
                        )}
                      </div>
                      <div className="mb-8 bg-indigo-50 px-8 py-3 rounded-full border-2 border-indigo-100 shadow-sm">
                        <span className="text-2xl font-kids text-indigo-700 uppercase tracking-wide">{state.selectedCategory.items[learningIndex]?.name}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8 animate-in zoom-in duration-300">
                      <h2 className="text-5xl font-kids text-white mb-2" dir="rtl">{state.selectedCategory.items[learningIndex]?.persianName}</h2>
                      <p className="text-xs text-white/60 mt-6 uppercase font-black tracking-widest">TAP TO GO BACK</p>
                    </div>
                  )}
                  
                  <button onClick={(e) => { e.stopPropagation(); handleSpeech(state.selectedCategory?.items[learningIndex]?.name || ""); }} className="absolute -top-4 -right-4 w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-2xl text-white shadow-2xl border-[6px] border-white active:scale-90 z-20">🔊</button>
                  <button onClick={(e) => { e.stopPropagation(); handleImageGen(); }} className={`absolute -top-4 -left-4 w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-2xl text-white shadow-2xl border-[6px] border-white active:scale-90 z-20 ${isGeneratingImg ? 'animate-spin' : ''}`}>
                    {isGeneratingImg ? '⏳' : '🎨'}
                  </button>
                </div>

                <div className="flex w-full space-x-4 mt-10">
                  <button onClick={() => { setLearningIndex(p => (p > 0 ? p - 1 : state.selectedCategory!.items.length - 1)); setShowPersian(false); }} className="flex-1 bg-slate-100 py-5 rounded-[2rem] font-black text-slate-400 text-sm shadow-sm active:bg-slate-200">PREV</button>
                  <button onClick={() => { setLearningIndex(p => (p < state.selectedCategory!.items.length - 1 ? p + 1 : 0)); setShowPersian(false); }} className="flex-1 bg-indigo-600 py-5 rounded-[2rem] font-black text-white shadow-xl text-sm active:bg-indigo-700">NEXT</button>
                </div>
              </div>
            </div>

            <div className="px-8 pb-10">
              <button onClick={handleExpand} disabled={isExpanding} className={`w-full py-5 rounded-[2.5rem] font-black text-white shadow-2xl transition-all flex items-center justify-center space-x-3 text-sm tracking-widest ${isExpanding ? 'bg-slate-300' : 'bg-magic'}`}>
                <span className="text-xl">🪄</span>
                <span>{isExpanding ? 'WORKING MAGIC...' : `GET 10 MORE ${state.selectedCategory.name.toUpperCase()}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {state.view === 'alphabet' && (
        <div className="flex-1 flex flex-col overflow-hidden pb-[var(--safe-bottom)]">
          <div className="bg-[#22C55E] pt-[calc(var(--safe-top)+1rem)] pb-4 px-6 rounded-b-[2rem] shadow-sm flex items-center justify-between flex-shrink-0">
            <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 w-10 h-10 rounded-full text-white flex items-center justify-center text-lg">🏠</button>
            <h1 className="text-xl font-kids text-white uppercase">ABC Room</h1>
            <div className="w-10"></div>
          </div>
          <div className="flex-1 p-4 grid grid-cols-4 gap-3 overflow-y-auto hide-scrollbar">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
              <button key={letter} onClick={() => handleSpeech(letter)} className="aspect-square bg-white rounded-[1.5rem] shadow-lg border-b-[6px] border-slate-100 flex items-center justify-center text-3xl font-kids text-slate-700 active:bg-slate-50 transition-all active:translate-y-1">
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
          <div className="bg-[#FFD233] pt-[calc(var(--safe-top)+1rem)] pb-4 px-6 rounded-b-[2rem] shadow-sm flex items-center justify-between flex-shrink-0">
             <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 w-10 h-10 rounded-full text-white flex items-center justify-center text-lg">🏠</button>
             <h1 className="text-xl font-kids text-white uppercase">Games</h1>
             <div className="w-10"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
            {state.view === 'game_types' ? (
              Object.values(GameType).map(type => (
                <button key={type} onClick={() => setState({ ...state, selectedGame: type, view: 'game_cats' })} className="w-full flex items-center p-6 bg-white rounded-[2rem] border-2 border-slate-50 shadow-xl active:border-indigo-400 group transition-all">
                  <span className="text-4xl mr-6 group-active:scale-125 transition-transform">{type === GameType.FLASHCARDS ? '🗂️' : '🎮'}</span>
                  <span className="text-xl font-kids text-indigo-700 uppercase">{type}</span>
                </button>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setState({ ...state, selectedCategory: cat, view: 'game_active' })} className={`${cat.color} p-6 rounded-[2rem] shadow-xl text-white flex flex-col items-center active:scale-95 transition-all`}>
                    <span className="text-4xl">{cat.icon}</span>
                    <span className="text-xs font-black mt-2 uppercase tracking-tighter">{cat.name}</span>
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
