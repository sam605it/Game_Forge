import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Bot, Box } from 'lucide-react';
import { ChatMessage } from '@/app/types';
import { motion } from 'motion/react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  isDarkMode: boolean;
}

export const ChatInterface = ({ messages, onSendMessage, isTyping, isDarkMode }: ChatInterfaceProps) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  const theme = {
    bg: isDarkMode ? 'bg-[#0B0E14]' : 'bg-white',
    headerCardBg: isDarkMode ? 'bg-[#13171F]' : 'bg-slate-50',
    headerBorder: isDarkMode ? 'border-white/5' : 'border-slate-200',
    headerText: isDarkMode ? 'text-slate-300' : 'text-slate-600',
    headerIcon: isDarkMode ? 'text-cyan-400' : 'text-blue-600',
    userMsgBg: isDarkMode ? 'bg-cyan-500/10' : 'bg-blue-50',
    userMsgBorder: isDarkMode ? 'border-cyan-500/20' : 'border-blue-100',
    userMsgText: isDarkMode ? 'text-cyan-100' : 'text-slate-800',
    aiMsgBg: isDarkMode ? 'bg-[#151921]' : 'bg-white',
    aiMsgBorder: isDarkMode ? 'border-white/5' : 'border-slate-200',
    aiMsgText: isDarkMode ? 'text-slate-300' : 'text-slate-700',
    inputAreaBg: isDarkMode ? 'bg-[#0B0E14]' : 'bg-white',
    inputAreaBorder: isDarkMode ? 'border-white/5' : 'border-slate-200',
    inputBg: isDarkMode ? 'bg-[#13171F]' : 'bg-slate-50',
    inputBorder: isDarkMode ? 'border-white/5' : 'border-slate-200',
    inputText: isDarkMode ? 'text-slate-200' : 'text-slate-800',
    inputPlaceholder: isDarkMode ? 'placeholder-slate-600' : 'placeholder-slate-400',
    sendBtn: isDarkMode ? 'bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-[#0B0E14]' : 'bg-blue-100 hover:bg-blue-600 text-blue-600 hover:text-white',
  };

  return (
    <div className={`flex flex-col h-full ${theme.bg} relative transition-colors duration-300`}>
      {/* Forge Engine Header Card */}
      <div className="p-6 pb-2">
        <div className={`${theme.headerCardBg} border ${theme.headerBorder} rounded-xl p-5 relative overflow-hidden group transition-colors duration-300`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Box size={80} />
          </div>
          <div className="flex items-center gap-2 mb-3">
             <Box size={16} className={theme.headerIcon} />
             <h3 className={`text-xs font-bold tracking-widest ${theme.headerIcon} uppercase`}>Forge Engine</h3>
          </div>
          <p className={`text-sm ${theme.headerText} leading-relaxed font-medium`}>
            Welcome to the Forge. I am your AI architect. Describe the game you wish to materialize, and I will build it with procedural sound and optimized logic.
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent" ref={scrollRef}>
        {messages.filter(m => m.id !== 'init').map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-xl text-sm leading-relaxed border transition-colors duration-300 ${
                msg.role === 'user'
                  ? `${theme.userMsgBg} ${theme.userMsgBorder} ${theme.userMsgText} rounded-tr-sm`
                  : `${theme.aiMsgBg} ${theme.aiMsgBorder} ${theme.aiMsgText} rounded-tl-sm shadow-sm`
              }`}
            >
              {msg.role === 'assistant' && (
                 <div className="flex items-center gap-2 mb-2 opacity-50">
                    <Bot size={12} />
                    <span className="text-[10px] font-bold tracking-wider uppercase">System</span>
                 </div>
              )}
              {msg.content}
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start w-full">
            <div className={`${theme.aiMsgBg} border ${theme.aiMsgBorder} p-4 rounded-xl rounded-tl-sm flex gap-1 items-center transition-colors duration-300`}>
              <span className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-cyan-400' : 'bg-blue-500'} rounded-full animate-bounce [animation-delay:-0.3s]`}></span>
              <span className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-cyan-400' : 'bg-blue-500'} rounded-full animate-bounce [animation-delay:-0.15s]`}></span>
              <span className={`w-1.5 h-1.5 ${isDarkMode ? 'bg-cyan-400' : 'bg-blue-500'} rounded-full animate-bounce`}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`p-4 ${theme.inputAreaBg} border-t ${theme.inputAreaBorder} transition-colors duration-300`}>
        <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">Forge Credits Remaining</span>
            <span className={`text-[10px] font-bold ${theme.headerIcon} tracking-widest`}>10/10</span>
        </div>
        
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Materialize a concept..."
            className={`w-full ${theme.inputBg} ${theme.inputText} ${theme.inputPlaceholder} text-sm px-5 py-4 rounded-xl border ${theme.inputBorder} focus:outline-none ${isDarkMode ? 'focus:border-cyan-500/50 focus:ring-cyan-500/50' : 'focus:border-blue-500/50 focus:ring-blue-500/50'} focus:ring-1 transition-all pr-12 font-medium`}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={`absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-lg transition-all disabled:opacity-0 disabled:scale-75 ${theme.sendBtn}`}
          >
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
