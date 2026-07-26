import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Shield,
  Eye,
  FileCode,
  Activity,
  Radio,
  Sliders,
  Volume2,
  VolumeX,
  Globe,
  Award,
  Zap,
  Settings,
  Calculator,
  HelpCircle,
  Battery,
  Map,
  Compass,
  ArrowRight,
  Sparkles,
  Layers
} from 'lucide-react';

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: 'Screens' | 'Settings & Controls' | 'Automations & Tools';
  keywords: string[];
  icon: React.ReactNode;
  badge?: string;
  onSelect: () => void;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SearchItem[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  items
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const q = query.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesTitle = item.title.toLowerCase().includes(q);
    const matchesDesc = item.description.toLowerCase().includes(q);
    const matchesKw = item.keywords.some((kw) => kw.toLowerCase().includes(q));

    return matchesCategory && (matchesTitle || matchesDesc || matchesKw);
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  const categories = ['All', 'Screens', 'Settings & Controls', 'Automations & Tools'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
        {/* Backdrop click listener */}
        <div className="fixed inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden glow-emerald flex flex-col max-h-[80vh]"
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 bg-slate-900/90">
            <Search className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search screens, settings, controls, guides, or tools..."
              className="w-full bg-transparent text-sm font-medium text-white placeholder-slate-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-2 py-1 text-[10px] font-mono text-slate-400 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-md border border-slate-700 transition"
            >
              ESC
            </button>
          </div>

          {/* Category Filter Badges */}
          <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/40 border-b border-slate-800/60 overflow-x-auto scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-850'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Results List */}
          <div className="p-2 overflow-y-auto max-h-[420px] space-y-1 divide-y divide-slate-900/50">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Compass className="w-8 h-8 text-slate-600 mx-auto animate-bounce" />
                <p className="text-sm font-bold text-slate-400">No matching screens or settings found</p>
                <p className="text-xs text-slate-500">
                  Try searching for <span className="text-emerald-400">"Beacons"</span>, <span className="text-emerald-400">"Vibration"</span>, <span className="text-emerald-400">"Glasses"</span>, <span className="text-emerald-400">"Firmware"</span>, or <span className="text-emerald-400">"Language"</span>.
                </p>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      item.onSelect();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-slate-900/90 border border-emerald-500/40 text-white shadow-md'
                        : 'bg-transparent border border-transparent text-slate-300 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-400'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">{item.title}</span>
                          {item.badge && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-2">
                      <span className="text-[9px] font-mono text-slate-500 uppercase hidden sm:inline">
                        {item.category}
                      </span>
                      <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-emerald-400 translate-x-1' : 'text-slate-600'}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Modal Footer Tip */}
          <div className="px-4 py-2.5 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Use <kbd className="px-1 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400">↑</kbd> <kbd className="px-1 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400">↓</kbd> to navigate, <kbd className="px-1 py-0.5 bg-slate-950 border border-slate-800 rounded text-slate-400">Enter</kbd> to select</span>
            </div>
            <span>{filteredItems.length} results</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
