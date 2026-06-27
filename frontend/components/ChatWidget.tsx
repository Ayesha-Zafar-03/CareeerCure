"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MessageCircleIcon,
  XIcon,
  SendIcon,
  SparklesIcon,
  PaperclipIcon,
  Maximize2Icon,
} from "lucide-react";
import { chatApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MOCK_COURSES } from "@/lib/mockData";
import clsx from "clsx";

interface Message {
  role: "user" | "assistant";
  content: string;
  showCourses?: boolean;
}

interface ChatWidgetProps {
  hideFab?: boolean;
}

export default function ChatWidget({ hideFab = false }: ChatWidgetProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your Career Coach. Ask about careers, CVs, courses, or jobs 👋",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  if (!user || hideFab) return null;

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const showCourses =
      msg.toLowerCase().includes("course") || msg.toLowerCase().includes("learn");

    try {
      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await chatApi.sendMessage(msg, history);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: res.data.reply,
          showCourses,
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: showCourses
            ? "Here are some courses I'd recommend for your career path!"
            : "I'd love to help! For detailed guidance, try the full Career Coach experience.",
          showCourses,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div
          className="mb-4 w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: "480px" }}
        >
          <div className="bg-gradient-to-r from-primary-600 to-accent-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <SparklesIcon className="w-5 h-5" />
              <span className="font-semibold text-sm">Career Coach AI</span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/chat"
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Open full chat"
              >
                <Maximize2Icon className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-primary-50/30">
            {messages.map((msg, i) => (
              <div key={i}>
                <div
                  className={clsx(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={clsx(
                      "max-w-[88%] px-3 py-2 rounded-xl text-xs leading-relaxed",
                      msg.role === "assistant"
                        ? "bg-white border border-gray-100 text-gray-800 shadow-sm"
                        : "bg-primary-600 text-white"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
                {msg.showCourses && (
                  <div className="mt-2 space-y-2">
                    {MOCK_COURSES.slice(0, 2).map((course) => (
                      <div
                        key={course.id}
                        className="bg-white rounded-lg border border-gray-100 p-2.5 text-xs"
                      >
                        <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                        <p className="text-gray-500">
                          {course.provider} · {course.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 px-3 py-2 rounded-xl shadow-sm">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((d) => (
                      <span
                        key={d}
                        className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-100 bg-white flex gap-2 items-center">
            <button
              type="button"
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              aria-label="Attach file"
            >
              <PaperclipIcon className="w-3.5 h-3.5" />
            </button>
            <input
              type="text"
              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
              aria-label="Send"
            >
              <SendIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600 text-white rounded-full shadow-lg shadow-primary-200 flex items-center justify-center transition-all hover:scale-105"
        aria-label="Toggle chat"
      >
        {open ? <XIcon className="w-6 h-6" /> : <MessageCircleIcon className="w-6 h-6" />}
      </button>
    </div>
  );
}
