"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import moodDataRaw from "../data/mood_data.json";
import { ArrowLeft, RefreshCw, Quote } from "lucide-react";

// Define types
type MoodItem = {
  mood: string;
  arabic: string;
  english: string;
  bangla: string;
  reference: string;
  source: string;
};

const moodData = moodDataRaw as MoodItem[];

const moodConfig: Record<string, { label: string; emoji: string; color: string; gradient: string }> = {
  "Anxious": { label: "Anxious", emoji: "😰", color: "text-blue-600", gradient: "from-blue-50 to-blue-100" },
  "Happyness": { label: "Happy", emoji: "😊", color: "text-yellow-600", gradient: "from-yellow-50 to-yellow-100" },
  "Gurding From Evil": { label: "Protection", emoji: "🛡️", color: "text-purple-600", gradient: "from-purple-50 to-purple-100" },
  "Feeling Sad": { label: "Sad", emoji: "😢", color: "text-indigo-600", gradient: "from-indigo-50 to-indigo-100" },
  "Pursuing Forgiveness": { label: "Forgiveness", emoji: "🤲", color: "text-emerald-600", gradient: "from-emerald-50 to-emerald-100" },
  "Seeking Health": { label: "Health", emoji: "🤒", color: "text-teal-600", gradient: "from-teal-50 to-teal-100" },
  "Depression": { label: "Depressed", emoji: "🌧️", color: "text-slate-600", gradient: "from-slate-100 to-slate-200" },
  "intense desire or temptation": { label: "Temptation", emoji: "🔥", color: "text-red-600", gradient: "from-red-50 to-red-100" },
  "comfort": { label: "Need Comfort", emoji: "🛋️", color: "text-orange-600", gradient: "from-orange-50 to-orange-100" },
  "confusion and uncertainty about the future": { label: "Confused", emoji: "😕", color: "text-gray-600", gradient: "from-gray-100 to-gray-200" },
  "anger": { label: "Angry", emoji: "😠", color: "text-rose-600", gradient: "from-rose-50 to-rose-100" },
};

// Helper to normalize mood keys from data to config
const normalizeMoodKey = (dataKey: string) => {
  if (moodConfig[dataKey]) return dataKey;
  // Try partial matches
  for (const key of Object.keys(moodConfig)) {
    if (dataKey.includes(key) || key.includes(dataKey)) return key;
  }
  return "Anxious"; // Fallback
};

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [quote, setQuote] = useState<MoodItem | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMoodSelect = (moodKey: string) => {
    // Find all items that match this mood (using partial matching if needed)
    const items = moodData.filter((item) => {
      const normalized = normalizeMoodKey(item.mood);
      return normalized === moodKey || item.mood.includes(moodKey);
    });

    if (items.length > 0) {
      setIsAnimating(true);
      const randomItem = items[Math.floor(Math.random() * items.length)];

      // Small delay to allow exit animation if we are already viewing a quote
      if (selectedMood) {
        setTimeout(() => {
          setQuote(randomItem);
          setIsAnimating(false);
        }, 300);
      } else {
        setSelectedMood(moodKey);
        setQuote(randomItem);
        setIsAnimating(false);
      }
    }
  };

  const reset = () => {
    setSelectedMood(null);
    setQuote(null);
  };

  const currentConfig = selectedMood ? moodConfig[selectedMood] : null;

  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-700 ${currentConfig ? currentConfig.gradient : 'bg-[#FDFBF7]'}`}>

      {/* Background blobs - dynamic colors */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob transition-colors duration-1000 ${selectedMood ? 'bg-white' : 'bg-purple-200'}`}></div>
      <div className={`absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 transition-colors duration-1000 ${selectedMood ? 'bg-white' : 'bg-yellow-200'}`}></div>
      <div className={`absolute bottom-[-20%] left-[20%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 transition-colors duration-1000 ${selectedMood ? 'bg-white' : 'bg-pink-200'}`}></div>

      <AnimatePresence mode="wait">
        {!selectedMood ? (
          <motion.div
            key="mood-selector"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="z-10 w-full max-w-5xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gray-800 tracking-tight">How is your heart today?</h1>
              <p className="text-gray-500 text-lg md:text-xl font-light">Select a mood to find comfort in the words of Allah.</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
              {Object.entries(moodConfig).map(([key, config], index) => (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMoodSelect(key)}
                  className={`group p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-white/60 backdrop-blur-md border border-white/40 hover:bg-white/90`}
                >
                  <span className="text-5xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{config.emoji}</span>
                  <span className={`font-medium text-lg ${config.color.replace('text-', 'text-opacity-80 group-hover:text-opacity-100 ')}`}>{config.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="quote-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className="z-10 w-full max-w-3xl px-4"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-12 shadow-2xl border border-white/60 relative overflow-hidden">
              {/* Decorative quote mark */}
              <Quote className="absolute top-8 left-8 text-gray-100 w-24 h-24 -z-10 rotate-180" />

              <div className="flex justify-between items-center mb-8">
                <button
                  onClick={reset}
                  className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors group px-3 py-1 rounded-full hover:bg-gray-100/50"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-medium">Back</span>
                </button>

                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-white/50 ${currentConfig?.color}`}>
                  <span className="text-xl">{currentConfig?.emoji}</span>
                  <span className="font-semibold">{currentConfig?.label}</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={quote?.reference || "loading"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-8 text-center"
                >
                  {/* Arabic Text */}
                  <div className="relative">
                    <p className="text-3xl md:text-4xl leading-[1.6] font-serif text-gray-800 font-medium" dir="rtl" lang="ar">
                      {quote?.arabic}
                    </p>
                  </div>

                  {/* English Translation */}
                  <div className="space-y-2">
                    <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-light italic">
                      "{quote?.english}"
                    </p>
                  </div>

                  {/* Bangla Translation */}
                  <div className="space-y-2">
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed font-light">
                      {quote?.bangla}
                    </p>
                  </div>

                  {/* Reference */}
                  <div className="pt-6 border-t border-gray-100">
                    <p className="text-sm font-semibold tracking-wide text-gray-400 uppercase">
                      {quote?.reference}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-10 flex justify-center">
                <button
                  onClick={() => selectedMood && handleMoodSelect(selectedMood)}
                  disabled={isAnimating}
                  className="group relative px-8 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <RefreshCw className={`w-5 h-5 ${isAnimating ? 'animate-spin' : ''}`} />
                  <span>New Verse</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
