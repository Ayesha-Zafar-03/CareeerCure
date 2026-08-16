"use client";

import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  speed = 50,
  startDelay = 0,
  className = "",
  onComplete,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (startDelay > 0) {
      const delayTimer = setTimeout(() => {
        startTyping();
      }, startDelay);
      return () => clearTimeout(delayTimer);
    }
    startTyping();
  }, [text, speed, startDelay]);

  const startTyping = () => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);
    return () => clearInterval(timer);
  };

  return (
    <span className={className}>
      {displayText}
      {!isComplete && <span className="animate-pulse text-primary">|</span>}
    </span>
  );
}

interface TypewriterSequenceProps {
  lines: string[];
  speed?: number;
  lineDelay?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypewriterSequence({
  lines,
  speed = 50,
  lineDelay = 1000,
  className = "",
  onComplete,
}: TypewriterSequenceProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentLineIndex >= lines.length) {
      setIsComplete(true);
      onComplete?.();
      return;
    }

    const currentLine = lines[currentLineIndex];
    let i = 0;

    const lineTimer = setInterval(() => {
      if (i < currentLine.length) {
        setDisplayText(currentLine.slice(0, i + 1));
        i++;
      } else {
        clearInterval(lineTimer);
        const nextLineDelay = setTimeout(() => {
          setCurrentLineIndex((prev) => prev + 1);
          setDisplayText("");
        }, lineDelay);
        return () => clearTimeout(nextLineDelay);
      }
    }, speed);

    return () => clearInterval(lineTimer);
  }, [currentLineIndex, lines, speed, lineDelay]);

  return (
    <div className={className}>
      {lines.slice(0, currentLineIndex).map((line, index) => (
        <div key={index} className="opacity-100">
          {line}
        </div>
      ))}
      <div className="relative">
        {displayText}
        {!isComplete && currentLineIndex < lines.length && (
          <span className="animate-pulse text-primary">|</span>
        )}
      </div>
    </div>
  );
}