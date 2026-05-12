"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircleIcon, XIcon, SendIcon } from "lucide-react";
import { chatApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";

interface Message {
  role: "user" | "assistant";
  content: string;
  time: string;
}

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const QUICK = ["Help with my CV", "Interview tips", "Best skills to learn", "How to find internships"];

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! What can I help you with today?", time: now() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, open]);

  if (!user) return null;

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    const newMessages: Message[] = [...messages, { role: "user", content: msg, time: now() }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const history = newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content }));
      const res = await chatApi.sendMessage(msg, history);
      setMessages([...newMessages, { role: "assistant", content: res.data.reply, time: now() }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong, try again.", time: now() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat window */}
      {open && (
        <div className="mb-3 w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: "480px" }}>

          {/* Header */}
          <div className="px-4 py-3 bg-gray-900 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">C</div>
              <div>
                <p className="text-white text-sm font-semibold leading-none">Career Assistant</p>
                <p className="text-gray-400 text-xs mt-0.5">Always here to help</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={clsx("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}>
                <div className={clsx(
                  "max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100"
                    : "bg-gray-900 text-white rounded-tr-sm"
                )}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-start">
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          {messages.length === 1 && (
            <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-1.5 flex-shrink-0">
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-xs bg-white border border-gray-200 hover:border-primary-400 hover:text-primary-600 text-gray-600 px-2.5 py-1 rounded-full transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              disabled={loading}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              className="w-9 h-9 bg-gray-900 hover:bg-gray-700 text-white rounded-xl flex items-center justify-center disabled:opacity-40 transition-colors flex-shrink-0"
              aria-label="Send">
              <SendIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={clsx(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200",
          open ? "bg-gray-900 hover:bg-gray-700" : "bg-gray-900 hover:bg-gray-700"
        )}
        aria-label="Toggle chat"
      >
        {open
          ? <XIcon className="w-5 h-5 text-white" />
          : <MessageCircleIcon className="w-6 h-6 text-white" />}
      </button>
    </div>
  );
}
