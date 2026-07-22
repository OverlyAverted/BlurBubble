import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Sparkles, Send, X, RefreshCw, Terminal, Minimize2, Maximize2, Shield, Zap } from 'lucide-react';
import { CitizenState } from '../types';

interface AiTacticalCopilotProps {
  citizenState: CitizenState;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiTacticalCopilot: React.FC<AiTacticalCopilotProps> = ({ citizenState, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Greetings. I am BlurBubble Tactical Privacy Copilot powered by Gemini 3.6. I monitor RFC-9402 broadcast telemetry, RF shield modulation, and optical censorship. How can I assist your privacy defense today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          systemContext: {
            isBroadcasting: citizenState.isBroadcasting,
            privacyLevel: citizenState.privacyLevel,
            rangeMeters: citizenState.rangeMeters,
            registeredEntitiesCount: citizenState.registeredEntities.length
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply || 'No reply received from Gemini 3.6.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Tactical Copilot error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `⚠️ Copilot connection error: ${err.message || 'Server timeout'}. Please verify your network connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="fixed bottom-6 right-6 w-96 max-w-[92vw] h-[550px] max-h-[80vh] bg-slate-950/98 border border-emerald-500/40 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.25)] backdrop-blur-xl z-[200] flex flex-col font-sans select-none overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-extrabold uppercase font-mono text-white tracking-wider flex items-center gap-1.5">
                AI Tactical Copilot
                <span className="text-[8px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-mono">
                  3.6
                </span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 block">
                RFC-9402 & Shield Defense Assistant
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            'How to counter smart doorbells?',
            'RFC-9402 broadcast specs',
            'BIPA biometric scan laws',
            'Optimal shield range'
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip)}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[9px] font-mono text-emerald-300 rounded-lg whitespace-nowrap cursor-pointer transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 font-sans rounded-tl-none'
                }`}
              >
                {m.sender === 'assistant' && (
                  <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Gemini 3.6 Tactical AI
                  </span>
                )}
                <p className="whitespace-pre-line text-xs">{m.text}</p>
              </div>
              <span className="text-[8px] font-mono text-slate-500 mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs p-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Gemini 3.6 computing response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Tactical Copilot..."
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:border-emerald-400 outline-none"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
