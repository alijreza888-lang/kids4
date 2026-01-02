
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

  // Handle API Errors (like 403 Forbidden)
  const handleApiError = async (error: any) => {
    console.error("API Call failed:", error);
    const errorMsg = error?.message || "";
    // If forbidden or not found, re-prompt for key selection
    if (errorMsg.includes("403") || errorMsg.includes("entity was not found") || errorMsg.includes("API key")) {
      if (window.aistudio) {
        await window.aistudio.openSelectKey();
      } else {
        alert("Please set a valid API key in your environment settings.");
      }
    } else {
      alert("Oops! Something went wrong with the Magic. Please try again.");
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
      // We try AI speech first if we have a key (even if it might fail)
      try {
        const audio = await generateSpeech(text);
        if (audio) { 
          await playTTSSound(audio, text); 
          played = true; 
        }
      } catch (e) {
        // Silently fall back to local speech for simple audio, but log for dev
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
    <div className="flex-1 flex flex-col h-full w-full max-w-md mx-auto bg-white overflow-hidden relative shadow-xl">
      {state.view === 'main' && (
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          <div className="bg-[#FFD233] pt-10 pb-6 px-6 rounded-b-[2.5rem] shadow-lg flex flex-col items-center flex-shrink-0">
            <h1 className="text-2xl font-kids text-white uppercase tracking-tighter drop-shadow-sm">KidsJoy Learning</h1>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
            <button onClick={() => setState({ ...state, view: 'alphabet' })} className="w-full bg-[#22C55E] p-5 rounded-3xl shadow-md flex items-center space-x-4">
              <span className="text-3xl">🔤</span>
              <span className="text-lg font-kids text-white">ABC ROOM</span>
            </button>
            <button onClick={() => setState({ ...state, view: 'learning_detail', selectedCategory: categories[0] })} className="w-full bg-[#6366F1] p-5 rounded-3xl shadow-md flex items-center space-x-4">
              <span className="text-3xl">🍎</span>
              <span className="text-lg font-kids text-white">NEW WORDS</span>
            </button>
            <button onClick={() => setState({ ...state, view: 'game_types' })} className="w-full bg-[#FF7043] p-5 rounded-3xl shadow-md flex items-center space-x-4">
              <span className="text-3xl">🎮</span>
              <span className="text-lg font-kids text-white">PLAY GAMES</span>
            </button>
            
            <div className="p-4 bg-white/50 rounded-2xl border border-dashed border-slate-300 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">AI Configuration</p>
              <button 
                onClick={() => window.aistudio?.openSelectKey()} 
                className="text-[10px] font-bold text-indigo-600 underline"
              >
                Change API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {state.view === 'learning_detail' && state.selectedCategory && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="bg-[#FFD233] pt-8 pb-3 px-6 rounded-b-3xl shadow-sm flex items-center justify-between relative flex-shrink-0">
            <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 p-2 rounded-full text-white text-sm">🏠</button>
            <h1 className="text-lg font-kids text-white uppercase">{state.selectedCategory.name}</h1>
            <div className="w-8"></div>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex overflow-x-auto hide-scrollbar px-4 py-3 space-x-2 bg-white border-b">
              {categories.map((c) => (
                <button key={c.id} onClick={() => { setState({ ...state, selectedCategory: c }); setLearningIndex(0); }} 
                  className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center text-lg ${state.selectedCategory?.id === c.id ? 'bg-[#FF9F1C] text-white shadow-md' : 'bg-slate-50 opacity-40'}`}>{c.icon}</button>
              ))}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="learning-card w-full max-w-[260px] flex flex-col items-center">
                <div onClick={() => setShowPersian(!showPersian)} className={`w-full aspect-square rounded-[3rem] shadow-xl flex flex-col items-center justify-center relative border-4 transition-all ${showPersian ? 'bg-indigo-600 border-indigo-400' : 'bg-white border-slate-50'}`}>
                  {!showPersian ? (
                    <>
                      <div className="flex-1 w-full p-6 flex items-center justify-center overflow-hidden">
                        {itemImage ? (
                          <img src={itemImage} alt="item" className="max-w-full max-h-full object-contain rounded-2xl animate-in zoom-in" />
                        ) : (
                          <span className="text-8xl drop-shadow-md">{state.selectedCategory.items[learningIndex]?.emoji}</span>
                        )}
                      </div>
                      <div className="mb-6 bg-indigo-50 px-5 py-2 rounded-full border border-indigo-100">
                        <span className="text-lg font-kids text-indigo-700 uppercase">{state.selectedCategory.items[learningIndex]?.name}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 animate-in zoom-in">
                      <h2 className="text-4xl font-kids text-white" dir="rtl">{state.selectedCategory.items[learningIndex]?.persianName}</h2>
                      <p className="text-[10px] text-white/50 mt-4 uppercase font-bold">Tap to see emoji</p>
                    </div>
                  )}
                  
                  <button onClick={(e) => { e.stopPropagation(); handleSpeech(state.selectedCategory?.items[learningIndex]?.name || ""); }} className="absolute -top-3 -right-3 w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white active:scale-90">🔊</button>
                  <button onClick={(e) => { e.stopPropagation(); handleImageGen(); }} className={`absolute -top-3 -left-3 w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white active:scale-90 ${isGeneratingImg ? 'animate-spin' : ''}`}>
                    {isGeneratingImg ? '⏳' : '🎨'}
                  </button>
                </div>

                <div className="flex w-full space-x-3 mt-6">
                  <button onClick={() => { setLearningIndex(p => (p > 0 ? p - 1 : state.selectedCategory!.items.length - 1)); setShowPersian(false); }} className="flex-1 bg-slate-100 py-3 rounded-2xl font-bold text-slate-400 text-xs">PREV</button>
                  <button onClick={() => { setLearningIndex(p => (p < state.selectedCategory!.items.length - 1 ? p + 1 : 0)); setShowPersian(false); }} className="flex-1 bg-indigo-600 py-3 rounded-2xl font-bold text-white shadow-md text-xs">NEXT</button>
                </div>
              </div>
            </div>

            <div className="px-5 pb-6">
              <button onClick={handleExpand} disabled={isExpanding} className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${isExpanding ? 'bg-slate-300' : 'bg-magic'}`}>
                <span>{isExpanding ? '🪄 MAGIC...' : `ADD 10 NEW ${state.selectedCategory.name.toUpperCase()}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {state.view === 'alphabet' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-[#22C55E] pt-8 pb-3 px-6 rounded-b-3xl shadow-sm flex items-center justify-between flex-shrink-0">
            <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 p-2 rounded-full text-white text-sm">🏠</button>
            <h1 className="text-lg font-kids text-white uppercase">ABC Room</h1>
            <div className="w-8"></div>
          </div>
          <div className="flex-1 p-3 grid grid-cols-4 gap-2 overflow-y-auto hide-scrollbar">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
              <button key={letter} onClick={() => handleSpeech(letter)} className="aspect-square bg-white rounded-2xl shadow-sm border-b-4 border-slate-100 flex items-center justify-center text-2xl font-kids text-slate-600 active:bg-slate-50">{letter}</button>
            ))}
          </div>
        </div>
      )}

      {state.view === 'game_active' && state.selectedCategory && state.selectedGame && (
        <GameEngine category={state.selectedCategory} gameType={state.selectedGame} onBack={() => setState({ ...state, view: 'game_types' })} />
      )}

      {(state.view === 'game_types' || state.view === 'game_cats') && (
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          <div className="bg-[#FFD233] pt-8 pb-3 px-6 rounded-b-3xl shadow-sm flex items-center justify-between flex-shrink-0">
             <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 p-2 rounded-full text-white text-sm">🏠</button>
             <h1 className="text-lg font-kids text-white uppercase">Games</h1>
             <div className="w-8"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
            {state.view === 'game_types' ? (
              Object.values(GameType).map(type => (
                <button key={type} onClick={() => setState({ ...state, selectedGame: type, view: 'game_cats' })} className="w-full flex items-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm active:border-indigo-400">
                  <span className="text-2xl mr-4">{type === GameType.FLASHCARDS ? '🗂️' : '🎮'}</span>
                  <span className="text-lg font-kids text-indigo-700 uppercase">{type}</span>
                </button>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setState({ ...state, selectedCategory: cat, view: 'game_active' })} className={`${cat.color} p-4 rounded-2xl shadow-md text-white flex flex-col items-center active:scale-95 transition-all`}>
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="text-[9px] font-bold mt-1 uppercase">{cat.name}</span>
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
