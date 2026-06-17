
import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { generateResponse } from './services/geminiService';
import { 
  PaperAirplaneIcon, 
  TrashIcon,
  AcademicCapIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (suggestion?: string) => {
    const textToSend = suggestion || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!suggestion) setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await generateResponse(textToSend, chatHistory);
      
      const botMessage: Message = {
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I encountered a technical issue. Please try your question again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-[#141b2d] text-white flex flex-col p-6 shadow-xl z-20">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-[#6366f1] p-2 rounded-lg shadow-lg">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Iqra University</span>
        </div>

        <div className="flex-1 space-y-6">
          <div className="bg-[#1e263c] rounded-2xl p-6 border border-slate-700/30">
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="w-5 h-5 text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-100 uppercase tracking-widest">AI Intelligence</h4>
            </div>
            <p className="text-[13px] text-slate-400 leading-relaxed">
              Our smart assistant provides instant answers for all campuses, degree programs, and scholarship details.
            </p>
          </div>
        </div>

        <button 
          onClick={clearConversation}
          className="mt-auto flex items-center justify-center gap-2 w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300 transition-all text-xs font-bold border border-white/5 uppercase tracking-widest"
        >
          <TrashIcon className="w-4 h-4" />
          Clear Conversation
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative bg-[#fcfdfe]">
        {/* Header */}
        <header className="h-20 border-b flex items-center justify-between px-10 bg-white shadow-sm z-10">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Admission Assistant</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-400 font-medium tracking-tight">Online & Ready</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
             <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 text-[10px] font-bold uppercase tracking-wider">
               <SparklesIcon className="w-3.5 h-3.5" />
               Smart Processing
             </div>
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
              <div className="w-24 h-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
                <ChatBubbleBottomCenterTextIcon className="w-12 h-12 text-indigo-500" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">Welcome to Iqra University</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed font-medium mb-10">
                Start a conversation to learn about our world-class programs and admission process.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <button 
                  onClick={() => handleSend("What programs are offered at Iqra University?")}
                  className="p-4 text-[13px] bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all text-slate-600 font-semibold text-left"
                >
                  View offered programs
                </button>
                <button 
                  onClick={() => handleSend("Tell me about the fee structure for Bachelors.")}
                  className="p-4 text-[13px] bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-md transition-all text-slate-600 font-semibold text-left"
                >
                  Check fee structure
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-10">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border ${msg.role === 'user' ? 'bg-[#141b2d] text-white border-transparent' : 'bg-indigo-50 text-indigo-600 border-indigo-100'}`}>
                    {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <AcademicCapIcon className="w-6 h-6" />}
                  </div>
                  
                  <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`rounded-[1.5rem] p-6 shadow-sm border ${msg.role === 'user' ? 'bg-[#141b2d] border-transparent text-white' : 'bg-white border-slate-200 text-slate-700'}`}>
                      <div className="text-[15px] leading-relaxed prose prose-slate max-w-none 
                        prose-p:mt-0 last:prose-p:mb-0
                        prose-strong:text-indigo-600 prose-strong:font-bold
                        prose-ul:my-2 prose-li:my-1 prose-headings:mb-2 prose-headings:mt-0
                        prose-headings:text-slate-800">
                        {msg.text}
                      </div>
                    </div>
                    <span className="text-[10px] mt-2 font-bold text-slate-400 uppercase tracking-widest px-2">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
                    <AcademicCapIcon className="w-6 h-6 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="bg-white border border-slate-200 p-5 rounded-[1.5rem] flex gap-2 items-center shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-3">Assistant is writing...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask your admission question here..."
                  disabled={isLoading}
                  className="w-full p-5 pl-8 bg-[#f8fafc] border-2 border-transparent rounded-full focus:outline-none focus:border-indigo-500/30 focus:bg-white transition-all disabled:opacity-50 text-[15px] font-medium text-slate-700 shadow-inner"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="w-11 h-11 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    <PaperAirplaneIcon className="w-5 h-5 -rotate-45 -translate-y-0.5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center items-center gap-4">
              <div className="h-[1px] w-8 bg-slate-100"></div>
              <p className="text-[9px] text-slate-300 font-bold tracking-[0.4em] uppercase">
                Official Support Portal
              </p>
              <div className="h-[1px] w-8 bg-slate-100"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
