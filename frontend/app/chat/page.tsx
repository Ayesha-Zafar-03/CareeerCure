"use client";
import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { chatApi } from "@/lib/api";
import { SendIcon, BotIcon, UserIcon } from "lucide-react";
import clsx from "clsx";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do I write a strong CV?",
  "What skills should I learn for data science?",
  "How do I prepare for a technical interview?",
  "How do I get my first internship?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm CareerCure AI, your personal career counselor. Ask me anything about careers, CVs, interviews, or skill development. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const history = newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
      const res = await chatApi.sendMessage(msg, history);
      setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Career Counselor</h1>
        <p className="text-gray-500 text-sm mb-4">Powered by Groq LLaMA3 + RAG knowledge base</p>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={clsx("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                msg.role === "assistant" ? "bg-primary-100 text-primary-600" : "bg-gray-200 text-gray-600"
              )}>
                {msg.role === "assistant" ? <BotIcon className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
              </div>
              <div className={clsx(
                "max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === "assistant"
                  ? "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                  : "bg-primary-600 text-white rounded-tr-sm"
              )}>
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                <BotIcon className="w-4 h-4" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => sendMessage(s)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors">
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            className="input flex-1"
            placeholder="Ask about careers, CVs, interviews..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="btn-primary px-4 py-2.5"
            aria-label="Send message"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
