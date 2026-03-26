import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Loader2, Sparkles, User } from 'lucide-react';
import { adminChat } from '../services/geminiService';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AdminChatbotProps {
  reports: any[];
}

export default function AdminChatbot({ reports }: AdminChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Barangay AI Assistant. How can I help you manage the reports today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await adminChat(userMessage, reports);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Chat failed:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error processing your request." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-white shadow-2xl shadow-indigo-900/40 transition-all hover:scale-110 active:scale-95"
      >
        <Bot className="h-8 w-8" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[600px] w-[400px] flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between border-b border-zinc-800 bg-indigo-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">Barangay AI</h3>
                <p className="text-[10px] uppercase tracking-widest opacity-70">Official Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-2 hover:bg-white/10 transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-950">
            {messages.map((msg, i) => (
              <div key={i} className={cn(
                "flex w-full gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}>
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  msg.role === 'user' ? "bg-zinc-800" : "bg-indigo-600/20 text-indigo-400"
                )}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
                  msg.role === 'user' 
                    ? "bg-zinc-800 text-white rounded-tr-none" 
                    : "bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-tl-none"
                )}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="bg-zinc-900 text-zinc-500 rounded-2xl rounded-tl-none px-4 py-2 text-sm italic">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="border-t border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-md">
            <div className="relative">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about reports..."
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 py-3 pr-12 pl-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-xl bg-indigo-600 p-2 text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
