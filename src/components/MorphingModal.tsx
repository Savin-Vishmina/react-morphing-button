"use client";

import { useState, useEffect } from "react";
import { X, ArrowUp } from "lucide-react";

interface MorphingModalProps {
  onClose: () => void;
  onStartClose: () => void;
  originPos?: { x: number; y: number } | null;
}

export function MorphingModal({ onClose, onStartClose, originPos }: MorphingModalProps) {
  const [visible, setVisible] = useState(false);

  // Delay slightly so the CSS transition triggers
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  // Modal close animation sequence
  const handleClose = () => {
    onStartClose();           // 1. Show FAB
    setVisible(false);        // 2. Shrink modal
    setTimeout(onClose, 500); // 3. Unmount after animation
  };

  // Set the CSS transform origin to the FAB's exact position
  const transformOrigin = originPos
    ? `${originPos.x}px ${originPos.y}px`
    : "center center";

  return (
    <>
      <div
        className="fixed inset-0 z-[190]"
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          backdropFilter: visible ? "blur(4px)" : "blur(0px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 500ms ease, backdrop-filter 500ms ease",
        }}
        onClick={handleClose}
      />

      {/* 
        Scale Wrapper 
        Scales the entire screen area down to the FAB button position.
      */}
      <div
        className="fixed inset-0 z-[200] flex flex-col justify-end items-center pb-6 px-4 pt-16 pointer-events-none"
        style={{
          transformOrigin,
          transform: visible ? "scale(1)" : "scale(0)",
          opacity: visible ? 1 : 0,
          // Apple-style spring animation
          transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease",
        }}
      >
        <div
          className="w-full max-w-[450px] bg-[#161616]/80 backdrop-blur-xl flex flex-col gap-4 relative h-[70vh] rounded-3xl overflow-hidden pointer-events-auto shadow-2xl shadow-black/50 border border-white/10 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center pb-4 border-b border-white/10">
            <h2 className="text-white font-semibold">Interactive Modal</h2>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center text-gray-300 hover:bg-[#333] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto text-gray-300 space-y-4">
             <p>
               This is a highly performant, fully custom modal that morphed out of the floating action button. 
             </p>
             <p>
               Because it uses optimized CSS transforms (scale) instead of layout changes, it hits a buttery-smooth 60 frames per second on mobile devices without any layout thrashing.
             </p>
             <p>
               You can put any generic text, forms, or content in here!
             </p>
          </div>
        </div>
      </div>
    </>
  );
}
