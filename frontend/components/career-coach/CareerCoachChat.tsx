"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Send,
  Plus,
  FileTextIcon,
  BriefcaseIcon,
  BookOpenIcon,
  MapIcon,
  LayoutDashboardIcon,
  SparklesIcon,
  ArrowRight,
  Trash2,
  ExternalLink,
  User,
  Bot,
  MenuIcon,
  XIcon,
} from "lucide-react";
import clsx from "clsx";
import { chatApi, chatHistoryApi } from "@/lib/api";
import CourseCard from "@/components/courses/CourseCard";
import { formatMessage } from "@/lib/chatUtils";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  actions?: string[];
  showCourses?: boolean;
  showJobs?: boolean;
  jobs?: any[];
  courses?: any[];
}

interface ConversationSummary {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_CONV_ID = "default";

const QUICK_ACTIONS = [
  { label: "Career guidance", detail: "Find a path that fits your skills", icon: MapIcon, prompt: "What career path fits my skills?" },
  { label: "CV feedback", detail: "Get line-by-line notes on your resume", icon: FileTextIcon, prompt: "How can I improve my CV for tech roles?" },
  { label: "Find courses", detail: "Close specific skill gaps", icon: BookOpenIcon, prompt: "Recommend courses for my career goal" },
  { label: "Job matches", detail: "See roles worth applying to now", icon: BriefcaseIcon, prompt: "What jobs match my profile best?" },
];

const NAV_RAIL = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/cv", label: "CV", icon: FileTextIcon },
  { href: "/internships", label: "Jobs", icon: BriefcaseIcon },
  { href: "/courses", label: "Courses", icon: BookOpenIcon },
  { href: "/roadmap", label: "Roadmap", icon: MapIcon },
  { href: "/applied", label: "Applied", icon: FileTextIcon },
  { href: "/chat", label: "Coach", icon: SparklesIcon },
];

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hi, I'm your career coach. Ask me about your next role, your CV, or a skill you want to build — I'll work from what's on your profile.",
  actions: ["Show jobs", "Find courses"],
};

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}

function groupLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const day = 86400000;
  if (diff < day) return "Today";
  if (diff < 2 * day) return "Yesterday";
  if (diff < 7 * day) return "This week";
  return "Earlier";
}

interface CareerCoachChatProps {
  compact?: boolean;
  initialQuery?: string;
}

export default function CareerCoachChat({ compact = false, initialQuery }: CareerCoachChatProps) {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") || initialQuery;

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const lastMsgRef = useRef<HTMLDivElement>(null);
  const prevMsgLen = useRef(1);
  const initialSent = useRef(false);
  const restored = useRef(false);

  // Restore on mount — load conversations from the backend session
  useEffect(() => {
    chatHistoryApi.listConversations().then((res) => {
      const backend = (res.data.conversations || []) as { conversation_id: string; message_count: number; title?: string; updated_at?: string | null }[];
      const merged: ConversationSummary[] = backend
        .filter((c) => c.conversation_id !== DEFAULT_CONV_ID)
        .map((c) => {
          const when = c.updated_at || new Date().toISOString();
          return {
            id: c.conversation_id,
            title: truncate(c.title || c.conversation_id, 50),
            preview: "",
            createdAt: when,
            updatedAt: when,
          };
        });
      setConversations(merged);
    }).catch(() => {});
    restored.current = true;
  }, []);

  // Scroll to top of new message
  useEffect(() => {
    if (messages.length > prevMsgLen.current) {
      prevMsgLen.current = messages.length;
      setTimeout(() => {
        lastMsgRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [messages.length]);

  useEffect(() => {
    if (queryFromUrl && !initialSent.current) {
      initialSent.current = true;
      sendMessage(queryFromUrl);
    }
  }, [queryFromUrl]);

  const updateSidebarPreview = useCallback((convId: string, msgs: ChatMessage[]) => {
    setConversations((prev) => {
      const preview = truncate(msgs.filter((m) => m.role === "assistant").pop()?.content ?? "", 80);
      const exists = prev.some((c) => c.id === convId);
      const entry: ConversationSummary = exists
        ? prev.find((c) => c.id === convId)!
        : { id: convId, title: truncate(convId, 50), preview: "", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      const updated = { ...entry, preview, updatedAt: new Date().toISOString() };
      return exists ? prev.map((c) => (c.id === convId ? updated : c)) : [updated, ...prev];
    });
  }, []);

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = (text || input).trim();
      if (!msg || loading) return;

      let convId = activeId;

      // Create new conversation on first message if none active
      if (!convId) {
        convId = genId();
        const now = new Date().toISOString();
        const entry: ConversationSummary = {
          id: convId,
          title: truncate(msg, 50),
          preview: "",
          createdAt: now,
          updatedAt: now,
        };
        setConversations((prev) => [entry, ...prev]);
        setActiveId(convId);
      }

      const userMsg: ChatMessage = { role: "user", content: msg };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        const history = newMessages.slice(0, -1).filter((m) => m.role === "user" || m.role === "assistant").map((m) => ({ role: m.role, content: m.content }));
        const res = await chatApi.sendMessage(msg, history, convId || undefined);
        const replyMsg: ChatMessage = {
          role: "assistant",
          content: res.data.reply,
          showCourses: res.data.show_courses,
          showJobs: res.data.show_jobs,
          courses: res.data.courses || [],
          jobs: res.data.jobs || [],
        };
        const allMsgs: ChatMessage[] = [...newMessages, replyMsg];
        setMessages(allMsgs);
        if (convId) updateSidebarPreview(convId, allMsgs);
      } catch (error) {
        console.error("Chat error:", error);
        const isJobQuery = /job|internship|position|work|career opportunit/i.test(msg);
        const isCourseQuery = /course|learn|skill|training|education/i.test(msg);
        let fallbackContent = "I'd be happy to help with that!";
        let showJobs = false, showCourses = false;
        if (isJobQuery) { fallbackContent = "Here are some relevant job opportunities I found for you:"; showJobs = true; }
        else if (isCourseQuery) { fallbackContent = "I've found some great learning opportunities for you:"; showCourses = true; }
        const fallbackMsg: ChatMessage = { role: "assistant", content: fallbackContent, showJobs, showCourses, jobs: showJobs ? [] : undefined, courses: showCourses ? [] : undefined };
        const allMsgs: ChatMessage[] = [...newMessages, fallbackMsg];
        setMessages(allMsgs);
        if (convId) updateSidebarPreview(convId, allMsgs);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, activeId, updateSidebarPreview]
  );

  const switchConversation = (id: string) => {
    setActiveId(id);
    setInput("");
    setSidebarOpen(false);
    chatHistoryApi.get(id).then((res) => {
      const msgs = res.data.messages || [];
      if (msgs.length > 0) {
        setMessages(msgs as ChatMessage[]);
        prevMsgLen.current = msgs.length;
      } else {
        setMessages([WELCOME_MESSAGE]);
        prevMsgLen.current = 1;
      }
    }).catch(() => {
      setMessages([WELCOME_MESSAGE]);
      prevMsgLen.current = 1;
    });
  };

  const startNewChat = () => {
    setActiveId(null);
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setSidebarOpen(false);
    prevMsgLen.current = 1;
  };

  const deleteConversation = (id: string) => {
    chatHistoryApi.clear(id).catch(() => {});
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([WELCOME_MESSAGE]);
      setInput("");
      prevMsgLen.current = 1;
    }
  };

  const handleActionClick = (action: string) => {
    if (action === "Show jobs") sendMessage("Show me job opportunities that match my profile");
    else if (action === "Find courses") sendMessage("Recommend courses for my career development");
  };

  // Group conversations by date
  const grouped = conversations.reduce<Record<string, ConversationSummary[]>>((acc, c) => {
    const g = groupLabel(c.updatedAt);
    if (!acc[g]) acc[g] = [];
    acc[g].push(c);
    return acc;
  }, {});

  const showWelcome = messages.length === 1 && messages[0].role === "assistant";

  if (compact) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} small onActionClick={handleActionClick} />
          ))}
          {loading && <TypingIndicator small />}
          <div ref={lastMsgRef} />
        </div>
        <ChatInput input={input} setInput={setInput} onSend={() => sendMessage()} loading={loading} small />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-paper">
      {/* Nav rail */}
      <aside className="hidden lg:flex flex-col w-16 bg-surface border-r border-line py-4 items-center gap-1 shrink-0">
        {NAV_RAIL.map((item) => (
          <Link key={item.href} href={item.href} className={clsx("relative w-full flex justify-center py-2.5 transition-colors", item.href === "/chat" ? "text-primary" : "text-ink/50 hover:text-ink/60")} title={item.label}>
            {item.href === "/chat" && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-primary" />}
            <item.icon className="w-5 h-5" />
          </Link>
        ))}
      </aside>

      {/* Mobile drawer backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 top-16 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Conversations sidebar (static on md+, slide-in drawer on mobile) */}
      <aside
        className={clsx(
          "flex flex-col w-72 max-w-[85vw] bg-surface border-r border-line shrink-0",
          "md:static md:translate-x-0 md:z-auto",
          "fixed inset-y-0 top-16 left-0 z-40 transition-transform duration-200 md:transition-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 border-b border-line/50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-2 -ml-1 text-ink/50 hover:text-ink"
            aria-label="Close conversations"
          >
            <XIcon className="w-5 h-5" />
          </button>
          <button type="button" onClick={startNewChat} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-d text-white font-mono text-[11px] tracking-[0.1em] uppercase py-2.5 px-4 transition-colors">
            <Plus className="w-4 h-4" />
            New conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {conversations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-xs text-ink/40">No conversations yet.</p>
            </div>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/45 px-2 mb-2">{group}</p>
              <div className="space-y-0.5">
                {items.map((c) => (
                  <div key={c.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => switchConversation(c.id)}
                      className={clsx(
                        "w-full text-left px-3 py-3 border-l-2 transition-colors pr-10",
                        activeId === c.id
                          ? "border-primary bg-primary/5 text-primary-dark"
                          : "border-transparent hover:bg-primary/5 text-ink"
                      )}
                    >
                      <p className="font-medium text-sm text-primary-dark truncate">{c.title}</p>
                      <p className="text-xs text-ink/50 truncate mt-0.5">{c.preview || "No messages yet"}</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteConversation(c.id)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-ink/30 hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main chat */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-2 border-b border-line/60 bg-surface px-4 py-2.5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-ink/60 hover:text-ink"
            aria-label="Open conversations"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <span className="font-serif text-lg text-primary-dark">Career Coach</span>
          <button
            type="button"
            onClick={startNewChat}
            className="ml-auto p-2 -mr-2 text-primary hover:text-primary-d"
            aria-label="New conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-4">
            {showWelcome && (
              <>
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-line/40">
                  <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shrink-0">
                    <SparklesIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-primary-dark">Your career coach</h2>
                    <p className="text-sm text-ink/50 mt-0.5">Ask about your next role, your CV, or a skill worth building next.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => sendMessage(action.prompt)}
                      className="flex items-start gap-3 bg-surface border border-line/60 hover:border-primary/50 hover:shadow-sm px-4 py-3.5 text-left transition-all group"
                    >
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <action.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-primary-dark">{action.label}</p>
                        <p className="text-xs text-ink/50 mt-0.5">{action.detail}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-ink/20 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {messages.map((msg, i) => {
              const isLastNew = i === messages.length - 1 && i >= prevMsgLen.current - 1;
              return (
                <div key={i} ref={isLastNew ? lastMsgRef : undefined} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}>
                  <MessageBubble message={msg} onActionClick={handleActionClick} />
                  {msg.showJobs && (
                    <div className="mt-3 ml-14">
                      {msg.jobs && msg.jobs.length > 0 ? (
                        <>
                          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/50 mb-3">Recommended Jobs</p>
                          <div className="grid grid-cols-1 gap-3">
                            {msg.jobs.slice(0, 3).map((job: any) => (
                              <div key={job.id} className="bg-surface border border-line/60 px-4 py-3.5">
                                <div className="flex justify-between items-start mb-1.5">
                                  <div>
                                    <p className="font-medium text-primary-dark">{job.title}</p>
                                    {job.company && <p className="text-sm text-ink/60 mt-0.5">{job.company}</p>}
                                  </div>
                                  {typeof job.match_score === "number" && (
                                    <span className="font-mono text-[10px] text-accent bg-accent/10 px-2 py-0.5 shrink-0 ml-2">{Math.round(job.match_score * 100)}%</span>
                                  )}
                                </div>
                                {job.location && <p className="text-sm text-ink/50">{job.location}{job.remote_option ? ` · ${job.remote_option}` : ""}</p>}
                                <div className="flex items-center gap-3 mt-2">
                                  {job.application_url && job.application_url !== "#" && (
                                    <a href={job.application_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.05em] uppercase px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary-d transition-colors">
                                      View on site <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 text-center">
                            <Link href="/internships" className="font-mono text-[10px] tracking-[0.05em] uppercase text-primary hover:text-primary-d transition-colors">View all opportunities →</Link>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-ink/50">No job matches right now. <Link href="/internships" className="text-primary hover:underline underline-offset-2">Browse internships →</Link></p>
                      )}
                    </div>
                  )}
                  {msg.showCourses && (
                    <div className="mt-3 ml-14">
                      {msg.courses && msg.courses.length > 0 ? (
                        <>
                          <p className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/50 mb-3">Recommended Courses</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {msg.courses.slice(0, 4).map((course: any) => (
                              <CourseCard key={course.id} course={course} />
                            ))}
                          </div>
                          <div className="mt-3 text-center">
                            <Link href="/courses" className="font-mono text-[10px] tracking-[0.05em] uppercase text-primary hover:text-primary-d transition-colors">Browse all courses →</Link>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-ink/50">No course recommendations right now. <Link href="/courses" className="text-primary hover:underline underline-offset-2">Browse courses →</Link></p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {loading && <TypingIndicator />}
          </div>
        </div>

        {/* Input bar */}
        <div className="border-t border-line/60 bg-white px-4 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 bg-surface border border-line/60 rounded-xl px-4 py-2 focus-within:border-primary focus-within:shadow-sm transition-all">
              <input
                type="text"
                className="flex-1 bg-transparent text-sm py-2 focus:outline-none placeholder:text-ink/40 text-ink"
                placeholder="Ask about careers, CVs, courses, jobs..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="flex items-center justify-center w-9 h-9 bg-primary hover:bg-primary-d text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center font-mono text-[10px] text-ink/40 mt-2">AI can make mistakes. Verify important decisions with professionals.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

function MessageBubble({ message, small, onActionClick }: { message: ChatMessage; small?: boolean; onActionClick?: (action: string) => void; }) {
  const isUser = message.role === "user";
  return (
    <div className={clsx("flex gap-3 items-start", isUser && "flex-row-reverse")}>
      <div className={clsx("shrink-0 flex items-center justify-center rounded-full", small ? "w-6 h-6" : "w-9 h-9", isUser ? "bg-primary/10" : "bg-primary")}>
        {isUser ? <User className={clsx("text-primary", small ? "w-3 h-3" : "w-4 h-4")} /> : <Bot className={clsx("text-white", small ? "w-3 h-3" : "w-4 h-4")} />}
      </div>
      <div className={clsx(isUser ? "max-w-[75%]" : "max-w-[80%]")}>
        <div className={clsx("leading-relaxed", small ? "text-xs px-3 py-2" : "text-sm px-4 py-3", isUser ? "bg-primary text-white rounded-2xl rounded-tr-md" : "bg-white border border-line/60 text-ink rounded-2xl rounded-tl-md shadow-sm")}>
          {isUser ? <p>{message.content}</p> : <div className="chat-content" dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />}
        </div>
        {message.actions && message.actions.length > 0 && !isUser && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.actions.map((action) => (
              <button key={action} type="button" onClick={() => onActionClick?.(action)} className="text-xs border border-line/60 text-ink/60 hover:border-primary hover:text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all font-medium">{action}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatInput({ input, setInput, onSend, loading, small }: { input: string; setInput: (v: string) => void; onSend: () => void; loading: boolean; small?: boolean }) {
  return (
    <div className="flex gap-2 items-center">
      <input type="text" className="flex-1 bg-transparent text-sm py-2 focus:outline-none placeholder:text-ink/40 text-ink border border-line/60 rounded-lg px-3" placeholder="Ask about careers, CVs, courses, jobs..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()} disabled={loading} />
      <button type="button" onClick={onSend} disabled={loading || !input.trim()} className="flex items-center justify-center w-9 h-9 bg-primary hover:bg-primary-d text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0" aria-label="Send">
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}

function TypingIndicator({ small }: { small?: boolean }) {
  return (
    <div className="flex gap-3 items-start">
      <div className={clsx("shrink-0 flex items-center justify-center rounded-full bg-primary", small ? "w-6 h-6" : "w-9 h-9")}>
        <Bot className={clsx("text-white", small ? "w-3 h-3" : "w-4 h-4")} />
      </div>
      <div className={clsx("bg-white border border-line/60 rounded-2xl rounded-tl-md shadow-sm px-4 py-3", small ? "text-xs" : "")}>
        <div className="flex gap-1.5">
          {[0, 200, 400].map((d) => (
            <span key={d} className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
