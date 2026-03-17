"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  MessageSquareText,
  Plus,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { sendMessageToAPI, ChatMessage as ApiMessage } from "../services/api";
import "katex/dist/katex.min.css";
import { InlineMath, BlockMath } from "react-katex";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface SideChatbotProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  subject: string;
  assignmentType: string;
  diagnosisLabel: string | null;
  firstAction: string | null;
  onOpenDiagnosisTab: () => void;
  onOpenPlanTab: () => void;
}

function buildAssistantReply(
  message: string,
  diagnosisLabel: string | null,
  firstAction: string | null,
  subject: string,
  assignmentType: string,
): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("next step") || normalized.includes("what do i do")) {
    if (firstAction) {
      return `Use this tiny next step: ${firstAction}`;
    }
    return "I can help after you run diagnosis. Open Diagnosis tab and answer the 5 questions.";
  }

  if (normalized.includes("diagnosis") || normalized.includes("stuck type")) {
    if (diagnosisLabel) {
      return `Current diagnosis is ${diagnosisLabel}. If it feels off, re-run the diagnosis flow.`;
    }
    return "No diagnosis yet. Open Diagnosis tab and start with I'M STUCK.";
  }

  if (normalized.includes("context") || normalized.includes("subject")) {
    const safeSubject = subject.trim() || "Unknown Subject";
    const safeAssignment = assignmentType.trim() || "Unknown Assignment";
    return `Current context: ${safeSubject} - ${safeAssignment}. Update it in the Context tab for better interventions.`;
  }

  return "I can help you use this app: set context, run diagnosis, then execute the first intervention step without overthinking.";
}

export default function SideChatbot({
  isOpen,
  onOpen,
  onClose,
  subject,
  assignmentType,
  diagnosisLabel,
  firstAction,
  onOpenDiagnosisTab,
  onOpenPlanTab,
}: SideChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I am your integrated Stuck assistant. Ask me for next steps, diagnosis help, or context checks.",
      createdAt: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to render LaTeX content
  const renderContent = (content: string) => {
    // Split content by $$ for block math and $ for inline math
    const parts = content.split(/(\$\$.*?\$\$|\$.*?\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        const math = part.slice(2, -2);
        return <BlockMath key={index} math={math} errorColor={"#ff6b6b"} />;
      } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        // Inline math
        const math = part.slice(1, -1);
        return <InlineMath key={index} math={math} errorColor={"#ff6b6b"} />;
      } else {
        // Regular text
        return <span key={index}>{part}</span>;
      }
    });
  };

  useEffect(() => {
    if (!scrollContainerRef.current) {
      return;
    }

    scrollContainerRef.current.scrollTop =
      scrollContainerRef.current.scrollHeight;
  }, [messages, isTyping]);

  async function sendMessage(rawMessage?: string): Promise<void> {
    const content = (rawMessage ?? input).trim();
    if (!content) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content,
      createdAt: new Date(),
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      // Convert messages to API format
      const apiMessages: ApiMessage[] = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));
      apiMessages.push({
        role: 'user',
        content
      });

      // Add system context about the app
      const systemMessage: ApiMessage = {
        role: 'system',
        content: `You are an assistant for an app called "AFG-26" that helps students overcome academic stuckness. Current context: Subject: ${subject}, Assignment: ${assignmentType}, Diagnosis: ${diagnosisLabel || 'None'}, First Action: ${firstAction || 'None'}. Help students with next steps, diagnosis guidance, and context checks. Be concise and actionable. IMPORTANT: Format all mathematical expressions, equations, formulas, and scientific notation using LaTeX format. Use $ for inline math and $$ for display math. For example: $x^2 + 2x + 1 = 0$ or $$\\int_{0}^{\\infty} e^{-x} dx = 1$$`
      };
      
      const messagesWithSystem = [systemMessage, ...apiMessages];

      // Call the API
      const aiResponse = await sendMessageToAPI(messagesWithSystem);

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: aiResponse,
        createdAt: new Date(),
      };
      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to the original rule-based response if API fails
      const reply = buildAssistantReply(
        content,
        diagnosisLabel,
        firstAction,
        subject,
        assignmentType,
      );

      const fallbackMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: reply,
        createdAt: new Date(),
      };
      setMessages((previous) => [...previous, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  function resetChat(): void {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "New chat started. Ask for diagnosis guidance, next steps, or context checks.",
        createdAt: new Date(),
      },
    ]);
    setInput("");
    setIsTyping(false);
  }

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="fixed right-0 top-1/2 z-50 -translate-y-1/2 rounded-l-xl border border-r-0 border-slate-600 bg-slate-900 px-3 py-4 text-sm text-cyan-200 shadow-xl hover:border-cyan-400"
        >
          <span className="flex items-center gap-2">
            <MessageSquareText size={16} />
            Chatbot
          </span>
        </button>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[430px] flex-col border-l border-slate-700 bg-slate-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-slate-800 p-2">
                <Sparkles size={16} className="text-cyan-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Mobile Chatbot
                </p>
                <p className="text-xs text-slate-400">
                  Integrated from mobile design
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                className="rounded-md border border-slate-700 p-2 text-slate-300 hover:border-slate-500"
                aria-label="New chat"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-700 p-2 text-slate-300 hover:border-slate-500"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="border-b border-slate-800 bg-slate-900/60 px-3 py-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  sendMessage("What is my diagnosis?");
                  onOpenPlanTab();
                }}
                className="rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:border-cyan-400"
              >
                What is my diagnosis?
              </button>
              <button
                type="button"
                onClick={() => {
                  sendMessage("What is my next step?");
                  onOpenPlanTab();
                }}
                className="rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:border-cyan-400"
              >
                Give me the next step
              </button>
              <button
                type="button"
                onClick={() => {
                  setMessages((previous) => [
                    ...previous,
                    {
                      id: `${Date.now()}-assistant`,
                      role: "assistant",
                      content:
                        "Opening Diagnosis tab now. Answer each question quickly.",
                      createdAt: new Date(),
                    },
                  ]);
                  onOpenDiagnosisTab();
                }}
                className="rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:border-cyan-400"
              >
                Start diagnosis flow
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex-1 space-y-4 overflow-y-auto px-3 py-4"
          >
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser ? (
                    <div className="mt-1 rounded-full bg-emerald-600 p-1.5 text-white">
                      <Bot size={14} />
                    </div>
                  ) : null}

                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      isUser
                        ? "rounded-tr-sm bg-blue-600 text-white"
                        : "rounded-tl-sm bg-slate-800 text-slate-100"
                    }`}
                  >
                    <div className="prose prose-invert max-w-none">
                      {isUser ? (
                        <p>{message.content}</p>
                      ) : (
                        <div>{renderContent(message.content)}</div>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] opacity-70">
                      {message.createdAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  {isUser ? (
                    <div className="mt-1 rounded-full bg-blue-600 p-1.5 text-white">
                      <User size={14} />
                    </div>
                  ) : null}
                </div>
              );
            })}

            {isTyping ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                Assistant is typing...
              </div>
            ) : null}
          </div>

          <div className="border-t border-slate-800 bg-slate-900 px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Message chatbot..."
                className="max-h-28 min-h-[42px] flex-1 resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-300 focus:ring"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="rounded-lg bg-cyan-500 p-2.5 text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
