"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircle,
  X,
  Send,
  SparklesIcon,
  Maximize2Icon,
  User,
  Bot,
} from "lucide-react";
import { chatApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatMessage } from "@/lib/chatUtils";
import clsx from "clsx";

interface Message {
  role: "user" | "assistant";
  content: string;
  showCourses?: boolean;
  showJobs?: boolean;
  jobs?: any[];
  courses?: any[];
}

interface ChatWidgetProps {
  hideFab?: boolean;
}

export default function ChatWidget({ hideFab = false }: ChatWidgetProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your Career Coach. Ask about careers, CVs, courses, or jobs." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const lastMsgRef = useRef<HTMLDivElement>(null);
  const prevLen = useRef(1);
  const restored = useRef(false);

  // Restore — load persisted backend history (session-scoped)
  useEffect(() => {
    let cancelled = false;
    import("@/lib/api").then(({ chatHistoryApi }) => {
      chatHistoryApi.get().then((res) => {
        if (cancelled) return;
        const msgs = res.data.messages || [];
        if (msgs.length > 0) {
          setMessages(msgs);
          prevLen.current = msgs.length;
        }
        restored.current = true;
      }).catch(() => { restored.current = true; });
    }).catch(() => { restored.current = true; });
    return () => { cancelled = true; };
  }, []);

  // Scroll to top of last new message
  useEffect(() => {
    if (messages.length > prevLen.current) {
      prevLen.current = messages.length;
      setTimeout(() => {
        lastMsgRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [messages.length]);

  if (!user || hideFab) return null;

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
      const res = await chatApi.sendMessage(msg, history);
      setMessages([...newMessages, {
        role: "assistant",
        content: res.data.reply,
        showCourses: res.data.show_courses,
        showJobs: res.data.show_jobs,
        courses: res.data.courses || [],
        jobs: res.data.jobs || [],
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      const isJobQuery = /job|internship|position|work|career opportunit|show.*job/i.test(msg);
      const isCourseQuery = /course|learn|skill|training|education|show.*course/i.test(msg);
      let fallbackContent = "I'd be happy to help with that!";
      let showJobs = false, showCourses = false;
      if (isJobQuery) { fallbackContent = "Here are some relevant job opportunities I found:"; showJobs = true; }
      else if (isCourseQuery) { fallbackContent = "I've found some great learning opportunities:"; showCourses = true; }
      setMessages([...newMessages, { role: "assistant", content: fallbackContent, showJobs, showCourses, jobs: showJobs ? [] : undefined, courses: showCourses ? [] : undefined }]);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setMessages([{ role: "assistant", content: "Hi! I'm your Career Coach. Ask about careers, CVs, courses, or jobs." }]);
    setInput("");
    prevLen.current = 1;
    import("@/lib/api").then(({ chatHistoryApi }) => chatHistoryApi.clear().catch(() => {})).catch(() => {});
  };

  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-50">
      {/* Chat panel */}
      {open && (
        <div className="mb-4 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[70vh] bg-white border border-line/60 shadow-xl flex flex-col overflow-hidden rounded-xl">
          {/* Header */}
          <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <SparklesIcon className="w-4 h-4 text-white/90" />
              <span className="text-sm font-medium text-white">Career Coach</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Link href="/chat" className="text-white/70 hover:text-white p-1.5 transition-colors" aria-label="Full screen">
                <Maximize2Icon className="w-3.5 h-3.5" />
              </Link>
              <button type="button" onClick={startNewChat} className="text-white/70 hover:text-white p-1.5 transition-colors" aria-label="New chat">
                <MessageCircle className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => setOpen(false)} className="text-white/70 hover:text-white p-1.5 transition-colors" aria-label="Close">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-paper">
            {messages.map((msg, i) => {
              const isLastNew = i === messages.length - 1 && i >= prevLen.current - 1;
              return (
                <div key={i} ref={isLastNew ? lastMsgRef : undefined}>
                  <div className={clsx("flex gap-2 items-start", msg.role === "user" && "flex-row-reverse")}>
                    <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5", msg.role === "assistant" ? "bg-primary" : "bg-primary/10")}>
                      {msg.role === "assistant" ? <Bot className="w-3 h-3 text-white" /> : <User className="w-3 h-3 text-primary" />}
                    </div>
                    <div className={clsx(
                      "text-xs leading-relaxed px-3 py-2 max-w-[85%]",
                      msg.role === "assistant"
                        ? "bg-white border border-line/50 text-ink rounded-xl rounded-tl-sm shadow-sm"
                        : "bg-primary text-white rounded-xl rounded-tr-sm"
                    )}>
                      {msg.role === "assistant" ? (
                        <div className="chat-content" dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                  </div>
                  {msg.showJobs && msg.jobs && msg.jobs.length > 0 && (
                    <div className="mt-2 ml-8 space-y-1.5">
                      {msg.jobs.slice(0, 2).map((job: any) => (
                        <div key={job.id} className="bg-white border border-line/50 px-3 py-2 text-xs">
                          <p className="font-medium text-primary-dark">{job.title}</p>
                          <p className="text-ink/50 mt-0.5">{job.company}{job.location ? ` · ${job.location}` : ""}</p>
                          {job.application_url && job.application_url !== "#" && (
                            <a href={job.application_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 font-mono text-[9px] tracking-[0.05em] uppercase text-primary hover:text-primary-d">Apply</a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.showCourses && msg.courses && msg.courses.length > 0 && (
                    <div className="mt-2 ml-8 space-y-1.5">
                      {msg.courses.slice(0, 2).map((course: any) => (
                        <div key={course.id} className="bg-white border border-line/50 px-3 py-2 text-xs">
                          <p className="font-medium text-primary-dark">{course.title}</p>
                          <p className="text-ink/50 mt-0.5">{course.provider} · {course.duration}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {loading && (
              <div className="flex gap-2 items-start">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-white border border-line/50 px-3 py-2.5 rounded-xl rounded-tl-sm shadow-sm">
                  <div className="flex gap-1.5">
                    {[0, 200, 400].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-line/50 bg-white">
            <div className="flex items-center gap-2 bg-paper border border-line/60 rounded-lg px-3 py-1.5 focus-within:border-primary/50 transition-colors">
              <input
                type="text"
                className="flex-1 bg-transparent text-xs py-1.5 focus:outline-none placeholder:text-ink/40 text-ink"
                placeholder="Ask a career question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                disabled={loading}
              />
              <button
                type="button"
                onClick={send}
                disabled={loading || !input.trim()}
                className="w-7 h-7 bg-primary hover:bg-primary-d text-white rounded-md disabled:opacity-40 transition-colors flex items-center justify-center shrink-0"
                aria-label="Send"
              >
                <Send className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-primary hover:bg-primary-d text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        aria-label="Toggle chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
}
