"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Plus,
  MessageSquare,
  User,
  Bot,
  Sidebar as SidebarIcon,
  Search,
  MoreHorizontal,
  Settings,
  ArrowUpCircle,
  Paperclip
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatGPTWeb() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex h-screen w-full bg-[#212121] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-[#171717] border-r border-white/10 flex flex-col overflow-hidden"
      >
        <div className="p-3 flex flex-col h-full">
          <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/5 transition-colors text-sm font-medium border border-white/10 mb-4">
            <Plus size={16} />
            <span>New chat</span>
          </button>

          <div className="flex-1 overflow-y-auto space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Recent
            </div>
            {["Next.js App Setup", "ChatGPT Interface Design", "API Integration Ideas"].map((chat, i) => (
              <button key={i} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-300 truncate group">
                <MessageSquare size={14} className="shrink-0" />
                <span className="truncate flex-1 text-left">{chat}</span>
              </button>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-white/10 space-y-1">
            <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-300">
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <div className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-300">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                JD
              </div>
              <span className="flex-1 text-left font-medium">John Doe</span>
              <MoreHorizontal size={14} className="text-gray-500" />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative bg-[#212121]">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-white/5 sticky top-0 z-10 bg-[#212121]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-white/5 rounded-md transition-colors"
              >
                <SidebarIcon size={18} />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-200">Stuck 1.0</span>
            </div>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden pt-4 custom-scrollbar">
          <div className="max-w-3xl mx-auto w-full px-4 space-y-8 pb-32">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-4 group",
                    msg.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    msg.role === "assistant" ? "bg-[#10a37f]" : "bg-[#3b82f6]"
                  )}>
                    {msg.role === "assistant" ? <Bot size={18} /> : <User size={18} />}
                  </div>
                  <div className={cn(
                    "flex flex-col max-w-[85%]",
                    msg.role === "user" ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm",
                      msg.role === "user"
                        ? "bg-[#3b82f6] text-white rounded-tr-none"
                        : "bg-[#2f2f2f] text-gray-100 rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-2 px-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center shrink-0">
                  <Bot size={18} />
                </div>
                <div className="bg-[#2f2f2f] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent">
          <div className="max-w-3xl mx-auto relative group">
            <div className="bg-[#2f2f2f] border border-white/10 rounded-[28px] p-2 flex items-end shadow-2xl transition-all focus-within:border-white/20">
              <button className="p-3 text-gray-400 hover:text-white transition-colors">
                <Paperclip size={20} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message ChatGPT..."
                className="flex-1 bg-transparent border-none outline-none resize-none px-2 py-3 text-[15px] max-h-48 custom-scrollbar placeholder:text-gray-500"
                rows={1}
                style={{ height: 'auto' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className={cn(
                  "p-2 rounded-full mb-1 transition-all duration-200",
                  input.trim()
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                )}
              >
                <ArrowUpCircle size={28} />
              </button>
            </div>
            <div className="text-[11px] text-gray-500 text-center mt-3">
              ChatGPT can make mistakes. Check important info.
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
