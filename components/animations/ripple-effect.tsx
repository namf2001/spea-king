"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function RippleEffect({ className, color = "white" }: { className?: string, color?: string }) {
  const [ripples, setRipples] = useState<{ id: number; delay: number }[]>([]);
  
  useEffect(() => {
    // Create initial ripples
    setRipples([
      { id: 1, delay: 0 },
      { id: 2, delay: 1 },
      { id: 3, delay: 2 },
    ]);

    // Add new ripples periodically
    const interval = setInterval(() => {
      setRipples(prev => {
        const newId = Math.max(...prev.map(r => r.id), 0) + 1;
        // Keep last 5 ripples to avoid too many DOM elements
        return [...prev.slice(-4), { id: newId, delay: 0 }];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn("relative w-full h-full", className)}>
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className={`absolute inset-0 rounded-full border-2 opacity-0`}
          style={{
            borderColor: color === "white" ? "rgba(255, 255, 255, 0.15)" : 
                        color === "blue" ? "rgba(59, 130, 246, 0.15)" : 
                        color === "cyan" ? "rgba(34, 211, 238, 0.15)" : 
                        "rgba(255, 255, 255, 0.15)",
            animation: `rippleExpand 4s ease-out forwards`,
            animationDelay: `${ripple.delay}s`,
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes rippleExpand {
          0% {
            transform: scale(0.3);
            opacity: 0.7;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}