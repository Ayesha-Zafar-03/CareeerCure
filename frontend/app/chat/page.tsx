"use client";

import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import CareerCoachChat from "@/components/career-coach/CareerCoachChat";
import ChatWidget from "@/components/ChatWidget";

function ChatContent() {
  return <CareerCoachChat />;
}

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center h-96 text-gray-500">Loading...</div>}>
        <ChatContent />
      </Suspense>
      <ChatWidget hideFab />
    </ProtectedRoute>
  );
}
