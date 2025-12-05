"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import moodDataRaw from "../data/mood_data.json";
import { ArrowLeft, RefreshCw, Quote, Heart, Moon, Sun, Flame, ChevronRight, Menu, X } from "lucide-react";

// --- Types ---
type MoodItem = {
  mood: string;
  arabic: string;
  english: string;
  bangla: string;
  reference: string;
  source: string;
};

type MoodConfigItem = {
  label: string;
  emoji: string;
  color: string;
  gradient: string;
  darkGradient: string;
};

// --- Data & Config ---
const moodData = moodDataRaw as MoodItem[];

const moodConfig: Record<string, MoodConfigItem> = {
  "Anxious": {
    label: "Anxious", emoji: "😰",
    color: "text-blue-600 dark:text-blue-300",
    gradient: "from-blue-50 to-blue-100",
    darkGradient: "from-slate-950 to-blue-950"
  },
  "Happyness": {
    label: "Happy", emoji: "😊",
    color: "text-yellow-600 dark:text-yellow-300",
    gradient: "from-yellow-50 to-yellow-100",
    darkGradient: "from-slate-950 to-yellow-950"
  },
  "Gurding From Evil": {
    label: "Protection", emoji: "🛡️",
    color: "text-purple-600 dark:text-purple-300",
    gradient: "from-purple-50 to-purple-100",
    darkGradient: "from-slate-950 to-purple-950"
  },
  "Feeling Sad": {
    label: "Sad", emoji: "😢",
    color: "text-indigo-600 dark:text-indigo-300",
    gradient: "from-indigo-50 to-indigo-100",
    darkGradient: "from-slate-950 to-indigo-950"
  },
  "Pursuing Forgiveness": {
    label: "Forgiveness", emoji: "🤲",
    color: "text-emerald-600 dark:text-emerald-300",
    gradient: "from-emerald-50 to-emerald-100",
    darkGradient: "from-slate-950 to-emerald-950"
  },
  "Seeking Health": {
    label: "Health", emoji: "🤒",
    color: "text-teal-600 dark:text-teal-300",
    gradient: "from-teal-50 to-teal-100",
    darkGradient: "from-slate-950 to-teal-950"
  },
  "Depression": {
    label: "Depressed", emoji: "🌧️",
    color: "text-slate-600 dark:text-slate-300",
    gradient: "from-slate-100 to-slate-200",
    darkGradient: "from-slate-950 to-black"
  },
  "intense desire or temptation": {
    label: "Temptation", emoji: "🔥",
    color: "text-red-600 dark:text-red-300",
    gradient: "from-red-50 to-red-100",
    darkGradient: "from-slate-950 to-red-950"
  },
  "comfort": {
    label: "Need Comfort", emoji: "🛋️",
    color: "text-orange-600 dark:text-orange-300",
    gradient: "from-orange-50 to-orange-100",
    darkGradient: "from-slate-950 to-orange-950"
  },
  "confusion and uncertainty about the future": {
    label: "Confused", emoji: "😕",
    color: "text-gray-600 dark:text-gray-300",
    gradient: "from-gray-100 to-gray-200",
    darkGradient: "from-slate-950 to-gray-900"
  },
  "anger": {
    label: "Angry", emoji: "😠",
    color: "text-rose-600 dark:text-rose-300",
    gradient: "from-rose-50 to-rose-100",
    darkGradient: "from-slate-950 to-rose-950"
  },
};

const normalizeMoodKey = (dataKey: string) => {
  if (moodConfig[dataKey]) return dataKey;
  for (const key of Object.keys(moodConfig)) {
    if (dataKey.includes(key) || key.includes(dataKey)) return key;
  }
  return "Anxious";
};

// --- Hooks ---

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.log(error);
    }
    setIsLoaded(true);
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue, isLoaded] as const;
}

// --- Main Component ---

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [quote, setQuote] = useState<MoodItem | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Features State
  const [favorites, setFavorites] = useLocalStorage<MoodItem[]>("favorites", []);
  const [streak, setStreak] = useLocalStorage<number>("streak", 0);
  const [lastVisit, setLastVisit] = useLocalStorage<string>("lastVisit", "");
  const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>("darkMode", false);
  const [showFavorites, setShowFavorites] = useState(false);

  // Initialize Streak
  useEffect(() => {
    const today = new Date().toDateString();
    if (lastVisit !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastVisit === yesterday.toDateString()) {
        setStreak((s) => s + 1);
      } else if (lastVisit && lastVisit !== today) {
        // Reset streak if missed a day, but keep 1 for today
        setStreak(1);
      } else if (!lastVisit) {
        setStreak(1);
      }
      setLastVisit(today);
    }
  }, [lastVisit, setLastVisit, setStreak]);

  // Apply Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleMoodSelect = (moodKey: string) => {
    const items = moodData.filter((item) => {
      const normalized = normalizeMoodKey(item.mood);
      return normalized === moodKey || item.mood.includes(moodKey);
    });

    if (items.length > 0) {
      // eslint-disable-next-line react-hooks/purity
      const randomItem = items[Math.floor(Math.random() * items.length)];
      setSelectedMood(moodKey);
      setQuote(randomItem);
    }
  };

  const toggleFavorite = (item: MoodItem) => {
    const exists = favorites.some(f => f.arabic === item.arabic);
    if (exists) {
      setFavorites(favorites.filter(f => f.arabic !== item.arabic));
    } else {
      setFavorites([...favorites, item]);
    }
  };

  const isFavorite = (item: MoodItem | null) => {
    if (!item) return false;
    return favorites.some(f => f.arabic === item.arabic);
  };

  const reset = () => {
    setSelectedMood(null);
    setQuote(null);
    setShowFavorites(false);
  };

  // Swipe Handler
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -50 && selectedMood) {
      // Swipe Left -> Next Verse
      handleMoodSelect(selectedMood);
    }
  };

  const currentConfig = selectedMood ? moodConfig[selectedMood] : null;

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-700 ease-in-out 
      ${isDarkMode
        ? (currentConfig ? currentConfig.darkGradient : 'bg-slate-950')
        : (currentConfig ? currentConfig.gradient : 'bg-[#FDFBF7]')
      }`}>

      {/* Background blobs - Static in dark mode for performance, subtle in light */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 transition-colors duration-1000 
        ${isDarkMode ? 'bg-blue-900/20 mix-blend-normal' : (selectedMood ? 'bg-white' : 'bg-purple-200')}`}></div>
      <div className={`absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 transition-colors duration-1000 
        ${isDarkMode ? 'bg-purple-900/20 mix-blend-normal' : (selectedMood ? 'bg-white' : 'bg-yellow-200')}`}></div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 bg-white/30 dark:bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 dark:border-white/10">
          <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`} />
          <span className="font-bold text-gray-700 dark:text-white">{streak}</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowFavorites(!showFavorites)}
            className="p-2.5 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-white/50 transition-colors"
          >
            {showFavorites ? <X className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-full bg-white/30 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-white/20 text-gray-700 dark:text-white hover:bg-white/50 transition-colors"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showFavorites ? (
          <motion.div
            key="favorites-list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="z-10 w-full max-w-2xl h-[80vh] overflow-y-auto custom-scrollbar px-4 pt-20"
          >
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Your Heart&apos;s Collection</h2>
            {favorites.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
                <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No favorites yet. Tap the heart on a verse to save it.</p>
              </div>
            ) : (
              <div className="space-y-4 pb-20">
                {favorites.map((fav, idx) => (
                  <div key={idx} className="bg-white/60 dark:bg-slate-800/80 backdrop-blur-md p-6 rounded-2xl border border-white/40 dark:border-white/20 shadow-sm relative group">
                    <button
                      onClick={() => toggleFavorite(fav)}
                      className="absolute top-4 right-4 text-red-500 opacity-50 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xl font-serif text-gray-800 dark:text-white mb-2" dir="rtl">{fav.arabic}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-2">&quot;{fav.english}&quot;</p>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">{fav.reference}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : !selectedMood ? (
          <motion.div
            key="mood-selector"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="z-10 w-full max-w-5xl text-center mt-12"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="mb-8 md:mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-800 dark:text-white tracking-tight">How is your heart today?</h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl font-light">Select a mood to find comfort in the words of Allah.</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 pb-10">
              {Object.entries(moodConfig).map(([key, config], index) => (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMoodSelect(key)}
                  className={`group p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center gap-4 
                    bg-white/40 dark:bg-slate-800/60 backdrop-blur-sm border border-white/60 dark:border-white/20 hover:border-white/80 dark:hover:border-white/40`}
                >
                  <span className="text-5xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{config.emoji}</span>
                  <span className={`font-medium text-lg ${config.color} transition-colors`}>{config.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="quote-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="z-10 w-full max-w-3xl px-4 h-full flex items-center justify-center"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
          >
            <div className="bg-white dark:bg-slate-900/90 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-white/50 dark:border-white/20 relative overflow-hidden w-full">
              {/* Decorative quote mark */}
              <Quote className="absolute top-8 left-8 text-black/5 dark:text-white/5 w-24 h-24 -z-10 rotate-180" />

              {/* Swipe Indicator */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-32 flex items-center justify-center opacity-20 animate-pulse pointer-events-none">
                <ChevronRight className="w-8 h-8 text-gray-400" />
              </div>

              <div className="flex justify-between items-center mb-10">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors group px-4 py-2 rounded-full hover:bg-white/50 dark:hover:bg-white/10"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Back</span>
                </button>

                <div className={`flex items-center gap-2 px-5 py-2 rounded-full bg-white/40 dark:bg-black/40 border border-white/40 dark:border-white/10 shadow-sm ${currentConfig?.color}`}>
                  <span className="text-xl">{currentConfig?.emoji}</span>
                  <span className="font-semibold">{currentConfig?.label}</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={quote?.reference || "loading"}
                  initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex flex-col gap-8 text-center"
                >
                  {/* Arabic Text */}
                  <div className="relative">
                    <p className="text-3xl md:text-5xl leading-[1.8] font-serif text-gray-800 dark:text-white font-medium drop-shadow-sm" dir="rtl" lang="ar">
                      {quote?.arabic}
                    </p>
                  </div>

                  {/* English Translation */}
                  <div className="space-y-2">
                    <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 leading-relaxed font-light italic">
                      &quot;{quote?.english}&quot;
                    </p>
                  </div>

                  {/* Bangla Translation */}
                  <div className="space-y-2">
                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                      {quote?.bangla}
                    </p>
                  </div>

                  {/* Reference */}
                  <div className="pt-8 border-t border-gray-200/50 dark:border-white/10 flex justify-between items-center">
                    <p className="text-sm font-semibold tracking-widest text-gray-400 uppercase">
                      {quote?.reference}
                    </p>
                    <button
                      onClick={() => quote && toggleFavorite(quote)}
                      className={`p-2 rounded-full transition-all ${isFavorite(quote) ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                    >
                      <Heart className={`w-6 h-6 ${isFavorite(quote) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => selectedMood && handleMoodSelect(selectedMood)}
                  className="group relative px-8 py-3.5 rounded-full bg-gray-900/90 dark:bg-white/90 text-white dark:text-gray-900 font-medium hover:bg-gray-900 dark:hover:bg-white transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-3 overflow-hidden backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>New Verse</span>
                </button>
              </div>

              <div className="absolute bottom-4 right-0 left-0 text-center text-xs text-gray-400 opacity-50 pointer-events-none">
                Swipe left for next
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
