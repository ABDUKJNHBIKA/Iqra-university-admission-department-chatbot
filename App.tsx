
import React, { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { createChunks } from './services/ragEngine';
import { generateRagResponse } from './services/geminiService';
import { 
  PaperAirplaneIcon, 
  DocumentTextIcon, 
  InformationCircleIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contextChunks, setContextChunks] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const text = await file.text();
    const chunks = createChunks(text);
    setContextChunks(chunks);
    
    // Welcome message
    const welcomeMsg: Message = {
      role: 'model',
      text: `Data successfully loaded from **${file.name}**. I am now ready to answer your questions about Iqra University admissions. How can I help you today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMsg]);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (contextChunks.length === 0) {
        const warning: Message = {
          role: 'model',
          text: "Please upload an admission data file (.txt) first so I can assist you accurately.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, warning]);
      } else {
        const chatHistory = messages.map(m => ({ role: m.role, text: m.text }));
        const responseText = await generateRagResponse(input, contextChunks, chatHistory);
        
        const botMessage: Message = {
          role: 'model',
          text: responseText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        role: 'model',
        text: "I encountered an error while processing your request. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <AcademicCapIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Iqra University</h1>
          </div>

          <div className="flex-1 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Knowledge Base</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept=".txt" 
                  onChange={handleFileUpload}
                  className="hidden" 
                  id="data-upload"
                />
                <label 
                  htmlFor="data-upload"
                  className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-700 rounded-xl hover:border-indigo-500 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <DocumentTextIcon className="w-6 h-6 text-slate-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Upload .txt data</p>
                    <p className="text-xs text-slate-500">{fileName || 'No file selected'}</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold mb-1">How it works</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This assistant uses RAG (Retrieval-Augmented Generation) to search through the university documents you upload and provide accurate answers based on that content.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <button 
              onClick={resetChat}
              className="flex items-center justify-center gap-2 w-full p-3 bg-slate-800 rounded-xl hover:bg-red-900/40 hover:text-red-200 transition-all text-sm font-medium"
            >
              <TrashIcon className="w-4 h-4" />
              Clear Conversation
            </button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-white relative">
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg lg:hidden"
            >
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-slate-600" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Admission Assistant</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-slate-500 font-medium">Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {fileName && (
               <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-semibold">
                 <DocumentTextIcon className="w-3.5 h-3.5" />
                 {fileName}
               </div>
             )}
          </div>
        </header>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/50"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Welcome to Iqra University</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                  Please upload the admission details file (.txt) in the sidebar to start asking questions about programs, fees, and more.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    {msg.role === 'user' ? (
                      <span className="text-xs font-bold">ME</span>
                    ) : (
                      <AcademicCapIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm border ${msg.role === 'user' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white text-slate-800 border-slate-200'}`}>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-slate max-w-none">
                      {msg.text}
                    </div>
                    <div className={`text-[10px] mt-2 font-medium opacity-60 ${msg.role === 'user' ? 'text-right' : ''}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                  <AcademicCapIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 bg-white border-t">
          <div className="max-w-4xl mx-auto flex gap-3 relative">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={contextChunks.length > 0 ? "Ask a question about admissions..." : "Upload data file to start..."}
              disabled={contextChunks.length === 0 || isLoading}
              className="flex-1 p-4 bg-slate-100 border border-transparent rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading || contextChunks.length === 0}
              className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all flex items-center justify-center"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-widest">
            Iqra University Admission Support Bot • Powered by AI
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
