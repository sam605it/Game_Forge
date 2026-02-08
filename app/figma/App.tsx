"use client";
import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ChatInterface } from "./components/ChatInterface";
import { GamePreview } from "./components/GamePreview";
import { GameConfig, ChatMessage } from '@/app/types';
import { GameSpec } from '@/engine/spec/gameSpec';
import { createInitialMessage, processUserMessage } from '@/app/lib/gameGenie';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, 
  Box, 
  Search, 
  Globe, 
  Settings, 
  Zap, 
  LayoutGrid,
  X,
  CreditCard,
  Lock,
  User,
  Star,
  Sun,
  Moon
} from 'lucide-react';

type View = 'forge' | 'vault' | 'explore' | 'connect';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([createInitialMessage()]);
  const [currentGameConfig, setCurrentGameConfig] = useState<GameConfig | undefined>(undefined);
  const [isTyping, setIsTyping] = useState(false);
  const [gameSpec, setGameSpec] = useState<GameSpec | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  
  // Navigation & Theme State
  const [activeView, setActiveView] = useState<View>('forge');
  const [showSignIn, setShowSignIn] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Theme Constants
  const theme = {
    bg: isDarkMode ? 'bg-[#05080F]' : 'bg-slate-50',
    text: isDarkMode ? 'text-slate-200' : 'text-slate-800',
    headerBg: isDarkMode ? 'bg-[#05080F]/95' : 'bg-white/95',
    border: isDarkMode ? 'border-white/5' : 'border-slate-200',
    panelBg: isDarkMode ? 'bg-[#0B0E14]' : 'bg-white',
    panelInnerBg: isDarkMode ? 'bg-black' : 'bg-slate-100',
    inputBg: isDarkMode ? 'bg-[#151921]' : 'bg-white',
    accentText: isDarkMode ? 'text-cyan-400' : 'text-blue-600',
    accentBg: isDarkMode ? 'bg-cyan-500' : 'bg-blue-600',
    accentHover: isDarkMode ? 'hover:bg-cyan-400' : 'hover:bg-blue-500',
    navActive: isDarkMode ? 'bg-[#0F131A] text-cyan-400 border-cyan-500/20' : 'bg-slate-100 text-blue-600 border-blue-200',
    navInactive: isDarkMode ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
  };

  const handleSendMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setIsGenerating(true);
    setGameError(null);

    fetch('/api/game', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Game generation failed'))))
      .then((data: GameSpec) => setGameSpec(data))
      .catch((err: Error) => setGameError(err.message))
      .finally(() => setIsGenerating(false));

    setTimeout(() => {
      const response = processUserMessage(text, currentGameConfig);
      
      setMessages(prev => [...prev, response]);
      if (response.gameConfig) {
        setCurrentGameConfig(response.gameConfig);
      }
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const NavButton = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveView(view)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 ${
        activeView === view ? theme.navActive : theme.navInactive
      } ${activeView === view && isDarkMode ? 'shadow-[0_0_10px_rgba(6,182,212,0.1)]' : ''}`}
    >
      <Icon size={14} /> {label}
    </button>
  );

  return (
    <div className={`h-screen w-screen ${theme.bg} overflow-hidden font-sans ${theme.text} flex flex-col selection:bg-cyan-500/30 relative transition-colors duration-300`}>
      {/* Header */}
      <header className={`h-16 border-b ${theme.border} flex items-center justify-between px-6 ${theme.headerBg} backdrop-blur-md z-40 relative transition-colors duration-300`}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 font-bold tracking-widest text-lg cursor-pointer" onClick={() => setActiveView('forge')}>
            <div className={`w-8 h-8 bg-gradient-to-br ${isDarkMode ? 'from-cyan-500 to-blue-600' : 'from-blue-500 to-indigo-600'} rounded-lg flex items-center justify-center ${isDarkMode ? 'shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'shadow-md'}`}>
              <Layers size={18} className="text-white" />
            </div>
            <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>GAME FORGE</span>
          </div>

          <nav className="flex items-center gap-1">
            <NavButton view="forge" icon={Zap} label="FORGE" />
            <NavButton view="vault" icon={Box} label="VAULT" />
            <NavButton view="explore" icon={Search} label="EXPLORE" />
            <NavButton view="connect" icon={Globe} label="CONNECT" />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg transition-colors ${theme.navInactive}`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div className={`flex items-center gap-2 px-3 py-1.5 ${isDarkMode ? 'bg-[#0F131A]' : 'bg-slate-100'} rounded-full border ${theme.border}`}>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">CREDITS</span>
            <span className={`text-xs font-bold ${theme.accentText}`}>10/10</span>
          </div>
          
          <button 
            className={`p-2 transition-colors ${theme.navInactive}`}
            onClick={() => toast.info("Settings panel unavailable in preview mode")}
          >
            <Settings size={18} />
          </button>
          
          <button 
            onClick={() => setShowUpgrade(true)}
            className={`px-5 py-1.5 border ${theme.border} text-xs font-bold tracking-wider rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
          >
            UPGRADE
          </button>
          
          <button 
            onClick={() => setShowSignIn(true)}
            className={`px-6 py-1.5 ${theme.accentBg} ${theme.accentHover} text-white text-xs font-bold tracking-wider rounded-lg ${isDarkMode ? 'shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]' : 'shadow-md hover:shadow-lg'} transition-all`}
          >
            SIGN IN
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden p-4 relative">
        <AnimatePresence mode="wait">
          {activeView === 'forge' && (
            <motion.div 
              key="forge"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="h-full w-full"
            >
              <PanelGroup direction="horizontal" className="h-full gap-4">
                <Panel defaultSize={30} minSize={25} maxSize={40} className={`${theme.panelBg} rounded-2xl border ${theme.border} overflow-hidden flex flex-col shadow-2xl transition-colors duration-300`}>
                  <ChatInterface 
                    messages={messages} 
                    onSendMessage={handleSendMessage} 
                    isTyping={isTyping}
                    isDarkMode={isDarkMode}
                  />
                </Panel>
                
                <PanelResizeHandle className={`w-2 bg-transparent hover:bg-cyan-500/10 transition-colors cursor-col-resize rounded-full group`}>
                  <div className={`w-1 h-8 ${isDarkMode ? 'bg-white/10' : 'bg-slate-300'} rounded-full mx-auto mt-[40vh] group-hover:bg-cyan-500/50 transition-colors`} />
                </PanelResizeHandle>
                
                <Panel className={`${theme.panelInnerBg} rounded-2xl border ${theme.border} overflow-hidden relative shadow-2xl transition-colors duration-300`}>
                  <div className={`absolute top-0 left-0 w-full h-12 border-b ${theme.border} flex items-center justify-between px-6 ${theme.panelBg} z-10 transition-colors duration-300`}>
                    <div className="flex items-center gap-4">
                      <button className={`flex items-center gap-2 text-[10px] font-bold tracking-widest ${isDarkMode ? 'text-slate-500 hover:text-cyan-400' : 'text-slate-400 hover:text-blue-600'} transition-colors`}>
                        <span className="text-lg">‹</span> FORGE
                      </button>
                      <div className={`h-4 w-[1px] ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>
                      <span className={`text-[10px] font-bold tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>ADAPTIVE CORE 3.0</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <button 
                        onClick={() =>
                          setCurrentGameConfig((prev) => ({
                            ...(prev ?? { type: 'snake' }),
                            type: prev?.type ?? 'snake',
                          }))
                        }
                        className={`px-3 py-1 ${isDarkMode ? 'bg-[#151921] border-white/5 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'} border rounded text-[10px] font-bold tracking-wider hover:text-current transition-colors`}
                       >
                        RESET
                       </button>
                       <button className={`p-1.5 ${theme.navInactive}`}>
                        <LayoutGrid size={14} />
                       </button>
                    </div>
                  </div>
                  
                  <div className="w-full h-full pt-12">
                     <GamePreview
                      gameSpec={gameSpec}
                      isDarkMode={isDarkMode}
                      isGenerating={isGenerating}
                      error={gameError}
                     />
                  </div>
                </Panel>
              </PanelGroup>
            </motion.div>
          )}

          {activeView === 'vault' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full flex flex-col items-center justify-center text-center p-8"
            >
              <div className={`w-24 h-24 rounded-full ${isDarkMode ? 'bg-[#151921] border-white/5 shadow-[0_0_40px_rgba(255,255,255,0.05)]' : 'bg-slate-100 border-slate-200 shadow-sm'} border flex items-center justify-center mb-6`}>
                <Box size={40} className="text-slate-500" />
              </div>
              <h2 className={`text-2xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Your Vault is Empty</h2>
              <p className="text-slate-500 max-w-sm leading-relaxed mb-8">
                Games you create and save will appear here. Start forging to build your collection.
              </p>
              <button 
                onClick={() => setActiveView('forge')}
                className={`px-8 py-3 ${theme.accentBg} ${theme.accentHover} text-white font-bold tracking-widest rounded-lg shadow-lg transition-all hover:scale-105`}
              >
                START FORGING
              </button>
            </motion.div>
          )}

          {activeView === 'explore' && (
             <motion.div
              key="explore"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full p-8 overflow-y-auto"
             >
               <h2 className={`text-3xl font-black mb-8 tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Community Creations</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1, 2, 3, 4, 5, 6].map((i) => (
                   <div key={i} className={`group ${isDarkMode ? 'bg-[#0B0E14] border-white/5 hover:border-cyan-500/30' : 'bg-white border-slate-200 hover:border-blue-400'} border rounded-xl overflow-hidden transition-all hover:shadow-xl cursor-pointer`}>
                     <div className={`h-40 ${isDarkMode ? 'bg-[#151921]' : 'bg-slate-100'} relative overflow-hidden`}>
                        <div className={`absolute inset-0 bg-gradient-to-t ${isDarkMode ? 'from-[#0B0E14]' : 'from-white'} to-transparent opacity-80`} />
                        <div className="absolute center inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className={`px-4 py-2 ${theme.accentBg} text-white font-bold text-xs rounded-lg uppercase tracking-wider shadow-lg`}>Play Now</div>
                        </div>
                     </div>
                     <div className="p-5">
                       <h3 className={`font-bold mb-1 group-hover:${isDarkMode ? 'text-cyan-400' : 'text-blue-600'} transition-colors ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Neon Serpent v{i}.0</h3>
                       <p className="text-xs text-slate-500 mb-4 line-clamp-2">A cyberpunk twist on the classic snake game with particle effects and time dilation.</p>
                       <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-600">
                         <span>@CREATOR_{i}</span>
                         <span className="flex items-center gap-1"><Star size={10} className="text-yellow-500" fill="currentColor"/> 4.{9-i}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </motion.div>
          )}
          
          {activeView === 'connect' && (
            <motion.div
              key="connect"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full h-full flex flex-col items-center justify-center text-center p-8"
            >
              <div className={`w-24 h-24 rounded-full ${isDarkMode ? 'bg-[#151921] border-white/5' : 'bg-slate-100 border-slate-200'} border flex items-center justify-center mb-6 relative`}>
                 <div className={`absolute inset-0 border ${isDarkMode ? 'border-cyan-500/20' : 'border-blue-500/20'} rounded-full animate-ping opacity-20`} />
                <Globe size={40} className={theme.accentText} />
              </div>
              <h2 className={`text-2xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Global Network Offline</h2>
              <p className="text-slate-500 max-w-sm leading-relaxed mb-8">
                Multiplayer services are currently undergoing maintenance. Check back later for real-time collaboration features.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUpgrade(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className={`${isDarkMode ? 'bg-[#0B0E14] border-white/10' : 'bg-white border-slate-200'} border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative transition-colors`}
            >
              <button onClick={() => setShowUpgrade(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
              
              <div className={`p-8 text-center border-b ${theme.border} ${isDarkMode ? 'bg-gradient-to-b from-cyan-950/20 to-[#0B0E14]' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
                <div className={`w-16 h-16 bg-gradient-to-br ${isDarkMode ? 'from-cyan-500 to-blue-600' : 'from-blue-500 to-indigo-600'} rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg`}>
                  <Zap size={32} className="text-white" />
                </div>
                <h2 className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'} tracking-tighter uppercase mb-2`}>Upgrade to Pro</h2>
                <p className="text-slate-500">Unlock the full potential of the Forge Engine</p>
              </div>
              
              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-1 ${isDarkMode ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-100 text-blue-600'} rounded`}><Zap size={16} /></div>
                    <div>
                      <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} text-sm`}>Unlimited Generations</h4>
                      <p className="text-xs text-slate-500 mt-1">Create as many games as you want without daily limits.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <div className={`p-1 ${isDarkMode ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-100 text-blue-600'} rounded`}><Box size={16} /></div>
                    <div>
                      <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} text-sm`}>Cloud Vault</h4>
                      <p className="text-xs text-slate-500 mt-1">Save and export your games to HTML5, React, or Mobile.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <div className={`p-1 ${isDarkMode ? 'bg-cyan-500/10 text-cyan-400' : 'bg-blue-100 text-blue-600'} rounded`}><Globe size={16} /></div>
                    <div>
                      <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} text-sm`}>Multiplayer Servers</h4>
                      <p className="text-xs text-slate-500 mt-1">Deploy your games with one click to global servers.</p>
                    </div>
                  </div>
                </div>
                
                <div className={`${isDarkMode ? 'bg-[#151921] border-white/5' : 'bg-slate-50 border-slate-200'} rounded-xl p-6 border flex flex-col items-center justify-center text-center`}>
                  <span className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-2">Monthly Plan</span>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>$19</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <button className={`w-full py-3 ${theme.accentBg} ${theme.accentHover} text-white font-bold tracking-widest rounded-lg shadow-lg transition-all transform hover:scale-[1.02] mb-3`}>
                    SUBSCRIBE NOW
                  </button>
                  <p className="text-[10px] text-slate-600">Secure payment via Stripe. Cancel anytime.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sign In Modal */}
      <AnimatePresence>
        {showSignIn && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSignIn(false)}
          >
            <motion.div 
               initial={{ scale: 0.9, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               exit={{ scale: 0.9, y: 20 }}
               onClick={e => e.stopPropagation()}
               className={`${isDarkMode ? 'bg-[#0B0E14] border-white/10' : 'bg-white border-slate-200'} border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative transition-colors`}
            >
              <button onClick={() => setShowSignIn(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
              
              <div className="p-8">
                <div className="mb-8 text-center">
                  <div className={`w-12 h-12 ${isDarkMode ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-blue-100 border-blue-200'} rounded-xl mx-auto flex items-center justify-center mb-4 border`}>
                    <User size={24} className={theme.accentText} />
                  </div>
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>Welcome Back</h2>
                  <p className="text-slate-500 text-sm">Enter your credentials to access the Forge.</p>
                </div>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Successfully signed in!"); setShowSignIn(false); }}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <CreditCard size={16} className="absolute left-4 top-3.5 text-slate-600" />
                      <input 
                        type="email" 
                        placeholder="architect@gameforge.com" 
                        className={`w-full ${isDarkMode ? 'bg-[#151921] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-lg py-3 pl-11 pr-4 text-sm placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors`} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                       <a href="#" className={`text-xs ${theme.accentText} hover:underline`}>Forgot?</a>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-3.5 text-slate-600" />
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className={`w-full ${isDarkMode ? 'bg-[#151921] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border rounded-lg py-3 pl-11 pr-4 text-sm placeholder-slate-500 focus:border-cyan-500 focus:outline-none transition-colors`} 
                      />
                    </div>
                  </div>
                  
                  <button className={`w-full py-3 ${isDarkMode ? 'bg-white hover:bg-slate-200 text-black' : 'bg-slate-900 hover:bg-slate-800 text-white'} font-bold tracking-wide rounded-lg mt-2 transition-colors`}>
                    SIGN IN
                  </button>
                </form>
                
                <div className={`mt-6 pt-6 border-t ${theme.border} text-center`}>
                  <p className="text-xs text-slate-500">
                    Don't have an account? <button onClick={() => { setShowSignIn(false); setShowUpgrade(true); }} className={`${theme.accentText} font-bold hover:underline`}>Create Access Key</button>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster theme={isDarkMode ? 'dark' : 'light'} position="bottom-right" />
    </div>
  );
}
