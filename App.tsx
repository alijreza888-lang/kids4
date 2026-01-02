import React, { useState, useEffect } from 'react';
import { CATEGORIES as INITIAL_CATEGORIES } from './constants';
import { Category, GameType, GameState } from './types';
import { GameEngine } from './components/Games';
import { generateSpeech, expandCategoryItems, generateItemImage } from './services/geminiService';
import { playTTSSound, playLocalSpeech } from './services/audioPlayer';
import { imageStorage } from './services/storage';

const App: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kids_joy_v9_data');
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
  const [showAllCats, setShowAllCats] = useState(false);

  useEffect(() => {
    localStorage.setItem('kids_joy_v9_data', JSON.stringify(categories));
  }, [categories]);

  // اصلاح منطق کلید API طبق قوانین Race Condition
  const ensureApiKey = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // طبق دستورالعمل: فرض می‌کنیم انتخاب موفق بوده و ادامه می‌دهیم
        return true; 
      }
    }
    return !!process.env.API_KEY;
  };

  const handleApiError = async (error: any) => {
    console.error("Magic Tool Error:", error);
    const msg = error?.message || "";
    
    // اگر پروژه پیدا نشد، دوباره درخواست انتخاب کلید می‌دهیم
    if (msg.includes("Requested entity was not found")) {
      if (window.aistudio) await window.aistudio.openSelectKey();
    } else if (msg.includes("API Key") || msg.includes("401") || msg.includes("403")) {
      if (window.aistudio) await window.aistudio.openSelectKey();
    } else {
      alert("Magic is busy! Please check your internet or your Paid API Key.");
    }
  };

  useEffect(() => {
    const loadImage = async () => {
      if (state.view === 'learning_detail' && state.selectedCategory) {
        const item = state.selectedCategory.items[learningIndex];
        if (item) {
          const cached = await imageStorage.get(`img_v9_${item.id}`);
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
    await ensureApiKey(); // فقط پنجره را باز می‌کند و ادامه می‌دهد

    setIsGeneratingImg(true);
    try {
      const url = await generateItemImage(item.name, state.selectedCategory!.name);
      if (url) {
        await imageStorage.set(`img_v9_${item.id}`, url);
        setItemImage(url);
      }
    } catch (e) { await handleApiError(e); }
    finally { setIsGeneratingImg(false); }
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
          <div className="bg-[#FFD233] pt-[calc(var(--safe-top)+1.5rem)] pb-8 px-6 rounded-b-[3rem] shadow-xl flex flex-col items-center flex-shrink-0 z-10">
            <h1 className="text-4xl font-kids text-white uppercase tracking-tighter drop-shadow-md">KIDS JOY</h1>
            <p className="text-white/80 font-bold text-[10px] mt-1 tracking-[0.2em] uppercase">Adventure Room</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-container hide-scrollbar">
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setState({ ...state, view: 'alphabet' })} className="col-span-2 bg-[#22C55E] p-6 rounded-[2.5rem] shadow-xl flex items-center justify-center space-x-4 btn-tap border-b-8 border-green-600">
                <span className="text-4xl">🔤</span>
                <span className="text-xl font-kids text-white">ABC ROOM</span>
              </button>
              <button onClick={() => setState({ ...state, view: 'game_types' })} className="col-span-2 bg-[#FF7043] p-6 rounded-[2.5rem] shadow-xl flex items-center justify-center space-x-4 btn-tap border-b-8 border-orange-600">
                <span className="text-4xl">🎮</span>
                <span className="text-xl font-kids text-white">PLAY GAMES</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Topics</h2>
                <button onClick={() => setShowAllCats(true)} className="text-[10px] font-bold text-indigo-500 underline">View All 25</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {categories.slice(0, 9).map(cat => (
                  <button key={cat.id} onClick={() => setState({ ...state, view: 'learning_detail', selectedCategory: cat })} className={`${cat.color} aspect-square rounded-[2rem] shadow-lg text-white flex flex-col items-center justify-center btn-tap border-b-4 border-black/10`}>
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="text-[9px] font-black mt-1 uppercase truncate w-full text-center px-1">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-4 text-center">
              <button onClick={() => window.aistudio?.openSelectKey()} className="px-6 py-2 bg-white rounded-full text-[9px] font-black text-slate-200 uppercase tracking-widest border border-slate-100">
                Change API Key 🪄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* تمام ۲۵ دسته‌بندی در یک نگاه */}
      {showAllCats && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="bg-slate-50 p-6 flex items-center justify-between border-b">
            <h2 className="text-xl font-kids text-slate-800 uppercase">All 25 Topics</h2>
            <button onClick={() => setShowAllCats(false)} className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-xl">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-4 pb-12">
            {categories.map(cat => (
              <button key={cat.id} onClick={() => { setState({ ...state, view: 'learning_detail', selectedCategory: cat }); setShowAllCats(false); }} className={`${cat.color} aspect-square rounded-[2rem] shadow-md text-white flex flex-col items-center justify-center btn-tap`}>
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-[9px] font-black mt-1 uppercase text-center px-1">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {state.view === 'learning_detail' && state.selectedCategory && (
        <div className="flex-1 flex flex-col overflow-hidden bg-white pb-[var(--safe-bottom)]">
          <div className="bg-[#FFD233] pt-[calc(var(--safe-top)+0.5rem)] pb-3 px-6 rounded-b-[2rem] shadow-sm flex items-center justify-between flex-shrink-0 z-10">
            <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 w-11 h-11 rounded-full text-white flex items-center justify-center text-xl shadow-inner btn-tap">🏠</button>
            <h1 className="text-xl font-kids text-white uppercase font-bold tracking-widest">{state.selectedCategory.name}</h1>
            <button onClick={() => setShowAllCats(true)} className="bg-white/40 w-11 h-11 rounded-full text-white flex items-center justify-center text-xl shadow-inner btn-tap">📚</button>
          </div>
          
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
            <div className="flex overflow-x-auto horizontal-scroll hide-scrollbar px-6 py-4 space-x-4 bg-white/80 border-b border-slate-100 flex-shrink-0">
              {categories.map((c) => (
                <button key={c.id} onClick={() => { setState({ ...state, selectedCategory: c }); setLearningIndex(0); setShowPersian(false); }} 
                  className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center text-2xl transition-all ${state.selectedCategory?.id === c.id ? 'bg-[#FF9F1C] text-white shadow-lg ring-4 ring-orange-100' : 'bg-white border opacity-60'}`}>{c.icon}</button>
              ))}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
              {/* دکمه نقاشی - انتقال به پایین برای جلوگیری از تداخل */}
              <button onClick={handleImageGen} className={`absolute bottom-32 left-8 w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-3xl text-white shadow-2xl border-4 border-white z-20 btn-tap ${isGeneratingImg ? 'animate-spin' : ''}`}>
                {isGeneratingImg ? '⏳' : '🎨'}
              </button>
              
              {/* دکمه صدا - انتقال به پایین */}
              <button onClick={() => handleSpeech(state.selectedCategory?.items[learningIndex]?.name || "")} className="absolute bottom-32 right-8 w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-3xl text-white shadow-2xl border-4 border-white z-20 btn-tap">
                🔊
              </button>

              <div className="w-full max-w-[320px] relative">
                <div onClick={() => setShowPersian(!showPersian)} className={`w-full aspect-square rounded-[4rem] shadow-2xl flex flex-col items-center justify-center relative border-[10px] transition-all duration-500 ${showPersian ? 'bg-indigo-600 border-indigo-400' : 'bg-white border-white'}`}>
                  {!showPersian ? (
                    <div className="flex flex-col items-center justify-center p-8 w-full h-full">
                      <div className="flex-1 w-full flex items-center justify-center overflow-hidden mb-4">
                        {itemImage ? (
                          <img src={itemImage} alt="item" className="max-w-full max-h-full object-contain rounded-3xl animate-in zoom-in" />
                        ) : (
                          <span className="text-[140px] drop-shadow-xl">{state.selectedCategory.items[learningIndex]?.emoji}</span>
                        )}
                      </div>
                      <div className="bg-indigo-50/50 px-8 py-3 rounded-2xl">
                        <span className="text-3xl font-kids text-indigo-700 uppercase tracking-wider">{state.selectedCategory.items[learningIndex]?.name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 animate-in zoom-in flex flex-col items-center justify-center">
                      <h2 className="text-6xl font-kids text-white mb-4" dir="rtl">{state.selectedCategory.items[learningIndex]?.persianName}</h2>
                      <p className="text-xs text-white/30 uppercase font-black tracking-widest mt-8">Tap to see picture</p>
                    </div>
                  )}
                </div>

                <div className="flex w-full space-x-4 mt-8">
                  <button onClick={() => { setLearningIndex(p => (p > 0 ? p - 1 : state.selectedCategory!.items.length - 1)); setShowPersian(false); }} className="flex-1 bg-white py-5 rounded-[2.5rem] font-black text-slate-300 text-lg shadow-md active:bg-slate-50 border-b-4 border-slate-100 transition-all">PREV</button>
                  <button onClick={() => { setLearningIndex(p => (p < state.selectedCategory!.items.length - 1 ? p + 1 : 0)); setShowPersian(false); }} className="flex-1 bg-indigo-600 py-5 rounded-[2.5rem] font-black text-white shadow-xl text-lg active:bg-indigo-700 active:translate-y-1 transition-all">NEXT</button>
                </div>
              </div>
            </div>

            <div className="px-8 pb-10 flex-shrink-0">
              <button onClick={handleExpand} disabled={isExpanding} className={`w-full py-5 rounded-[3rem] font-black text-white shadow-2xl transition-all flex items-center justify-center space-x-3 text-lg tracking-widest active:scale-95 ${isExpanding ? 'bg-slate-300' : 'bg-magic magic-btn-active'}`}>
                <span className="text-3xl">🪄</span>
                <span>{isExpanding ? 'WAIT...' : `GET 10 NEW`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* سایر بخش‌ها مشابه قبل */}
      {state.view === 'alphabet' && (
        <div className="flex-1 flex flex-col overflow-hidden pb-[var(--safe-bottom)] bg-slate-50">
          <div className="bg-[#22C55E] pt-[calc(var(--safe-top)+0.5rem)] pb-4 px-6 rounded-b-[2rem] shadow-sm flex items-center justify-between flex-shrink-0">
            <button onClick={() => setState({...state, view: 'main'})} className="bg-white/40 w-11 h-11 rounded-full text-white flex items-center justify-center text-xl shadow-inner active:scale-90">🏠</button>
            <h1 className="text-xl font-kids text-white uppercase">ABC Room</h1>
            <div className="w-11"></div>
          </div>
          <div className="flex-1 p-5 grid grid-cols-2 gap-4 overflow-y-auto scroll-container hide-scrollbar">
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
              <button key={letter} onClick={() => handleSpeech(letter)} className="aspect-square bg-white rounded-[2rem] shadow-xl border-b-[10px] border-slate-200 flex items-center justify-center text-6xl font-kids text-slate-700 active:translate-y-2 active:border-b-0 transition-all">
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
             <h1 className="text-xl font-kids text-white uppercase tracking-wider">Arcade</h1>
             <div className="w-11"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-container hide-scrollbar">
            {state.view === 'game_types' ? (
              Object.values(GameType).map(type => (
                <button key={type} onClick={() => setState({ ...state, selectedGame: type, view: 'game_cats' })} className="w-full flex items-center p-7 bg-white rounded-[3rem] border-4 border-slate-50 shadow-2xl active:border-indigo-400 group active:scale-95 transition-all">
                  <span className="text-6xl mr-6 group-active:scale-125 transition-transform">{type === GameType.FLASHCARDS ? '🗂️' : '🎮'}</span>
                  <span className="text-xl font-kids text-indigo-700 uppercase">{type}</span>
                </button>
              ))
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setState({ ...state, selectedCategory: cat, view: 'game_active' })} className={`${cat.color} p-6 rounded-[2rem] shadow-xl text-white flex flex-col items-center active:scale-90 transition-all border-b-8 border-black/10`}>
                    <span className="text-5xl">{cat.icon}</span>
                    <span className="text-[10px] font-black mt-3 uppercase tracking-tighter truncate w-full px-1">{cat.name}</span>
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
