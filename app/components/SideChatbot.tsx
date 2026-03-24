"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

interface ChatTab {
  id: string;
  title: string;
  messages: ChatMessage[];
  input: string;
  isTyping: boolean;
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

const DEFAULT_CHAT_MESSAGE =
  "Hello! I am your integrated Stuck assistant. Ask me for next steps, diagnosis help, or context checks.";
const NEW_TAB_MESSAGE =
  "New chat tab started. Ask for diagnosis guidance, next steps, or context checks.";

function createUniqueId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function createChatMessage(
  role: ChatMessage["role"],
  content: string,
): ChatMessage {
  return {
    id: createUniqueId(role),
    role,
    content,
    createdAt: new Date(),
  };
}

function createChatTab(title: string, firstMessage: string): ChatTab {
  return {
    id: createUniqueId("tab"),
    title,
    messages: [createChatMessage("assistant", firstMessage)],
    input: "",
    isTyping: false,
  };
}

function renumberChatTabs(tabs: ChatTab[]): ChatTab[] {
  return tabs.map((tab, index) => ({
    ...tab,
    title: `Chat ${index + 1}`,
  }));
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
  const initialTab = useMemo(
    () => createChatTab("Chat 1", DEFAULT_CHAT_MESSAGE),
    [],
  );
  const [chatTabs, setChatTabs] = useState<ChatTab[]>([initialTab]);
  const [activeTabId, setActiveTabId] = useState<string>(initialTab.id);
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
    if (!isOpen) {
      return;
    }

    scrollContainerRef.current.scrollTop =
      scrollContainerRef.current.scrollHeight;
  }, [activeTab?.messages.length, activeTab?.isTyping, isOpen, activeTabId]);

  function addChatTab(): void {
    const newTab = createChatTab(`Chat ${chatTabs.length + 1}`, NEW_TAB_MESSAGE);
    setChatTabs((previous) => [...previous, newTab]);
    setActiveTabId(newTab.id);
  }

  function deleteChatTab(tabId: string): void {
    if (chatTabs.length <= 1) {
      return;
    }

    const tabIndex = chatTabs.findIndex((tab) => tab.id === tabId);
    if (tabIndex === -1) {
      return;
    }

    const remainingTabs = chatTabs.filter((tab) => tab.id !== tabId);
    const renumberedTabs = renumberChatTabs(remainingTabs);
    setChatTabs(renumberedTabs);

    if (activeTabId === tabId) {
      const nextIndex = Math.min(tabIndex, renumberedTabs.length - 1);
      const nextTab = renumberedTabs[nextIndex] ?? renumberedTabs[0];
      if (nextTab) {
        setActiveTabId(nextTab.id);
      }
    }
  }

  function updateActiveTabInput(value: string): void {
    if (!activeTab) {
      return;
    }
    const targetTabId = activeTab.id;
    setChatTabs((previous) =>
      previous.map((tab) =>
        tab.id === targetTabId
          ? {
              ...tab,
              input: value,
            }
          : tab,
      ),
    );
  }

  function appendAssistantMessage(content: string): void {
    if (!activeTab) {
      return;
    }

    const targetTabId = activeTab.id;
    const assistantMessage = createChatMessage("assistant", content);
    setChatTabs((previous) =>
      previous.map((tab) =>
        tab.id === targetTabId
          ? {
              ...tab,
              messages: [...tab.messages, assistantMessage],
            }
          : tab,
      ),
    );
  }

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

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="fixed right-0 top-1/2 z-50 -translate-y-1/2 rounded-l-xl border border-r-0 border-emerald-700 bg-emerald-900 px-3 py-4 text-sm text-lime-100 shadow-xl hover:border-lime-300"
        >
          <span className="flex items-center gap-2">
            <MessageSquareText size={16} />
            Chatbot
          </span>
        </button>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[430px] flex-col border-l border-emerald-800 bg-emerald-950 shadow-2xl">
          <div className="flex items-center justify-between border-b border-emerald-900 bg-emerald-900 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-900 p-2">
                <Sparkles size={16} className="text-lime-200" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-50">
                  Mobile Chatbot
                </p>
                <p className="text-xs text-emerald-300">
                  Integrated from mobile design
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={addChatTab}
                className="rounded-md border border-emerald-800 p-2 text-emerald-200 hover:border-lime-500"
                aria-label="New chat tab"
              >
                <Plus size={16} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-emerald-800 p-2 text-emerald-200 hover:border-lime-500"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="border-b border-emerald-900 bg-emerald-900/70 px-3 py-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              {chatTabs.map((tab) => {
                const selected = tab.id === activeTabId;
                const canDelete = chatTabs.length > 1;
                return (
                  <div
                    key={tab.id}
                    className={`shrink-0 flex items-center rounded-md border text-xs transition ${
                      selected
                        ? "border-lime-300 bg-lime-300/20 text-lime-100"
                        : "border-emerald-800 text-emerald-200 hover:border-lime-500"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTabId(tab.id)}
                      className="px-3 py-1"
                    >
                      {tab.title}
                    </button>
                    {canDelete ? (
                      <button
                        type="button"
                        onClick={() => deleteChatTab(tab.id)}
                        className="pr-2 text-emerald-300 hover:text-lime-100"
                        aria-label={`Delete ${tab.title}`}
                      >
                        <X size={12} />
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-b border-emerald-900 bg-emerald-950/60 px-3 py-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  sendMessage("What is my diagnosis?");
                  onOpenPlanTab();
                }}
                className="rounded-md border border-emerald-800 px-2.5 py-1.5 text-xs text-emerald-100 hover:border-lime-300"
              >
                What is my diagnosis?
              </button>
              <button
                type="button"
                onClick={() => {
                  sendMessage("What is my next step?");
                  onOpenPlanTab();
                }}
                className="rounded-md border border-emerald-800 px-2.5 py-1.5 text-xs text-emerald-100 hover:border-lime-300"
              >
                Give me the next step
              </button>
              <button
                type="button"
                onClick={() => {
                  appendAssistantMessage(
                    "Opening Diagnosis tab now. Answer each question quickly.",
                  );
                  onOpenDiagnosisTab();
                }}
                className="rounded-md border border-emerald-800 px-2.5 py-1.5 text-xs text-emerald-100 hover:border-lime-300"
              >
                Start diagnosis flow
              </button>
            </div>
          </div>

          <div
            ref={scrollContainerRef}
            className="flex-1 space-y-4 overflow-y-auto px-3 py-4"
          >
            {(activeTab?.messages ?? []).map((message) => {
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
                        ? "rounded-tr-sm bg-emerald-600 text-white"
                        : "rounded-tl-sm bg-emerald-900 text-emerald-50"
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
                    <div className="mt-1 rounded-full bg-emerald-600 p-1.5 text-white">
                      <User size={14} />
                    </div>
                  ) : null}
                </div>
              );
            })}

            {activeTab?.isTyping ? (
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Assistant is typing...
              </div>
            ) : null}
          </div>

          <div className="border-t border-emerald-900 bg-emerald-900 px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                value={activeTab?.input ?? ""}
                onChange={(event) => updateActiveTabInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Message chatbot..."
                className="max-h-28 min-h-[42px] flex-1 resize-none rounded-lg border border-emerald-800 bg-emerald-950 px-3 py-2 text-sm text-emerald-50 outline-none ring-lime-300 focus:ring"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!activeTab || !activeTab.input.trim()}
                className="rounded-lg bg-lime-400 p-2.5 text-emerald-950 hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50"
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
