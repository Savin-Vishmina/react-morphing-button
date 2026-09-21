# Morphing Button Demo

This repository is a minimal Next.js demonstration of a Draggable Morphing Button. It provides a floating, draggable button that snaps to screen edges and perfectly expands into a full-screen interactive modal.

## Dependencies
To use this code in your own project, make sure you explicitly install the following dependencies:
- **framer-motion** (for drag physics and constraints)
- **lucide-react** (for icons)
- **Tailwind CSS** (for styling)

Install them via npm:
```bash
npm install framer-motion lucide-react
```
*(Tailwind CSS is assumed to be already configured in your project, if not, follow [Tailwind CSS Next.js setup guide](https://tailwindcss.com/docs/guides/nextjs))*

## Running the Demo

1. Clone this repository
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)

---

# Building a Draggable Morphing Button in Next.js

This guide explains how to build a floating, draggable button that snaps to the screen edges, and perfectly expands into a full-screen modal.

## The Challenge
Creating an iOS-style expanding modal that originates from a draggable button is tricky. If you use standard DOM morphing (like Framer Motion's `layoutId`), the browser has to recalculate flexbox layouts and text-wrapping 60 times a second, causing massive lag on mobile devices.

Additionally, locking a button to absolute screen coordinates (`top`, `left`) causes jitter on mobile browsers when the dynamic URL bar hides during scrolling.

## The Solution
1.  **Draggable FAB**: We anchor the button to the bottom right (`bottom-6 right-6`) so it glides natively with mobile scroll bars. We use Framer Motion only for drag constraints and spring physics.
2.  **Absolute Measurement**: When clicked, we use `getBoundingClientRect()` to measure the exact pixel center of the button, bypassing all CSS layout offsets.
3.  **High Performance Modal**: We use standard CSS `transform: scale()` starting from the exact pixel center of the button (`transform-origin`). This scales a flattened texture, resulting in a buttery smooth 60fps animation without a single layout reflow.
4.  **Handoff Orchestration**: We crossfade the button's visibility synchronously with the modal's scale animation for a continuous illusion.

---

## Step 1: The Parent Component

The parent component orchestrates the state. Note that the `DraggableFAB` is **never unmounted** — it is only visually hidden when the modal opens, ensuring it remembers its exact drag coordinates.

```tsx
"use client";

import { useState } from "react";
import { MorphingModal } from "@/components/MorphingModal";
import { DraggableFAB } from "@/components/DraggableFAB";

export default function MenuPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFABHidden, setIsFABHidden] = useState(false);
  // Stores the absolute screen-center pixel of the FAB button for transform-origin
  const [fabCenter, setFabCenter] = useState<{x: number, y: number} | null>(null);
  
  return (
    <div className="min-h-screen bg-black">
      <DraggableFAB 
        isHidden={isFABHidden}
        onOpen={(center) => {
          setFabCenter(center);
          setIsFABHidden(true);
          setIsModalOpen(true);
        }}
      />
      
      {isModalOpen && (
        <MorphingModal 
          originPos={fabCenter}
          onStartClose={() => setIsFABHidden(false)} // Fire immediately to sync fade-in
          onClose={() => setIsModalOpen(false)} // Unmount modal after animation
        />
      )}
    </div>
  );
}
```

---

## Step 2: The Draggable FAB

The `DraggableFAB` handles the physics and the crucial `getBoundingClientRect()` measurement.

```tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { motion, useMotionValue, animate } from "framer-motion";

interface DraggableFABProps {
  onOpen: (center: { x: number; y: number }) => void;
  isHidden?: boolean;
}

export function DraggableFAB({ onOpen, isHidden }: DraggableFABProps) {
  const [mounted, setMounted] = useState(false);
  const [constraints, setConstraints] = useState({ top: -800, left: -400, right: 0, bottom: 0 });
  const btnRef = useRef<HTMLDivElement>(null);
  
  // Offsets relative to the CSS anchor (bottom-6 right-6)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  useEffect(() => {
    // Dynamic constraint calculation based on viewport
    setConstraints({
      top: -(window.innerHeight - 150),
      left: -(window.innerWidth - 72),
      right: 0,
      bottom: 0
    });
    setMounted(true);
  }, []);

  const handleClick = () => {
    // Use getBoundingClientRect to get the EXACT pixel center of the button on screen
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      onOpen(center);
    }
  };

  if (!mounted) return null;

  return (
    <motion.div
      style={{ 
        x, 
        y,
        opacity: isHidden ? 0 : 1,
        pointerEvents: isHidden ? "none" : "auto",
        transition: "opacity 400ms ease", // Start fading in immediately as modal closes
      }} 
      drag={!isHidden}
      dragConstraints={constraints}
      dragElastic={0.1} 
      dragMomentum={false} 
      onDragEnd={() => {
        const currentX = x.get();
        const midpoint = -(window.innerWidth / 2) + 28;
        
        // Edge Snap Logic
        if (currentX < midpoint) {
          const leftEdgeOffset = -(window.innerWidth - 56 - 48);
          animate(x, leftEdgeOffset, { type: "spring", stiffness: 300, damping: 25 });
        } else {
          animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
        }
      }}
      whileHover={!isHidden ? { scale: 1.05 } : {}}
      whileTap={!isHidden ? { scale: 0.9 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      // Anchored to bottom right to glide natively with mobile browser URL bar shifts
      className="fixed z-[9999] touch-none bottom-6 right-6"
      onClick={handleClick}
    >
      <div 
        ref={btnRef}
        className="relative w-14 h-14 p-[1.5px] rounded-full overflow-hidden group cursor-pointer shadow-[0_0_15px_rgba(238,199,119,0.3)]"
      >
        <div className="absolute top-1/2 left-1/2 w-[300%] aspect-square -translate-x-1/2 -translate-y-1/2 animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#1e1e1e_0%,#eec777_50%,#1e1e1e_100%)] opacity-90"></div>
        <div className="relative w-full h-full bg-[#1e1e1e] rounded-full flex items-center justify-center z-10">
          <Sparkles className="w-6 h-6 text-[#eec777]" />
        </div>
      </div>
    </motion.div>
  );
}
```

---

## Step 3: The Expanding Modal

The modal scales up using pure CSS transitions anchored precisely to the `originPos` we measured.

```tsx
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
