import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "CareerCure — AI-Powered Career Development",
  description:
    "CareerCure helps students and fresh graduates navigate their career journey with AI-powered CV analysis, personalised roadmaps, and an intelligent career counselor chatbot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
