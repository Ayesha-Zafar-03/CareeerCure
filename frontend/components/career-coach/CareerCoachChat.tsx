"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  SendIcon,
  SparklesIcon,
  PaperclipIcon,
  BotIcon,
  UserIcon,
  PlusIcon,
  FileTextIcon,
  BriefcaseIcon,
  BookOpenIcon,
  MapIcon,
  LayoutDashboardIcon,
} from "lucide-react";
import clsx from "clsx";
import { chatApi } from "@/lib/api";
import { MOCK_CONVERSATIONS, MOCK_COURSES, type MockConversation } from "@/lib/mockData";
import CourseCard from "@/components/courses/CourseCard";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  actions?: string[];
  showCourses?: boolean;
}

const QUICK_ACTIONS = [
  { label: "Career guidance", icon: SparklesIcon, prompt: "What career path fits my skills?" },
  { label: "CV feedback", icon: FileTextIcon, prompt: "How can I improve my CV for tech roles?" },
  { label: "Find courses", icon: BookOpenIcon, prompt: "Recommend courses for my career goal" },
  { label: "Job matches", icon: BriefcaseIcon, prompt: "What jobs match my profile best?" },
];

const FEATURE_CARDS = [
  {
    title: "Personalized Roadmap",
    desc: "Get a step-by-step plan for your career goal",
    href: "/roadmap",
    icon: MapIcon,
    color: "bg-violet-100 text-violet-600",
  },
  {
    title: "CV Analysis",
    desc: "AI-powered feedback on your resume",
    href: "/cv",
    icon: FileTextIcon,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Job Matches",
    desc: "Discover internships tailored to you",
    href: "/internships",
    icon: BriefcaseIcon,
    color: "bg-green-100 text-green-600",
  },
];

const NAV_RAIL = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/cv", label: "CV", icon: FileTextIcon },
  { href: "/internships", label: "Jobs", icon: BriefcaseIcon },
  { href: "/courses", label: "Courses", icon: BookOpenIcon },
  { href: "/roadmap", label: "Roadmap", icon: MapIcon },
  { href: "/chat", label: "Coach", icon: SparklesIcon },
];

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm your Career Coach AI. I can help with career guidance, CV feedback, course recommendations, and job matches. What would you like to explore today?",
  actions: ["Add to roadmap", "Show jobs", "Find courses"],
};

interface CareerCoachChatProps {
  compact?: boolean;
  initialQuery?: string;
}

export default function CareerCoachChat({ compact = false, initialQuery }: CareerCoachChatProps) {
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") || initialQuery;

  const [conversations] = useState<MockConversation[]>(MOCK_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState("new");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialSent = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (queryFromUrl && !initialSent.current) {
      initialSent.current = true;
      sendMessage(queryFromUrl);
    }
  }, [queryFromUrl]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = (text || input).trim();
      if (!msg || loading) return;

      const userMsg: ChatMessage = { role: "user", content: msg };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      const showCourses =
        msg.toLowerCase().includes("course") ||
        msg.toLowerCase().includes("learn") ||
        msg.toLowerCase().includes("skill");

      try {
        const history = newMessages
          .slice(0, -1)
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content }));
        const res = await chatApi.sendMessage(msg, history);
        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: res.data.reply,
          actions: showCourses
            ? ["Add to roadmap", "Confirm", "Show jobs"]
            : ["Add to roadmap", "Confirm", "Show jobs"],
          showCourses,
        };
        setMessages([...newMessages, assistantMsg]);
      } catch {
        const fallback: ChatMessage = {
          role: "assistant",
          content: showCourses
            ? "Based on your profile, here are some courses I'd recommend. You can add any of them to your learning plan!"
            : "I'd be happy to help with that! For personalized advice, try uploading your CV or setting a career goal. Meanwhile, here are some quick tips: focus on relevant skills, tailor your applications, and keep learning.",
          actions: ["Add to roadmap", "Confirm", "Show jobs"],
          showCourses,
        };
        setMessages([...newMessages, fallback]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages]
  );

  const startNewChat = () => {
    setActiveConversation("new");
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  const groupedConversations = conversations.reduce(
    (acc, c) => {
      if (!acc[c.group]) acc[c.group] = [];
      acc[c.group].push(c);
      return acc;
    },
    {} as Record<string, MockConversation[]>
  );

  const showWelcome = messages.length === 1 && messages[0].role === "assistant";

  if (compact) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} small />
          ))}
          {loading && <TypingIndicator small />}
          <div ref={bottomRef} />
        </div>
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={() => sendMessage()}
          loading={loading}
          small
        />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50">
      {/* Nav rail */}
      <aside className="hidden lg:flex flex-col w-16 bg-white border-r border-gray-200 py-4 items-center gap-2 shrink-0">
        {NAV_RAIL.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "p-2.5 rounded-xl transition-colors",
              item.href === "/chat"
                ? "bg-primary-100 text-primary-600"
                : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            )}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
          </Link>
        ))}
      </aside>

      {/* Conversations sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 shrink-0">
        <div className="p-4 border-b border-gray-100">
          <button
            type="button"
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            New conversation
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {Object.entries(groupedConversations).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                {group}
              </p>
              <div className="space-y-1">
                {items.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveConversation(c.id)}
                    className={clsx(
                      "w-full text-left px-3 py-2.5 rounded-xl transition-colors",
                      activeConversation === c.id
                        ? "bg-primary-50 text-primary-700"
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{c.preview}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main chat */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          {showWelcome && (
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-200">
                <BotIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Career Coach AI</h2>
              <p className="text-gray-500 text-sm max-w-md mx-auto">
                Your personal AI counselor for careers, skills, and opportunities
              </p>
            </div>
          )}

          {showWelcome && (
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => sendMessage(action.prompt)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-primary-200 text-primary-700 rounded-full text-sm font-medium hover:bg-primary-50 transition-colors"
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {showWelcome && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
              {FEATURE_CARDS.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary-200 hover:shadow-sm transition-all group"
                >
                  <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center mb-3", card.color)}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-primary-600">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-500">{card.desc}</p>
                </Link>
              ))}
            </div>
          )}

          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i}>
                <MessageBubble message={msg} />
                {msg.showCourses && (
                  <div className="mt-3 ml-11 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MOCK_COURSES.slice(0, 2).map((course) => (
                      <CourseCard key={course.id} course={course} variant="compact" />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-gray-200 bg-white px-4 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput
              input={input}
              setInput={setInput}
              onSend={() => sendMessage()}
              loading={loading}
            />
            <p className="text-center text-xs text-gray-400 mt-3">
              Career Coach AI can make mistakes. Verify important career decisions with professionals.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function MessageBubble({ message, small }: { message: ChatMessage; small?: boolean }) {
  const isUser = message.role === "user";

  return (
    <div className={clsx("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={clsx(
          "rounded-full flex items-center justify-center shrink-0",
          small ? "w-6 h-6" : "w-8 h-8",
          isUser ? "bg-gray-200 text-gray-600" : "bg-primary-100 text-primary-600"
        )}
      >
        {isUser ? (
          <UserIcon className={small ? "w-3 h-3" : "w-4 h-4"} />
        ) : (
          <SparklesIcon className={small ? "w-3 h-3" : "w-4 h-4"} />
        )}
      </div>
      <div className={clsx("max-w-[85%]", !isUser && !small && "ml-0")}>
        <div
          className={clsx(
            "leading-relaxed",
            small ? "text-xs px-3 py-2" : "text-sm px-4 py-3",
            isUser
              ? "bg-primary-600 text-white rounded-2xl rounded-tr-sm"
              : "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-sm"
          )}
        >
          {message.content}
        </div>
        {message.actions && message.actions.length > 0 && !isUser && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.actions.map((action) => (
              <button
                key={action}
                type="button"
                className={clsx(
                  "rounded-lg border border-primary-200 text-primary-700 hover:bg-primary-50 transition-colors font-medium",
                  small ? "text-xs px-2 py-1" : "text-xs px-3 py-1.5"
                )}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator({ small }: { small?: boolean }) {
  return (
    <div className="flex gap-3">
      <div
        className={clsx(
          "rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0",
          small ? "w-6 h-6" : "w-8 h-8"
        )}
      >
        <SparklesIcon className={small ? "w-3 h-3" : "w-4 h-4"} />
      </div>
      <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm">
        <div className="flex gap-1">
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatInput({
  input,
  setInput,
  onSend,
  loading,
  small,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  loading: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex gap-2 items-center">
      <button
        type="button"
        className={clsx(
          "rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0",
          small ? "p-2" : "p-2.5"
        )}
        aria-label="Attach file"
      >
        <PaperclipIcon className={small ? "w-3.5 h-3.5" : "w-4 h-4"} />
      </button>
      <input
        type="text"
        className={clsx("input flex-1", small && "text-xs py-2")}
        placeholder="Ask about careers, CVs, courses, jobs..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend()}
        disabled={loading}
      />
      <button
        type="button"
        onClick={onSend}
        disabled={loading || !input.trim()}
        className={clsx(
          "btn-primary flex items-center gap-2 shrink-0",
          small ? "px-3 py-2 text-xs" : "px-5"
        )}
      >
        <SendIcon className={small ? "w-3.5 h-3.5" : "w-4 h-4"} />
        {!small && "Send"}
      </button>
    </div>
  );
}
